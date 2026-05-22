import { useCallback } from 'react';
import { useEditorStore } from '../store.js';
import { fetchDefinition, fetchSemanticTree } from '../lib/definitionsApi.js';
import { isExternalUrl } from "../lib/urlUtils.js";

/**
 * Hook for fetching definitions on-demand from the semantic ontology tree.
 * The tree may also include business definitions merged in by the backend.
 */
export function useDefinition() {
    const editorConfig = useEditorStore(state => state.editorConfig);
    const semantics = editorConfig?.semantics;

    /**
     * Fetch a single definition by URL
     */
    const getDefinition = useCallback(async (definitionUrl) => {
        if (!definitionUrl || isExternalUrl(definitionUrl)) {
            return null;
        }
        return await fetchDefinition(definitionUrl, semantics?.definitionAcceptHeader);
    }, [semantics?.definitionAcceptHeader]);

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
        getSemanticTree,
        hasSemanticsConfig: !!semantics?.baseUrl,
    };
}
