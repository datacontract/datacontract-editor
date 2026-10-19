/**
 * Store slice for the browse panel (semantics / upstream data products / assets,
 * opened via the edge tab next to the section nav). Mixed into both the
 * standalone and embedded stores — keep it registered in src/store.js AND
 * src/embed.jsx.
 */
export function createBrowsePanelSlice(set) {
  let insertToken = 0;
  return {
    isBrowsePanelOpen: false,
    browsePanelTab: 'semantics', // 'semantics' | 'dataProducts' | 'assets'
    // Last property inserted from the panel ({schemaIndex, index, token}).
    // The matching PropertyRow scrolls itself into view and flashes, so the
    // insert is visible even when the list end is below the fold.
    lastInsertedProperty: null,
    toggleBrowsePanel: () => set((state) => ({
      isBrowsePanelOpen: !state.isBrowsePanelOpen,
    })),
    openBrowsePanel: (tab) => set((state) => ({
      isBrowsePanelOpen: true,
      browsePanelTab: tab || state.browsePanelTab,
    })),
    closeBrowsePanel: () => set({ isBrowsePanelOpen: false }),
    setBrowsePanelTab: (tab) => set({ browsePanelTab: tab }),
    markInsertedProperty: (schemaIndex, index, options = {}) => set({
      lastInsertedProperty: { schemaIndex, index, scroll: options.scroll !== false, token: ++insertToken },
    }),
    clearInsertedProperty: () => set({ lastInsertedProperty: null }),
    // While hovering a linked element in the browse panel: the criterion
    // identifying its counterpart contract properties, so their rows can
    // highlight. {type: 'authDef', url} | {type: 'sourced', key} | null.
    hoveredContractLink: null,
    setHoveredContractLink: (link) => set({ hoveredContractLink: link }),
    // Reverse direction: while hovering a linked property row in the schema
    // editor, its link identity ({urls, sourcedKeys}), so the matching
    // browse tree rows can highlight (when visible).
    hoveredSchemaProperty: null,
    setHoveredSchemaProperty: (identity) => set({ hoveredSchemaProperty: identity }),
  };
}
