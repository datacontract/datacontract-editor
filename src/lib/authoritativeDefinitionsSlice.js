import { collectAuthoritativeDefinitionUrls, fetchAuthoritativeDefinitionsBatch } from './authoritativeDefinitions.js';
import { fetchDefinition } from './definitionsApi.js';
import { isExternalUrl, toAbsoluteUrl } from './urlUtils.js';

export const initialAuthoritativeDefinitionsState = {
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
export function createAuthoritativeDefinitionsSlice(set, get) {
  let generation = 0;
  let batchPromise = null;
  const inflight = new Map();

  const getAcceptHeader = () =>
    get().editorConfig?.semantics?.definitionAcceptHeader || 'application/json';

  const has = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

  return {
    authoritativeDefinitions: { ...initialAuthoritativeDefinitionsState },

    collectAndFetchAuthoritativeDefinitions: async () => {
      const batchResolveUrl = get().editorConfig?.semantics?.batchResolveUrl;
      if (!batchResolveUrl) {
        batchPromise = null;
        set({ authoritativeDefinitions: { byUrl: {}, status: 'idle', error: null } });
        return;
      }

      const gen = ++generation;
      set({ authoritativeDefinitions: { byUrl: {}, status: 'loading', error: null } });

      const urls = collectAuthoritativeDefinitionUrls(get().yamlParts);

      if (urls.length === 0) {
        batchPromise = null;
        set({ authoritativeDefinitions: { byUrl: {}, status: 'ready', error: null } });
        return;
      }

      // The batch endpoint serves plain application/json (not the odcs+json the single-item
      // endpoints use), so request that explicitly — otherwise the odcs Accept header 406s.
      const promise = fetchAuthoritativeDefinitionsBatch(batchResolveUrl, urls, 'application/json');
      batchPromise = promise;
      try {
        const map = await promise;
        if (gen !== generation) return;
        set({ authoritativeDefinitions: { byUrl: map || {}, status: 'ready', error: null } });
      } catch (error) {
        console.error('Failed to batch-fetch authoritative definitions:', error);
        if (gen !== generation) return;
        set((state) => ({
          authoritativeDefinitions: { ...state.authoritativeDefinitions, status: 'error', error: String(error) },
        }));
      } finally {
        if (batchPromise === promise) batchPromise = null;
      }
    },

    resolveAuthoritativeDefinition: async (url) => {
      if (!url) return null;
      const abs = toAbsoluteUrl(url);
      if (!abs) return null;

      const batchResolveUrl = get().editorConfig?.semantics?.batchResolveUrl;
      if (!batchResolveUrl) {
        // No backend resolver: fall back to a direct per-URL GET, which only works
        // same-host (CORS). External references stay unresolved.
        if (isExternalUrl(url)) return null;
        return fetchDefinition(abs, getAcceptHeader());
      }

      // Backend-mediated resolution works for internal urls and host-agnostic IRIs
      // alike (server-side lookup, no CORS), so external references resolve here too.
      if (has(get().authoritativeDefinitions.byUrl, abs)) {
        return get().authoritativeDefinitions.byUrl[abs];
      }

      if (batchPromise) {
        try { await batchPromise; } catch { /* fall through to lazy fetch */ }
        if (has(get().authoritativeDefinitions.byUrl, abs)) {
          return get().authoritativeDefinitions.byUrl[abs];
        }
      }

      if (inflight.has(abs)) return inflight.get(abs);
      const gen = generation;
      const p = (async () => {
        // Resolve the cache miss through the batch endpoint rather than a direct GET,
        // so external/IRI references resolve too. The endpoint echoes the request url
        // as the map key; a missing/null entry means "no match".
        const map = await fetchAuthoritativeDefinitionsBatch(batchResolveUrl, [abs], 'application/json');
        const data = map && has(map, abs) ? map[abs] : null;
        if (gen === generation) {
          set((state) => ({
            authoritativeDefinitions: {
              ...state.authoritativeDefinitions,
              byUrl: { ...state.authoritativeDefinitions.byUrl, [abs]: data },
            },
          }));
        }
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
