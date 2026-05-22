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
