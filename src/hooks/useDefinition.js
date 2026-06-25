import { useCallback } from 'react';
import { useEditorStore } from '../store.js';
import { fetchDefinition, fetchSemanticTree } from '../lib/definitionsApi.js';
import { isExternalUrl } from "../lib/urlUtils.js";

/**
 * Hook for fetching definitions on-demand from the semantic ontology tree.
 * The tree may also include business definitions merged in by the backend.
 *
 * When editorConfig.batchSemanticsUrl is configured, single-definition reads
 * are served from the store slice (resolveAuthoritativeDefinition), which was populated
 * by the batch fetch on load and lazily fills cache misses. Otherwise reads
 * fall back to per-URL fetching.
 */
export function useDefinition() {
    const editorConfig = useEditorStore(state => state.editorConfig);
    const resolveAuthoritativeDefinition = useEditorStore(state => state.resolveAuthoritativeDefinition);
    const semantics = editorConfig?.semantics;
    const batchSemanticsUrl = editorConfig?.batchSemanticsUrl;

    /**
     * Fetch a single definition by URL
     */
    const getDefinition = useCallback(async (definitionUrl) => {
        if (!definitionUrl || isExternalUrl(definitionUrl)) {
            return null;
        }
        if (batchSemanticsUrl && resolveAuthoritativeDefinition) {
            return await resolveAuthoritativeDefinition(definitionUrl);
        }
        return await fetchDefinition(definitionUrl, semantics?.definitionAcceptHeader);
    }, [batchSemanticsUrl, resolveAuthoritativeDefinition, semantics?.definitionAcceptHeader]);

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
