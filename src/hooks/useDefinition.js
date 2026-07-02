import { useCallback } from 'react';
import { useEditorStore } from '../store.js';
import { fetchDefinition, fetchSemanticTree } from '../lib/definitionsApi.js';
import { isExternalUrl } from "../lib/urlUtils.js";

/**
 * Hook for fetching definitions on-demand from the semantic ontology tree.
 * The tree may also include business definitions merged in by the backend.
 *
 * When editorConfig.semantics.batchResolveUrl is configured, single-definition reads
 * are served from the store slice (resolveAuthoritativeDefinition), which was populated
 * by the batch fetch on load and lazily fills cache misses. Otherwise reads
 * fall back to per-URL fetching.
 */
export function useDefinition() {
    const editorConfig = useEditorStore(state => state.editorConfig);
    const resolveAuthoritativeDefinition = useEditorStore(state => state.resolveAuthoritativeDefinition);
    const semantics = editorConfig?.semantics;
    const batchResolveUrl = semantics?.batchResolveUrl;

    /**
     * Fetch a single definition by URL
     */
    const getDefinition = useCallback(async (definitionUrl) => {
        if (!definitionUrl) {
            return null;
        }
        // A configured backend resolver handles external/IRI references too (server-side, no CORS).
        if (batchResolveUrl && resolveAuthoritativeDefinition) {
            return await resolveAuthoritativeDefinition(definitionUrl);
        }
        // Direct per-URL fetch works same-host only (CORS); skip external references.
        if (isExternalUrl(definitionUrl)) {
            return null;
        }
        return await fetchDefinition(definitionUrl, semantics?.definitionAcceptHeader);
    }, [batchResolveUrl, resolveAuthoritativeDefinition, semantics?.definitionAcceptHeader]);

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
