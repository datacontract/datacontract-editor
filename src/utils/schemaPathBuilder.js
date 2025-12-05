/**
 * Utilities for building schema property paths used with zustand store
 * Paths follow the format: schema[0].properties[1].items.properties[2].fieldName
 */

/**
 * Build a path string to a property
 * @param {number} schemaIdx - Schema index
 * @param {Array} propPath - Array of path segments (numbers for indices, 'items' for items nodes)
 * @param {string} field - Optional field name to append
 * @returns {string} Path string like "schema[0].properties[1].items.logicalType"
 */
export function buildPropertyPath(schemaIdx, propPath, field = null) {
    let pathStr = `schema[${schemaIdx}].properties`;

    for (let i = 0; i < propPath.length; i++) {
        if (propPath[i] === 'items') {
            pathStr += '.items';
            // If there are more segments after 'items', continue to properties
            if (i < propPath.length - 1) {
                pathStr += '.properties';
            }
        } else {
            pathStr += `[${propPath[i]}]`;
            // If next segment is not 'items', navigate to properties
            if (i < propPath.length - 1 && propPath[i + 1] !== 'items') {
                pathStr += '.properties';
            }
        }
    }

    if (field) {
        pathStr += `.${field}`;
    }

    return pathStr;
}

/**
 * Build a path string to an items object
 * @param {number} schemaIdx - Schema index
 * @param {Array} propPath - Array of path segments
 * @param {string} field - Optional field name to append
 * @returns {string} Path string to items object
 */
export function buildItemsPath(schemaIdx, propPath, field = null) {
    let pathStr = buildPropertyPath(schemaIdx, propPath);
    pathStr += '.items';

    if (field) {
        pathStr += `.${field}`;
    }

    return pathStr;
}

/**
 * Build a path string to a properties array
 * @param {number} schemaIdx - Schema index
 * @param {Array} propPath - Array of path segments
 * @param {boolean} isItems - Whether this is for items.properties
 * @returns {string} Path string to properties array
 */
export function buildPropertiesArrayPath(schemaIdx, propPath, isItems = false) {
    let pathStr = buildPropertyPath(schemaIdx, propPath);

    if (isItems) {
        pathStr += '.items.properties';
    } else {
        pathStr += '.properties';
    }

    return pathStr;
}

/**
 * Extract parent path and index from a bracket-notation path
 * @param {string} path - Path like "schema[0].properties[2]"
 * @returns {{parentPath: string, index: number}|null} Parent path and index, or null if invalid
 */
export function extractParentPathAndIndex(path) {
    const lastBracketIndex = path.lastIndexOf('[');
    if (lastBracketIndex === -1) {
        return null;
    }

    const parentPath = path.substring(0, lastBracketIndex);
    const indexStr = path.substring(lastBracketIndex + 1, path.length - 1);
    const index = parseInt(indexStr, 10);

    if (isNaN(index)) {
        return null;
    }

    return { parentPath, index };
}
