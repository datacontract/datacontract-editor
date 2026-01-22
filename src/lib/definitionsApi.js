/**
 * API utilities for fetching and managing semantic definitions
 */

/**
 * Fetch a single definition by ID from the API
 * @param {string} baseUrl - API base URL
 * @param {string} definitionId - Definition ID (e.g., "/testorga/definitions/fulfillment/sku")
 * @returns {Promise<Object|null>} The definition object or null if not found
 */
export const fetchDefinition = async (url, definitionAcceptHeader = "application/json") => {
	if (!url) {
		console.warn('Cannot fetch definition: baseUrl or definitionId not provided');
		return null;
	}

	try {
		// Remove leading slash from definitionId for URL construction
		const response = await fetch(url, {
			method: 'GET',
			headers: {
				Accept: definitionAcceptHeader,
			},
		});

		if (!response.ok) {
			console.error(`Failed to fetch definition ${url}:`, response.status, response.statusText);
			return null;
		}

		const data = await response.json();
		return data;
	} catch (error) {
		console.error(`Error fetching definition ${url}:`, error);
		return null;
	}
};

/**
 * Search definitions using server-side search with pagination
 * @param {string} baseUrl - API base URL
 * @param {string} searchTerm - Search term
 * @param {number} maxResults - Maximum number of results to return
 * @param {string} queryParam - Query parameter name (e.g., 'q' or 'query')
 * @param {string} pageParam - Page parameter name (e.g., 'p' or 'page')
 * @returns {Promise<Array>} Array of matching definitions
 */
export const searchDefinitions = async (baseUrl, searchTerm, maxResults, queryParam = 'q', pageParam = 'p', definitionAcceptHeader = "application/json") => {
	if (!baseUrl) {
		console.warn('Cannot search definitions: baseUrl not provided');
		return [];
	}

	const PAGE_SIZE = 100; // Server returns max 100 results per page
	const numPages = Math.floor(maxResults / PAGE_SIZE) + (maxResults % PAGE_SIZE > 0 ? 1 : 0);
	const allResults = [];

	try {
		// Fetch multiple pages if needed
		for (let page = 0; page < numPages; page++) {
			const url = `${baseUrl}?${queryParam}=${encodeURIComponent(searchTerm)}&${pageParam}=${page}`;
			console.log(`Searching definitions (page ${page + 1}/${numPages}):`, url);

			const response = await fetch(url, {
				method: 'GET',
				mode: 'cors',
				headers: {
					Accept: definitionAcceptHeader,
				}
			});

			if (!response.ok) {
				console.error(`Failed to search definitions (page ${page}):`, response.status, response.statusText);
				break; // Stop fetching if a page fails
			}

			const data = await response.json();
			const pageResults = Array.isArray(data) ? data : [];

			allResults.push(...pageResults);

			// Stop if we got fewer results than PAGE_SIZE (no more pages available)
			if (pageResults.length < PAGE_SIZE) {
				break;
			}

			// Stop if we've reached maxResults
			if (allResults.length >= maxResults) {
				break;
			}
		}

		// Trim to maxResults
		return allResults.slice(0, maxResults);
	} catch (error) {
		console.error('Error searching definitions:', error);
		return allResults; // Return what we got so far
	}
};
