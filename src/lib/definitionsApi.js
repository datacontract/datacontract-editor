/**
 * API utilities for fetching semantic definitions
 */

/**
 * Fetch a single definition by its full URL/path.
 * @param {string} url - Full URL/path to the definition
 * @param {string} definitionAcceptHeader - Accept header for the request
 * @returns {Promise<Object|null>} The definition object or null if not found
 */
export const fetchDefinition = async (url, definitionAcceptHeader = "application/json") => {
	if (!url) {
		console.warn('Cannot fetch definition: url not provided');
		return null;
	}

	try {
		const response = await fetch(url, {
			method: 'GET',
			headers: {
				Accept: definitionAcceptHeader,
			},
		});

		if (!response.ok) {
			console.error('Failed to fetch definition:', url, response.status, response.statusText);
			return null;
		}

		const data = await response.json();
		return data;
	} catch (error) {
		console.error('Error fetching definition:', url, error);
		return null;
	}
};

// --- Shared definition resolution: dedup + microtask batching ----------------
// On load, many components (diagram nodes, property rows, detail panels, preview)
// each resolve the authoritativeDefinitions of every column. Resolving them one
// URL at a time was a request-per-link N+1 that dominated editor load for
// contracts with many semantic links. This shared loader collapses that:
//   - identical URLs share a single cached promise (dedup across all callers), and
//   - every URL requested within the same tick is coalesced into ONE batch POST
//     to the host's resolve endpoint (when configured), else it falls back to the
//     legacy per-URL GET so older hosts keep working.

const definitionCache = new Map(); // absolute url -> Promise<Object|null>
let pendingQueue = []; // [{ url, resolve, config }]
let flushScheduled = false;

/** Clears the per-session definition cache (e.g. for tests). */
export const clearDefinitionCache = () => {
	definitionCache.clear();
};

const flushDefinitionQueue = async () => {
	flushScheduled = false;
	const batch = pendingQueue;
	pendingQueue = [];

	// All callers in a tick share the same editor config, so the first is representative.
	const config = batch[0]?.config || {};
	const batchUrl = config.batchUrl || null;
	const acceptHeader = config.acceptHeader || 'application/json';
	const csrf = config.csrf || null;
	const urls = [...new Set(batch.map((item) => item.url))];

	const byUrl = new Map();
	try {
		if (!batchUrl) throw new Error('no batch resolve url configured');

		const headers = { 'Content-Type': 'application/json', Accept: 'application/json' };
		// Batch resolve is a POST, so include the CSRF header when the host provides one.
		if (csrf?.headerName && csrf?.token) headers[csrf.headerName] = csrf.token;

		const response = await fetch(batchUrl, {
			method: 'POST',
			headers,
			body: JSON.stringify({ refs: urls.map((url) => ({ url })) }),
		});
		if (!response.ok) throw new Error(`Batch resolve failed: ${response.status} ${response.statusText}`);

		const results = await response.json();
		for (const item of results || []) {
			if (item && item.found && item.definition) byUrl.set(item.url, item.definition);
		}
		// URLs the batch didn't return are definitive misses.
		for (const url of urls) if (!byUrl.has(url)) byUrl.set(url, null);
	} catch (error) {
		// Fallback keeps the editor working against hosts without the batch endpoint
		// (or on transient failure). Only warn when a batch was actually attempted.
		if (batchUrl) console.warn('Falling back to per-URL definition fetch:', error?.message || error);
		await Promise.all(
			urls.map(async (url) => {
				byUrl.set(url, await fetchDefinition(url, acceptHeader));
			})
		);
	}

	for (const { url, resolve } of batch) resolve(byUrl.get(url) ?? null);
};

/**
 * Resolve a single definition URL through the shared dedup + batch loader.
 * Identical URLs share one in-flight/cached promise; all URLs requested in the
 * same tick are coalesced into a single batch request.
 * @param {string} url - Absolute definition URL
 * @param {Object} [config] - { batchUrl, acceptHeader, csrf } from the editor config
 * @returns {Promise<Object|null>} The definition object or null if not found
 */
export const loadDefinition = (url, config = {}) => {
	if (!url) return Promise.resolve(null);
	if (definitionCache.has(url)) return definitionCache.get(url);

	const promise = new Promise((resolve) => {
		pendingQueue.push({ url, resolve, config });
		if (!flushScheduled) {
			flushScheduled = true;
			queueMicrotask(flushDefinitionQueue);
		}
	});
	definitionCache.set(url, promise);
	return promise;
};

/**
 * Fetch the semantic ontology tree (concepts with their properties as children).
 * The tree may also include business definitions merged in by the backend.
 * @param {string} baseUrl - API base URL for semantics (e.g., ".../datacontract-editor-api/semantics")
 * @returns {Promise<Array>} Array of tree nodes
 */
export const fetchSemanticTree = async (baseUrl) => {
	if (!baseUrl) {
		console.warn('Cannot fetch semantic tree: baseUrl not provided');
		return [];
	}

	try {
		const url = `${baseUrl}/tree`;
		const response = await fetch(url, {
			method: 'GET',
			headers: {
				Accept: 'application/json',
			},
		});

		if (!response.ok) {
			console.error('Failed to fetch semantic tree:', response.status, response.statusText);
			return [];
		}

		return await response.json();
	} catch (error) {
		console.error('Error fetching semantic tree:', error);
		return [];
	}
};
