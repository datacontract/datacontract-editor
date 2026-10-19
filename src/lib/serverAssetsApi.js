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
