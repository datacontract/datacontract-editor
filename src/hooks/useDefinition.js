import { useCallback, useMemo } from 'react';
import { useEditorStore } from '../store.js';
import { loadDefinition, fetchSemanticTree } from '../lib/definitionsApi.js';
import { isExternalUrl, toAbsoluteUrl } from "../lib/urlUtils.js";

/**
 * Hook for fetching definitions on-demand from the semantic ontology tree.
 * The tree may also include business definitions merged in by the backend.
 */
export function useDefinition() {
    const editorConfig = useEditorStore(state => state.editorConfig);
    const semantics = editorConfig?.semantics;
    const csrf = editorConfig?.csrf;

    // Config for the shared definition loader. When `batchResolveUrl` is set the
    // loader coalesces all of a contract's authoritativeDefinitions into one POST;
    // otherwise it dedups and falls back to per-URL fetches.
    const loaderConfig = useMemo(() => ({
        batchUrl: semantics?.batchResolveUrl ? toAbsoluteUrl(semantics.batchResolveUrl) : null,
        acceptHeader: semantics?.definitionAcceptHeader,
        csrf,
    }), [semantics?.batchResolveUrl, semantics?.definitionAcceptHeader, csrf]);

    /**
     * Fetch a single definition by URL. Routes through the shared dedup+batch
     * loader so identical URLs and same-tick requests collapse into one call.
     */
    const getDefinition = useCallback(async (definitionUrl) => {
        if (!definitionUrl || isExternalUrl(definitionUrl)) {
            return null;
        }
        return await loadDefinition(toAbsoluteUrl(definitionUrl), loaderConfig);
    }, [loaderConfig]);

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
