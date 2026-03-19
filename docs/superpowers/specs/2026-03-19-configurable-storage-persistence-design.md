# Configurable Storage Persistence

**Date:** 2026-03-19
**Status:** Approved
**Trigger:** Security report — full YAML stored in browser localStorage, not cleared after session

## Problem

The standalone editor persists the entire Zustand store (YAML content, editor config including AI API keys) to `localStorage`. This data survives indefinitely across browser sessions. In shared-browser environments, data from one user's session is accessible to the next user.

## Decision

Introduce a configurable `persistence` option with three strategies: `localStorage`, `sessionStorage`, and `none`.

- **Standalone mode** defaults to `sessionStorage`, configurable at build time via `VITE_PERSISTENCE` env var
- **Embedded mode** gains a `persistence` option (`'localStorage'`, `'sessionStorage'`, `'none'`), default remains `'none'` (current behavior preserved)
- Backward compatibility for the existing `enablePersistence` boolean in embedded mode

## Design

### 1. Storage Strategy Factory — `src/utils/persistence.js`

New utility module exporting `getStorageConfig(strategy)`:

- Accepts `'localStorage'`, `'sessionStorage'`, or `'none'`
- Returns a `createJSONStorage()` result for the selected backend, or `null` for `'none'`
- Warns and falls back to `'sessionStorage'` for invalid values

```js
import { createJSONStorage } from 'zustand/middleware';

const VALID_STRATEGIES = ['localStorage', 'sessionStorage', 'none'];

function getStorage(strategy) {
  switch (strategy) {
    case 'localStorage': return localStorage;
    case 'sessionStorage': return sessionStorage;
    default: return null;
  }
}

export function getStorageConfig(strategy = 'sessionStorage') {
  if (!VALID_STRATEGIES.includes(strategy)) {
    console.warn(`Invalid persistence strategy "${strategy}", falling back to "sessionStorage"`);
    strategy = 'sessionStorage';
  }
  const storage = getStorage(strategy);
  if (!storage) return null;
  return createJSONStorage(() => storage);
}
```

### 2. Standalone Mode — `src/store.js`

Read `VITE_PERSISTENCE` env var at build time, defaulting to `'sessionStorage'`. When the strategy resolves to `'none'`, skip the `persist` middleware entirely.

Existing merge logic remains unchanged. The `onRehydrateStorage` callback is extended with an idempotent silent cleanup of orphaned `localStorage` data left over from the previous `localStorage`-based persistence. The cleanup only runs when the active strategy is not `localStorage`, to avoid deleting data that was just rehydrated.

```js
import { getStorageConfig } from './utils/persistence.js';

const persistence = import.meta.env.VITE_PERSISTENCE || 'sessionStorage';
const storageConfig = getStorageConfig(persistence);

const defaultEditorStore = create()(
  devtools(
    storageConfig
      ? persist(defaultStoreConfig, {
          name: 'editor-store',
          storage: storageConfig,
          merge: (persistedState, currentState) => { /* existing logic */ },
          onRehydrateStorage: () => (state) => {
            // Clean up orphaned localStorage data from pre-sessionStorage versions
            if (persistence !== 'localStorage') {
              try { localStorage.removeItem('editor-store'); } catch { /* ignore */ }
            }
            // existing yamlParts sync logic...
          },
        })
      : defaultStoreConfig
  )
);
```

### 3. Embedded Mode — `embed.jsx`

Replace `enablePersistence` (boolean) with `persistence` (string) in `DEFAULT_CONFIG`:

Remove `enablePersistence: false` from `DEFAULT_CONFIG`. Do NOT add `persistence` to defaults — it must remain `undefined` after the `{ ...DEFAULT_CONFIG, ...userConfig }` merge so the backward compat check can detect when the user only passed `enablePersistence`.

In `createConfiguredStore`, add backward compatibility and use the factory:

```js
// Backward compat: only apply enablePersistence when persistence is not explicitly set
let persistence = config.persistence;
if (persistence === undefined) {
  if (config.enablePersistence === true) persistence = 'localStorage';
  else persistence = 'none';  // default for embedded
}

const storageConfig = getStorageConfig(persistence);

if (storageConfig) {
  return create()(
    persist(storeConfig, {
      name: 'editor-store',
      storage: storageConfig,
    })
  );
} else {
  return create()(storeConfig);
}
```

### 4. Documentation — `CONFIGURATION.md`

- Document `persistence` option with its three values and defaults
- Note deprecation of `enablePersistence` (still functional, maps to new option)
- Defaults: `'none'` for embedded, `'sessionStorage'` for standalone

## Files Changed

| File | Change |
|------|--------|
| `src/utils/persistence.js` | New — storage strategy factory |
| `src/store.js` | Use factory, read `VITE_PERSISTENCE` env var, default to `sessionStorage` |
| `src/embed.jsx` | Replace `enablePersistence` with `persistence`, backward compat |
| `CONFIGURATION.md` | Document new option, deprecate old one |
| `public/index.html` | Update to use new `persistence` option (currently uses `enablePersistence: true`) |
| `embed.html` | Review/update `enablePersistence` usage |
| `embed-customizations.html` | Review/update `enablePersistence` usage |
| `embed-customizations2.html` | Review/update `enablePersistence` usage |
| `bin/datacontract-editor.js` | Review/update `enablePersistence` usage |

## Out of Scope

- **Field-level exclusion from persistence** (e.g., excluding `editorConfig.ai.apiKey` via Zustand's `partialize`). Changing from `localStorage` to `sessionStorage` reduces the exposure window but keys remain in storage for the tab lifetime. This could be addressed in a follow-up.

## Risks

- **Breaking change for standalone users**: existing `localStorage` data won't be read by `sessionStorage`. Users who relied on cross-session persistence will lose their stored state on upgrade. This is intentional — the security report specifically flags this behavior.
- **Cleanup is best-effort**: the `localStorage.removeItem` call is wrapped in try/catch. In environments where `localStorage` access throws (e.g., some privacy modes), the orphaned data remains but causes no harm since the app no longer reads from it.
