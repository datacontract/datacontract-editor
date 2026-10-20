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
 * GET one slice of the asset catalog, for a document without servers or an
 * incomplete server: the top level of the asset tree, the children of
 * `parent`, or the assets matching `query`, limited to the assets of
 * `serverType` when given. The host caps every slice, so the whole catalog is
 * never loaded at once.
 *
 * Expected response shape:
 * { assets: [{ externalId, name, type, description, iconUrl, physicalName, properties: [...], hasChildren }], truncated }
 *
 * @param {string} url - Full URL of the catalog endpoint
 * @param {{ parent?: string, query?: string, serverType?: string }} params
 * @returns {Promise<{ assets: Array, truncated: boolean }>}
 */
export async function fetchCatalogAssets(url, { parent, query, serverType } = {}) {
  const response = await fetch(withParams(url, { parent, query, serverType }), { headers: { Accept: 'application/json' } });
  if (!response.ok) {
    throw new Error(`Catalog assets fetch failed: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  return {
    assets: Array.isArray(data?.assets) ? data.assets : [],
    truncated: Boolean(data?.truncated),
  };
}

/**
 * GET the servers available through the asset catalog, for the server
 * typeahead: one per container asset (schema, dataset, database) matching
 * `query`, limited to `serverType` when given. A blank query returns the
 * first containers.
 *
 * Expected response shape:
 * [{ assetExternalId, name, qualifiedName, assetType, iconUrl, server: { type, ...location, customProperties } }]
 *
 * @param {string} url - Full URL of the asset servers endpoint
 * @param {{ query?: string, serverType?: string }} params
 * @param {AbortSignal} [signal]
 * @returns {Promise<Array>}
 */
export async function fetchAssetServers(url, { query, serverType } = {}, signal) {
  const response = await fetch(withParams(url, { query, serverType }), { headers: { Accept: 'application/json' }, signal });
  if (!response.ok) {
    throw new Error(`Asset servers fetch failed: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

function withParams(url, values) {
  const params = new URLSearchParams();
  Object.entries(values).forEach(([name, value]) => {
    if (value) params.set(name, value);
  });
  if (params.size === 0) return url;
  return `${url}${url.includes('?') ? '&' : '?'}${params}`;
}
