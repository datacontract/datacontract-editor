/**
 * API utility for the assets browse panel: the tables available on the
 * servers of the edited contract.
 */

/**
 * POST the servers of the current document and get the assets per server.
 *
 * Expected response shape (one entry per posted server, in order):
 * [{
 *   server, type,
 *   assets: [{ externalId, name, type, description, iconUrl, physicalName, properties: [...] }]
 * }]
 *
 * @param {string} url - Full URL of the server assets endpoint
 * @param {Array} servers - The `servers` array of the current document
 * @returns {Promise<Array>}
 */
export async function fetchServerAssets(url, servers) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ servers }),
  });
  if (!response.ok) {
    throw new Error(`Server assets fetch failed: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

/**
 * GET one slice of the asset catalog, for a document without servers: the
 * top level of the asset tree, the children of `parent`, or the assets
 * matching `query`. The host caps every slice, so the whole catalog is never
 * loaded at once.
 *
 * Expected response shape:
 * { assets: [{ externalId, name, type, description, iconUrl, physicalName, properties: [...], hasChildren }], truncated }
 *
 * @param {string} url - Full URL of the catalog endpoint
 * @param {{ parent?: string, query?: string }} params
 * @returns {Promise<{ assets: Array, truncated: boolean }>}
 */
export async function fetchCatalogAssets(url, { parent, query } = {}) {
  const params = new URLSearchParams();
  if (parent) params.set('parent', parent);
  if (query) params.set('query', query);
  const separator = url.includes('?') ? '&' : '?';
  const target = params.size > 0 ? `${url}${separator}${params}` : url;
  const response = await fetch(target, { headers: { Accept: 'application/json' } });
  if (!response.ok) {
    throw new Error(`Catalog assets fetch failed: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  return {
    assets: Array.isArray(data?.assets) ? data.assets : [],
    truncated: Boolean(data?.truncated),
  };
}
