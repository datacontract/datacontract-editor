import { collectAuthDefinitionUrls, fetchAuthDefinitionsBatch } from './authoritativeDefinitions.js';
import { fetchDefinition } from './definitionsApi.js';
import { isExternalUrl, toAbsoluteUrl } from './urlUtils.js';

export const initialAuthDefinitionsState = {
  byUrl: {},
  status: 'idle', // 'idle' | 'loading' | 'ready' | 'error'
  error: null,
};

/**
 * Store slice that batch-fetches authoritativeDefinitions on load and serves
 * them from a cache. Mixed into both the standalone and embedded stores.
 * Runtime refs (generation/batchPromise/inflight) are closure-local so each
 * store instance is independent.
 */
export function createAuthDefinitionsSlice(set, get) {
  let generation = 0;
  let batchPromise = null;
  const inflight = new Map();

  const getAcceptHeader = () =>
    get().editorConfig?.semantics?.definitionAcceptHeader || 'application/json';

  const has = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

  return {
    authDefinitions: { ...initialAuthDefinitionsState },

    collectAndFetchAuthDefinitions: async () => {
      const batchSemanticsUrl = get().editorConfig?.batchSemanticsUrl;
      if (!batchSemanticsUrl) {
        batchPromise = null;
        set({ authDefinitions: { byUrl: {}, status: 'idle', error: null } });
        return;
      }

      const gen = ++generation;
      set({ authDefinitions: { byUrl: {}, status: 'loading', error: null } });

      const urls = collectAuthDefinitionUrls(get().yamlParts);

      const promise = fetchAuthDefinitionsBatch(batchSemanticsUrl, urls, getAcceptHeader());
      batchPromise = promise;
      try {
        const map = await promise;
        if (gen !== generation) return;
        set({ authDefinitions: { byUrl: map || {}, status: 'ready', error: null } });
      } catch (error) {
        console.error('Failed to batch-fetch authoritative definitions:', error);
        if (gen !== generation) return;
        set((state) => ({
          authDefinitions: { ...state.authDefinitions, status: 'error', error: String(error) },
        }));
      } finally {
        if (batchPromise === promise) batchPromise = null;
      }
    },

    resolveAuthDefinition: async (url) => {
      if (!url || isExternalUrl(url)) return null;
      const abs = toAbsoluteUrl(url);
      if (!abs) return null;

      const batchSemanticsUrl = get().editorConfig?.batchSemanticsUrl;
      if (!batchSemanticsUrl) {
        return fetchDefinition(abs, getAcceptHeader());
      }

      if (has(get().authDefinitions.byUrl, abs)) {
        return get().authDefinitions.byUrl[abs];
      }

      if (batchPromise) {
        try { await batchPromise; } catch { /* fall through to lazy fetch */ }
        if (has(get().authDefinitions.byUrl, abs)) {
          return get().authDefinitions.byUrl[abs];
        }
      }

      if (inflight.has(abs)) return inflight.get(abs);
      const p = (async () => {
        const data = await fetchDefinition(abs, getAcceptHeader());
        set((state) => ({
          authDefinitions: {
            ...state.authDefinitions,
            byUrl: { ...state.authDefinitions.byUrl, [abs]: data },
          },
        }));
        return data;
      })();
      inflight.set(abs, p);
      try {
        return await p;
      } finally {
        inflight.delete(abs);
      }
    },
  };
}
