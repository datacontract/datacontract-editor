# GitHub server adapter

This example connects the Data Contract Editor to YAML files stored in GitHub without adding GitHub-specific code to the editor.

```text
Data Contract Editor  ->  github-server.js  ->  GitHub REST API
                         (keeps the token server-side)
```

The adapter implements the editor's existing `SERVER` storage API. It is different from the editor's built-in GitHub proxy API, which uses `/github/file` and `/github/pull-request` endpoints.

## Prerequisites

- Node.js 22.22 or newer
- A GitHub repository containing the data contract, unless using direct commit mode to create it
- A GitHub token with access to that repository

For a fine-grained token, grant:

- `Contents: Read and write` for both commit and pull-request modes
- `Pull requests: Read and write` for `pull-request` mode

For a classic token, use `public_repo` for public repositories or `repo` for private repositories.

## Start the adapter

Run this command from the repository root:

```bash
GITHUB_TOKEN=github_pat_xxx \
GITHUB_SAVE_MODE=commit \
ALLOWED_ORIGIN=http://localhost:5173 \
node examples/github-server/github-server.js
```

The adapter listens on `http://localhost:4001` by default. Use `PORT` to select another port:

```bash
PORT=4002 GITHUB_TOKEN=github_pat_xxx \
node examples/github-server/github-server.js
```

Do not commit the token or expose it in frontend JavaScript. The browser only communicates with this adapter.

## Start the frontend

The GitHub example has its own Vite launcher and consumes the editor bundle generated in the repository root. Build that bundle first, then start the frontend from this directory:

```bash
cd ../..
npm install
npm run build
cd examples/github-server
npm install
npm run dev
```

Open `http://localhost:5173/` with the `owner`, `repo`, `path`, and optional `branch`/`server` query parameters shown below. Keep the adapter running in a second terminal. This page uses the editor's `EMBEDDED` mode while its backend reads and saves the selected file through the GitHub adapter.

## Configuration

| Variable | Default | Description |
| --- | --- | --- |
| `GITHUB_TOKEN` | none | Required token used by the adapter to call GitHub |
| `GITHUB_SAVE_MODE` | `commit` | `commit` pushes directly; `pull-request` creates a branch and opens a PR |
| `GITHUB_API_BASE_URL` | `https://api.github.com` | GitHub API base URL; use the `/api/v3` URL for GitHub Enterprise Server |
| `ALLOWED_ORIGIN` | `*` | Browser origin allowed to call the adapter; restrict this in deployed environments |
| `PORT` | `4001` | HTTP port for the adapter |

`GITHUB_SAVE_MODE` is read when the process starts. Restart the adapter after changing it.
The repository owner, repository name, branch, and contract path are supplied by each request URL.
The adapter does not maintain a repository allowlist; restrict access with the token's GitHub permissions.

## Configure the editor

This adapter targets the editor's `ServerFileStorageBackend`. The backend URL must point to the adapter, for example `http://localhost:4001`.

### Embedded editor

When using the editor source or a host build that exposes `ServerFileStorageBackend`, pass the backend through the embed API:

```js
import { init } from './src/embed.jsx';
import { ServerFileStorageBackend } from './src/services/ServerFileStorageBackend.js';

const backend = new ServerFileStorageBackend(
  'http://localhost:4001/repos/my-org/my-contracts/main'
);

init({
  container: '#datacontract-editor',
  mode: 'SERVER',
  backend,
});
```

The editor then loads and saves through the adapter. The editor's normal form, YAML, preview, and validation features remain unchanged.

### Standalone editor build

`src/main.jsx` selects the local `standalone` backend; the runtime `mode` setting alone does not switch it to `ServerFileStorageBackend`. Wire the standalone entry point to `ServerFileStorageBackend` yourself, or use the embedded configuration above (or the ready-to-run multi-repo example below).

### Multi-repo example (embedded)

[`index.html`](./index.html) is a ready-to-run embedded page that targets one specific GitHub file picked from its own URL, using the adapter's repository-qualified routes (`/repos/:owner/:repo/:branch/files/:filename`, see below):

```bash
npm run dev
# then open:
# http://localhost:5173/?owner=my-org&repo=my-contracts&path=contracts/orders/datacontract.yaml&branch=main
```

| Param | Required | Default | Description |
| --- | --- | --- | --- |
| `owner` | yes | - | GitHub user or organization |
| `repo` | yes | - | Repository name |
| `path` | yes | - | File path within the repository |
| `branch` | no | `main` | Branch to read from and commit to |
| `server` | no | `http://localhost:4001` | Adapter base URL |

