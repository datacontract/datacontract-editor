/**
 * Utility functions for URL handling and detection
 */

/**
 * Converts a relative or absolute URL to an absolute URL using the current window location
 * @param {string} url - The URL to convert (can be relative or absolute)
 * @returns {string|null} The absolute URL, or null if the URL is invalid
 */
export const toAbsoluteUrl = (url) => {
  if (!url) return null;

  try {
    // If it's already an absolute URL, return it
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    // Convert relative URL to absolute using current location
    const absoluteUrl = new URL(url, window.location.href);
    return absoluteUrl.href;
  } catch (error) {
    console.error('Invalid URL:', url, error);
    return null;
  }
};

/**
 * Checks if a URL points to the same host as the current window location
 * Only checks hostname, not port - for definition URLs that may be on different ports
 * @param {string} url - The URL to check (can be relative or absolute)
 * @returns {boolean} True if the URL is internal (same hostname), false if external
 */
export const isInternalUrl = (url) => {
  if (!url) return false;

  try {
    const absoluteUrl = toAbsoluteUrl(url);
    if (!absoluteUrl) return false;

    const urlObj = new URL(absoluteUrl);
    const currentHost = window.location.hostname;
    const urlHost = urlObj.hostname;

    // Compare only hostnames, not ports
    return urlHost === currentHost;
  } catch (error) {
    console.error('Error checking URL origin:', url, error);
    return false;
  }
};

/**
 * Checks if a URL is external (different host from current window location)
 * @param {string} url - The URL to check (can be relative or absolute)
 * @returns {boolean} True if the URL is external (different hostname), false if internal
 */
export const isExternalUrl = (url) => {
  return !isInternalUrl(url);
};

/**
 * Extracts definition information from a definition URL and constructs the API endpoint
 * Expected URL format: http(s)://{host}/{organizationVanityUrl}/definitions/{definitionId}
 * API endpoint format: /{organizationVanityUrl}/datacontract-editor-api/definitions/{definitionId}
 *
 * @param {string} url - The definition URL
 * @returns {Object|null} Object with { apiUrl, organizationVanityUrl, definitionId } or null if invalid
 */
export const parseDefinitionUrl = (url) => {
  if (!url) return null;

  try {
    const absoluteUrl = toAbsoluteUrl(url);
    if (!absoluteUrl) return null;

    const urlObj = new URL(absoluteUrl);
    const pathname = urlObj.pathname;

    // Expected format: /{organizationVanityUrl}/definitions/{definitionId}
    // Example: /fabi-demo/definitions/fulfillment/shipment_id
    const match = pathname.match(/^\/([^\/]+)\/definitions\/(.+)$/);

    if (!match) {
      console.warn('Definition URL does not match expected format:', url);
      return null;
    }

    const organizationVanityUrl = match[1];
    const definitionId = match[2];

    // Construct API endpoint URL
    // Format: {protocol}://{host}/{organizationVanityUrl}/datacontract-editor-api/definitions/{definitionId}
    const apiUrl = `${urlObj.protocol}//${urlObj.host}/${organizationVanityUrl}/datacontract-editor-api/definitions/${definitionId}`;

    return {
      apiUrl,
      organizationVanityUrl,
      definitionId,
      originalUrl: absoluteUrl
    };
  } catch (error) {
    console.error('Error parsing definition URL:', url, error);
    return null;
  }
};
