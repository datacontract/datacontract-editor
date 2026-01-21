/**
 * API utilities for fetching and managing semantic definitions
 */

/**
 * Constructs the API base URL for the current organization
 * @param {string} org - Organization vanity URL
 * @returns {string|null} The API base URL or null if organization is not provided
 */
export const getApiBaseUrl = (org) => {
    if (!org) return null;
    return `/${org}/datacontract-editor-api`;
};

/**
 * Parses GitHub-style Link header to extract pagination URLs
 * @param {string} linkHeader - Link header value
 * @returns {Object} Object with next, prev, first, last URLs
 */
const parseLinkHeader = (linkHeader) => {
    const links = {};
    if (!linkHeader) return links;

    const parts = linkHeader.split(',');
    for (const part of parts) {
        const match = part.match(/<([^>]+)>;\s*rel="([^"]+)"/);
        if (match) {
            links[match[2]] = match[1];
        }
    }
    return links;
};

/**
 * Fetches a single page of definitions from the backend
 * @param {string} org - Organization vanity URL
 * @param {number} page - Page number (0-indexed)
 * @returns {Promise<{content: Array, links: Object, hasNext: boolean}>}
 */
export const fetchDefinitionsPage = async (org, page = 0) => {
    const apiBaseUrl = getApiBaseUrl(org);
    if (!apiBaseUrl) {
        console.warn('Cannot fetch definitions: Organization not provided');
        return { content: [], links: {}, hasNext: false };
    }

    try {
        const url = `${apiBaseUrl}/definitions?p=${page}`;
        console.log('Fetching definitions page:', url);

        const response = await fetch(url, {
            method: 'GET',
            mode: 'cors',
        });

        if (!response.ok) {
            console.error(`Failed to fetch definitions page ${page}:`, response.status, response.statusText);
            return { content: [], links: {}, hasNext: false };
        }

        const data = await response.json();
        const linkHeader = response.headers.get('Link');
        const links = parseLinkHeader(linkHeader);

        return {
            content: data,
            links,
            hasNext: !!links.next
        };
    } catch (error) {
        console.error(`Error fetching definitions page ${page}:`, error);
        return { content: [], links: {}, hasNext: false };
    }
};

/**
 * Fetches all definitions from the backend using pagination
 * @param {string} org - Organization vanity URL
 * @param {Function} onProgress - Optional callback for progress updates (currentPage)
 * @returns {Promise<Array>} Array of all definitions
 */
export const fetchAllDefinitions = async (org, onProgress = null) => {
    const allDefinitions = [];
    let currentPage = 0;
    let hasMore = true;

    try {
        while (hasMore) {
            const pageData = await fetchDefinitionsPage(org, currentPage);

            if (pageData.content && pageData.content.length > 0) {
                allDefinitions.push(...pageData.content);
            }

            hasMore = pageData.hasNext;

            if (onProgress) {
                onProgress(currentPage + 1);
            }

            console.log(`Loaded definitions page ${currentPage + 1}, total definitions: ${allDefinitions.length}, hasMore: ${hasMore}`);

            currentPage++;

            // Safety check to prevent infinite loops
            if (currentPage > 1000) {
                console.error('Maximum page limit reached (1000 pages). Stopping pagination.');
                break;
            }
        }

        console.log(`Successfully loaded ${allDefinitions.length} definitions from ${currentPage} pages`);
        return allDefinitions;
    } catch (error) {
        console.error('Error fetching all definitions:', error);
        return allDefinitions;
    }
};

/**
 * Builds a definition display URL from definition data
 * @param {Object} definition - Definition object from API
 * @param {string} organizationVanityUrl - Organization vanity URL
 * @returns {string|null} The display URL for the definition
 */
export const buildDefinitionUrl = (definition) => {
    if (!definition) return null;

    return `${window.location.protocol}//${window.location.host}${definition.url}`;
};

/**
 * Converts an array of definitions to a map keyed by URL
 * @param {Array} definitions - Array of definition objects
 * @param {string} organizationVanityUrl - Organization vanity URL
 * @returns {Map<string, Object>} Map of URL -> definition data
 */
export const definitionsArrayToMap = (definitions) => {
    const definitionsMap = new Map();

    for (const def of definitions) {
        const url = buildDefinitionUrl(def);
        if (url) {
            definitionsMap.set(url, def);
        }
    }

    return definitionsMap;
};
