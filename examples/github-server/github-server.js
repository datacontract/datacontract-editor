/**
 * GitHub adapter for the datacontract-editor SERVER mode.
 *
 * Implements repository-qualified SERVER-mode endpoints so the editor can read
 * and write data-contract files stored in GitHub - with no changes to the editor.
 *
 * Usage:
 *   GITHUB_TOKEN=ghp_xxx node examples/github-server/github-server.js
 *
 * Editor config:
 *   mode: SERVER
 *   serverBaseUrl: http://localhost:4001/repos/my-org/my-repo/main
 *
 * Environment variables:
 *   GITHUB_TOKEN         - required: personal access token (repo or public_repo scope)
 *   GITHUB_SAVE_MODE     - default: commit  |  'pull-request' opens a PR instead
 *   GITHUB_API_BASE_URL  - default: https://api.github.com (override for GitHub Enterprise)
 *   ALLOWED_ORIGIN       - CORS origin, default: * (restrict in production)
 *   PORT                 - default: 4001
 *
 * The repository, branch, and file path are supplied in every data request through
 * /repos/:owner/:repo/:branch/files/:filename, so one running adapter/token can serve
 * several repositories - e.g. from the editor: ?owner=my-org&repo=my-repo&path=a/b.yaml.
 */

import { Buffer } from 'node:buffer';
import { createServer } from 'node:http';
import process from 'node:process';

const TOKEN = process.env.GITHUB_TOKEN;
const API_BASE = (process.env.GITHUB_API_BASE_URL || 'https://api.github.com').replace(/\/$/, '');
// 'commit' pushes directly to the requested branch; 'pull-request' opens a PR from a new branch
const SAVE_MODE = process.env.GITHUB_SAVE_MODE || 'commit';
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*';
const PORT = process.env.PORT || 4001;
const SUPPORTED_SAVE_MODES = new Set(['commit', 'pull-request']);
// GitHub owner/repo/branch names, kept narrow since these values are placed directly into
// GitHub API URL path segments and come from the request.
const SAFE_IDENTIFIER_RE = /^[A-Za-z0-9._-]+$/;

if (!SUPPORTED_SAVE_MODES.has(SAVE_MODE)) {
  throw new Error(`GITHUB_SAVE_MODE must be one of: ${[...SUPPORTED_SAVE_MODES].join(', ')}`);
}

const toBase64 = (s) => Buffer.from(s, 'utf-8').toString('base64');
const fromBase64 = (s) => Buffer.from(s.replace(/\n/g, ''), 'base64').toString('utf-8');
const log = (...a) => console.log(new Date().toISOString(), ...a);

// GitHub requires the current file SHA when updating an existing file.
const cachedShas = new Map();

