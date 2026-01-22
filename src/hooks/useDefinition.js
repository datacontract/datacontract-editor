import { useCallback } from 'react';
import { useEditorStore } from '../store.js';
import { fetchDefinition, searchDefinitions } from '../lib/definitionsApi.js';
import {isExternalUrl} from "../lib/urlUtils.js";

/**
 * Hook for fetching definitions on-demand
 * @returns {Object} Object with getDefinition and findDefinitions functions
 */
export function useDefinition() {
    const editorConfig = useEditorStore(state => state.editorConfig);
    const semantics = editorConfig?.semantics;

    /**
     * Fetch a single definition by ID or URL
     * @param {string} definitionUrl - Definition URL (full or path)
     * @returns {Promise<Object|null>} Definition object or null
     */
    const getDefinition = useCallback(async (definitionUrl) => {

        if (!definitionUrl || isExternalUrl(definitionUrl)) {
            return null;
        }

        return await fetchDefinition(definitionUrl);
    }, []);

    /**
     * Search for definitions using server-side search with pagination
     * @param {string} searchTerm - Search term
     * @param {number} maxResults - Maximum number of results (default: 50)
     * @returns {Promise<Array>} Array of matching definitions
     */
    const findDefinitions = useCallback(async (searchTerm, maxResults = 50) => {
        if (!semantics?.baseUrl) {
            console.warn('findDefinitions: baseUrl not configured in editorConfig.semantics');
            return [];
        }

        if (!searchTerm || searchTerm.trim() === '') {
            return [];
        }

        const queryParam = semantics.queryParam || 'q';
        const pageParam = semantics.pageParam || 'p';

        return await searchDefinitions(semantics.baseUrl, searchTerm, maxResults, queryParam, pageParam);
    }, [semantics?.baseUrl, semantics?.queryParam, semantics?.pageParam]);

    return {
        getDefinition,
        findDefinitions,
    };
}
