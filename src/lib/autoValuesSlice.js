export const initialAutoValuesState = {
  byProperty: {},
  status: 'idle', // 'idle' | 'loading' | 'ready' | 'error'
};

/**
 * Store slice holding the host-derived "Auto" values of custom properties configured with
 * `auto: true` (see CUSTOMIZATION.md). The host derives them from the current document: the
 * editor POSTs `{ yaml }` to `editorConfig.autoValues.url` and gets back
 * `{ properties: { <property>: { values: [...], detail?, warning? } } }`.
 *
 * The previous values stay in place while a refresh runs, so the Auto option does not flicker on
 * every edit. A response that arrives after a newer request was started is dropped. Mixed into
 * both the standalone and embedded stores.
 */
export function createAutoValuesSlice(set, get) {
  let generation = 0;

  return {
    autoValues: { ...initialAutoValuesState },

    refreshAutoValues: async () => {
      const url = get().editorConfig?.autoValues?.url;
      if (!url) return;

      const gen = ++generation;
      set((state) => ({ autoValues: { ...state.autoValues, status: 'loading' } }));
      try {
        const byProperty = await fetchAutoValues(url, get().yaml);
        if (gen !== generation) return;
        set({ autoValues: { byProperty, status: 'ready' } });
      } catch (error) {
        console.error('Failed to fetch auto values:', error);
        if (gen !== generation) return;
        set((state) => ({ autoValues: { ...state.autoValues, status: 'error' } }));
      }
    },
  };
}

export async function fetchAutoValues(url, yaml) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ yaml }),
  });
  if (!response.ok) {
    throw new Error(`Auto values fetch failed: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  return data?.properties || {};
}