function githubHeaders() {
  if (!TOKEN) {
    const err = new Error('GITHUB_TOKEN is required but not set');
    err.statusCode = 401;
    throw err;
  }
  return {
    Authorization: `Bearer ${TOKEN}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json',
  };
}

async function ghFetch(label, path, init = {}) {
  const url = `${API_BASE}${path}`;
  let res;
  try {
    res = await fetch(url, { ...init, headers: githubHeaders() });
  } catch (networkErr) {
    // fetch (undici) rejects on DNS/connection/TLS failures with the real reason in `cause`
    const causeCode = networkErr.cause?.code;
    const cause = causeCode ? ` (${causeCode})` : networkErr.cause ? ` (${networkErr.cause.message || networkErr.cause})` : '';
    log(`[github] ERROR ${label}: ${init.method || 'GET'} ${url} -> network error: ${networkErr.message}${cause}`);
    if (['UNABLE_TO_GET_ISSUER_CERT_LOCALLY', 'SELF_SIGNED_CERT_IN_CHAIN', 'DEPTH_ZERO_SELF_SIGNED_CERT'].includes(causeCode)) {
      log('[hint] Node does not trust the TLS certificate presented for api.github.com - likely a corporate proxy (Zscaler/Netskope/etc.) doing TLS inspection. Export that proxy\'s root CA as a .pem and rerun with NODE_EXTRA_CA_CERTS=/path/to/ca.pem');
    }
    const err = new Error(`GitHub ${label}: network error reaching ${API_BASE}: ${networkErr.message}${cause}`);
    err.statusCode = 502;
    throw err;
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const detail = body.errors ? ` - ${JSON.stringify(body.errors)}` : '';
    const msg = (body.message || `${res.status} ${res.statusText}`) + detail;
    log(`[github] ERROR ${label}: ${init.method || 'GET'} ${url} -> ${res.status}: ${msg}${body.documentation_url ? ` (${body.documentation_url})` : ''}`);
    const err = new Error(`GitHub ${label}: ${msg}`);
    err.statusCode = [401, 403, 404, 409, 422].includes(res.status) ? res.status : 500;
    throw err;
  }
  log(`[github] OK ${label}: ${res.status}`);
  return res;
}

function encodeRepoPath(filePath) {
  return filePath.split('/').map((segment) => encodeURIComponent(segment)).join('/');
}

function repoKey(owner, repo, branch, filePath) {
  return `${owner}/${repo}/${branch}/${filePath}`;
}

function contentsPath(filePath, { owner, repo, branch }) {
  return `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${encodeRepoPath(filePath)}?ref=${encodeURIComponent(branch)}`;
}

function invalidRequest(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

function decodeAndValidateFilename(encodedFilename) {
  if (!encodedFilename) return null;

  let filename;
  try {
    filename = decodeURIComponent(encodedFilename);
  } catch {
    throw invalidRequest('Filename contains invalid URL encoding');
  }

  const segments = filename.split('/');
  if (
    !filename
    || filename.startsWith('/')
    || filename.endsWith('/')
    || filename.includes('\0')
    || filename.includes('\\')
    || segments.some((segment) => !segment || segment === '.' || segment === '..')
  ) {
    throw invalidRequest('Filename must be a relative path to a repository file');
  }

  return filename;
}

// Matches /repos/:owner/:repo/:branch/files/:filename - the route that lets the browser
// pick the GitHub target per request.
const REPO_ROUTE_RE = /^\/repos\/([^/]+)\/([^/]+)\/([^/]+)\/files\/(.+)$/;

function parseRepoRoute(pathname) {
  const match = REPO_ROUTE_RE.exec(pathname);
  if (!match) return null;

  const [, encodedOwner, encodedRepo, encodedBranch, encodedFilename] = match;
  let owner, repo, branch;
  try {
    owner = decodeURIComponent(encodedOwner);
    repo = decodeURIComponent(encodedRepo);
    branch = decodeURIComponent(encodedBranch);
  } catch {
    throw invalidRequest('Owner, repo, or branch contains invalid URL encoding');
  }

  for (const [label, value] of [['Owner', owner], ['Repo', repo], ['Branch', branch]]) {
    if (!SAFE_IDENTIFIER_RE.test(value)) {
      throw invalidRequest(`${label} contains invalid characters (branch names with "/" are not supported in this URL scheme)`);
    }
  }

  const filename = decodeAndValidateFilename(encodedFilename);
  if (!filename) return null;

  return { owner, repo, branch, filename };
}

async function loadFromGitHub(filePath, ctx) {
  const { owner, repo, branch } = ctx;
  const res = await ghFetch('load', contentsPath(filePath, { owner, repo, branch }));
  const data = await res.json();
  cachedShas.set(repoKey(owner, repo, branch, filePath), data.sha);
  return fromBase64(data.content);
}

// fetch current sha if not cached (first save without a prior load)
async function resolveSha(filePath, ctx) {
  const { owner, repo, branch } = ctx;
  const key = repoKey(owner, repo, branch, filePath);
  const cachedSha = cachedShas.get(key);
  if (cachedSha) return cachedSha;
  try {
    await loadFromGitHub(filePath, ctx);
    return cachedShas.get(key) || null;
  } catch (err) {
    if (err.statusCode === 404) return null; // file doesn't exist yet - will be created
    throw err;
  }
}

async function commitToGitHub(filePath, content, message, ctx) {
  const { owner, repo, branch } = ctx;
  const sha = await resolveSha(filePath, ctx);
  const body = { message, content: toBase64(content), branch };
  if (sha) body.sha = sha;
  const res = await ghFetch('commit', contentsPath(filePath, { owner, repo, branch }).split('?')[0], {
    method: 'PUT',
    body: JSON.stringify(body),
  });
  const data = await res.json();
  cachedShas.set(repoKey(owner, repo, branch, filePath), data.content.sha);
  log(`[commit] ${data.commit.html_url}`);
}

async function openPullRequest(filePath, content, message, ctx) {
  const { owner, repo, branch } = ctx;
  const ownerRepo = `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
  const refRes = await ghFetch('getRef', `${ownerRepo}/git/ref/heads/${encodeURIComponent(branch)}`);
  const { object: { sha: baseSha } } = await refRes.json();
  const newBranch = `datacontract-editor/${Date.now()}`;

  await ghFetch('createBranch', `${ownerRepo}/git/refs`, {
    method: 'POST',
    body: JSON.stringify({ ref: `refs/heads/${newBranch}`, sha: baseSha }),
  });

  const fileRes = await ghFetch('getFileSha', contentsPath(filePath, { owner, repo, branch: newBranch }));
  const { sha: fileSha } = await fileRes.json();

  await ghFetch('pushCommit', contentsPath(filePath, { owner, repo, branch }).split('?')[0], {
    method: 'PUT',
    body: JSON.stringify({ message, content: toBase64(content), sha: fileSha, branch: newBranch }),
  });

  const prRes = await ghFetch('createPR', `${ownerRepo}/pulls`, {
    method: 'POST',
    body: JSON.stringify({ title: message, head: newBranch, base: branch }),
  });
  const pr = await prRes.json();
  log(`[pr] opened #${pr.number}: ${pr.html_url}`);
}

async function saveToGitHub(filePath, content, ctx) {
  const message = 'Update data contract via datacontract-editor';
  if (SAVE_MODE === 'pull-request') {
    await openPullRequest(filePath, content, message, ctx);
  } else {
    await commitToGitHub(filePath, content, message, ctx);
  }
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks);
}

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (ALLOWED_ORIGIN !== '*') res.setHeader('Vary', 'Origin');
}

