import { isSemanticAuthDef } from '../utils/authDefTypes.js';
import { isInternalUrl, toAbsoluteUrl } from './urlUtils.js';

/**
 * Recursively walk a parsed contract and collect absolute URLs of
 * authoritativeDefinitions entries that are resolvable internal definitions.
 *
 * An entry qualifies when it is a semantic/business definition
 * (type 'semantics' | 'semantic' | 'definition'), has a url, and the url is
 * internal (same host). Collected urls are normalized to absolute and de-duped.
 *
 * @param {*} yamlParts - parsed contract (any nested structure; null-safe)
 * @returns {string[]} de-duplicated absolute urls (stable order)
 */
export function collectAuthoritativeDefinitionUrls(yamlParts) {
  const urls = [];
  const seen = new Set();

  const addEntry = (entry) => {
    if (!entry || typeof entry !== 'object') return;
    const qualifies = isSemanticAuthDef(entry) || entry.type === 'definition';
    if (!qualifies || !entry.url || !isInternalUrl(entry.url)) return;
    const abs = toAbsoluteUrl(entry.url);
    if (!abs || seen.has(abs)) return;
    seen.add(abs);
    urls.push(abs);
  };

  const walk = (node) => {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    for (const [key, value] of Object.entries(node)) {
      if (key === 'authoritativeDefinitions' && Array.isArray(value)) {
        value.forEach(addEntry);
      } else {
        walk(value);
      }
    }
  };

  walk(yamlParts);
  return urls;
}

/**
 * Batch-fetch definitions. POST { urls } to batchSemanticsUrl, expecting a
 * url-keyed map { url: definitionData } in response.
 *
 * @param {string} batchSemanticsUrl
 * @param {string[]} urls - absolute urls
 * @param {string} [acceptHeader]
 * @returns {Promise<Object>} url-keyed map
 * @throws on network error or non-ok response
 */
export async function fetchAuthoritativeDefinitionsBatch(batchSemanticsUrl, urls, acceptHeader = 'application/json') {
  const response = await fetch(batchSemanticsUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: acceptHeader || 'application/json',
    },
    body: JSON.stringify({ urls }),
  });
  if (!response.ok) {
    throw new Error(`Batch definitions fetch failed: ${response.status} ${response.statusText}`);
  }
  return await response.json();
}
