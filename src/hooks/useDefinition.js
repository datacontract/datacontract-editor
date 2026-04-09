import { useCallback } from 'react';
import { useEditorStore } from '../store.js';
import { fetchDefinition, fetchSemanticTree, searchDefinitions } from '../lib/definitionsApi.js';
import {isExternalUrl} from "../lib/urlUtils.js";

/**
 * Hook for fetching definitions on-demand.
 * Supports both semantic ontology (tree browse) and business definitions (search).
 */
export function useDefinition() {
    const editorConfig = useEditorStore(state => state.editorConfig);
    const semantics = editorConfig?.semantics;
    const definitions = editorConfig?.definitions;

    /**
     * Fetch a single definition by ID or URL
     */
    const getDefinition = useCallback(async (definitionUrl) => {
        if (!definitionUrl || isExternalUrl(definitionUrl)) {
            return null;
        }
        return await fetchDefinition(definitionUrl, semantics?.definitionAcceptHeader || definitions?.definitionAcceptHeader);
    }, []);

    /**
     * Search business definitions using server-side search with pagination
     */
    const findDefinitions = useCallback(async (searchTerm, maxResults = 50) => {
        if (!definitions?.baseUrl) {
            return [];
        }
        if (!searchTerm || searchTerm.trim() === '') {
            return [];
        }
        const queryParam = definitions.queryParam || 'q';
        const pageParam = definitions.pageParam || 'p';
        return await searchDefinitions(definitions.baseUrl, searchTerm, maxResults, queryParam, pageParam, definitions.definitionAcceptHeader);
    }, [definitions?.baseUrl, definitions?.queryParam, definitions?.pageParam, definitions?.definitionAcceptHeader]);

    /**
     * Fetch the semantic ontology tree
     */
    const getSemanticTree = useCallback(async () => {
        if (!semantics?.baseUrl) {
            return [];
        }
        return await fetchSemanticTree(semantics.baseUrl);
    }, [semantics?.baseUrl]);

    return {
        getDefinition,
        findDefinitions,
        getSemanticTree,
        hasSemanticsConfig: !!semantics?.baseUrl,
        hasDefinitionsConfig: !!definitions?.baseUrl,
    };
}