The same running adapter/token can serve any repository the token can access. The `server` query parameter overrides the default adapter URL and may be absolute or relative to the frontend origin. The Vite setup consumes `../../dist/datacontract-editor.es.js` and `../../dist/datacontract-editor.css`, so rebuild the root editor bundle after changing editor source files. Use `npm run build` followed by `npm run preview` to serve the example's production build.

## Save modes

### Direct commit

This is the default:

```bash
GITHUB_SAVE_MODE=commit \
GITHUB_TOKEN=github_pat_xxx \
node examples/github-server/github-server.js
```

Saving the contract updates the branch selected in the request URL. The adapter uses the file SHA returned by GitHub to prevent overwriting a newer version. If the file does not exist, the Contents API creates it.

### Pull request

```bash
GITHUB_SAVE_MODE=pull-request \
GITHUB_TOKEN=github_pat_xxx \
node examples/github-server/github-server.js
```

Saving the contract:

1. Reads the base branch SHA.
2. Creates a branch named `datacontract-editor/<timestamp>`.
3. Commits the new content to that branch.
4. Opens a pull request against the branch selected in the request URL.

The pull-request URL is printed in the adapter console. The configured file must already exist when using this mode because the adapter needs its SHA on the new branch.

The commit and pull-request title is currently fixed to `Update data contract via datacontract-editor`.

## HTTP API

The adapter maps the editor's generic server API to a GitHub repository selected by each request. The repository-qualified route is the only data route: `:owner`, `:repo`, and `:branch` identify the GitHub target, while `:filename` is a relative path from the repository root, including nested paths. `:owner`, `:repo`, and `:branch` may only contain letters, digits, `.`, `_`, and `-` (branch names containing `/` are not supported by this route).

| Request | Response | Description |
| --- | --- | --- |
| `GET /health` | `{ "status": "ok" }` | Health check |
| `GET /repos/:owner/:repo/:branch/files/:filename` | `text/yaml` | Loads `:filename` from `:owner/:repo` at `:branch` |
| `PUT /repos/:owner/:repo/:branch/files/:filename` with raw YAML | `{ "filename": "...", "owner": "...", "repo": "...", "branch": "..." }` | Saves `:filename` to `:owner/:repo` at `:branch` |

Example checks:

```bash
curl http://localhost:4001/health
curl http://localhost:4001/repos/my-org/my-contracts/main/files/contracts/orders/datacontract.yaml
```

To exercise a save manually:

```bash
curl -X PUT http://localhost:4001/repos/my-org/my-contracts/main/files/contracts/orders/datacontract.yaml \
  -H 'Content-Type: text/yaml' \
  --data-binary @datacontract.yaml
```

## GitHub Enterprise Server

Set `GITHUB_API_BASE_URL` to the GitHub Enterprise API root, normally ending in `/api/v3`:

```bash
GITHUB_API_BASE_URL=https://github.example.com/api/v3 \
GITHUB_TOKEN=github_pat_xxx \
node examples/github-server/github-server.js
```

The GitHub Enterprise hostname must also be reachable by the machine running the adapter.

## Troubleshooting

- `GITHUB_TOKEN is required but not set`: set `GITHUB_TOKEN` in the environment of the adapter process.
- `401`: the token is invalid, expired, or not accepted by the configured GitHub host.
- `403`: the token does not have the required repository permission.
- `404`: check the owner, repository, branch, and filename in the request URL; for private repositories, a missing permission can also appear as `404`.
- Browser CORS errors: set `ALLOWED_ORIGIN` to the exact origin of the editor, including scheme and port, for example `http://localhost:5173`.
- `409`: the file changed in GitHub after it was loaded. Reload the editor and save again.
- Pull request creation fails: verify `Contents` and `Pull requests` write permissions and make sure the requested file exists on the base branch.
- `400` on a `/repos/:owner/:repo/:branch/...` request: `:owner`, `:repo`, or `:branch` contains characters other than letters, digits, `.`, `_`, or `-` - this route does not support branch names containing `/`.
- `404` for `/example` or `/files/...`: those fixed-target routes are not supported; include the owner, repository, and branch in the request URL.

The adapter always uses a single GitHub identity (`GITHUB_TOKEN`). The repository-qualified routes let that token serve any repository it can access. Other storage systems can implement the same editor server API independently without changes to the editor core.