function sendJson(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}

createServer(async (req, res) => {
  setCors(res);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const { pathname } = new URL(req.url, `http://${req.headers.host}`);

  try {
    if (pathname === '/health' && req.method === 'GET') {
      sendJson(res, 200, { status: 'ok' });
      return;
    }

    const repoRoute = parseRepoRoute(pathname);

    if (repoRoute && req.method === 'GET') {
      const content = await loadFromGitHub(repoRoute.filename, repoRoute);
      res.writeHead(200, { 'Content-Type': 'text/yaml; charset=utf-8' });
      res.end(content);
      return;
    }

    if (repoRoute && req.method === 'PUT') {
      const content = (await readBody(req)).toString('utf-8');
      if (!content.trim()) {
        throw invalidRequest('Request body must contain YAML content');
      }
      await saveToGitHub(repoRoute.filename, content, repoRoute);
      sendJson(res, 200, {
        filename: repoRoute.filename,
        owner: repoRoute.owner,
        repo: repoRoute.repo,
        branch: repoRoute.branch,
      });
      return;
    }

    sendJson(res, 404, { error: 'Not found' });
  } catch (err) {
    // Keep detailed diagnostics in the adapter console without exposing internals to the browser.
    log(`[error] ${req.method} ${pathname} -> ${err.statusCode || 500}: ${err.message}`);
    if (err.stack) log(err.stack);
    sendJson(res, err.statusCode || 500, { error: err.message });
  }
}).listen(PORT, () => {
  if (!TOKEN) console.warn('[warn] GITHUB_TOKEN is not set - all GitHub calls will fail');
  console.log(`github-server listening on :${PORT}`);
  console.log('  routes    : /repos/:owner/:repo/:branch/files/:filename');
  console.log(`  save mode : ${SAVE_MODE}`);
  console.log(`  CORS      : ${ALLOWED_ORIGIN}`);
  console.log(`  configure : mode=SERVER, serverBaseUrl=http://localhost:${PORT}/repos/<owner>/<repo>/<branch>`);
});
