# Configurable Storage Persistence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace hardcoded localStorage persistence with a configurable storage strategy (localStorage, sessionStorage, none) to address security concerns about YAML data persisting indefinitely.

**Architecture:** A shared factory function (`getStorageConfig`) centralizes storage backend selection. Standalone mode reads `VITE_PERSISTENCE` env var (default: `sessionStorage`). Embedded mode adds a `persistence` config option with backward compat for `enablePersistence`.

**Tech Stack:** React, Zustand (persist middleware, createJSONStorage), Vite (env vars)

**Spec:** `docs/superpowers/specs/2026-03-19-configurable-storage-persistence-design.md`

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `src/utils/persistence.js` | Create | Storage strategy factory — `getStorageConfig(strategy)` |
| `src/store.js` | Modify | Use factory with `VITE_PERSISTENCE` env var, default `sessionStorage` |
| `src/embed.jsx` | Modify | Replace `enablePersistence` with `persistence`, backward compat |
| `CONFIGURATION.md` | Modify | Document new `persistence` option, deprecate `enablePersistence` |
| `public/index.html` | Modify | Update from `enablePersistence: true` to `persistence: 'localStorage'` |
| `embed.html` | Modify | Update from `enablePersistence: false` to `persistence: 'none'` |
| `embed-customizations.html` | Modify | Update from `enablePersistence: false` to `persistence: 'none'` |
| `embed-customizations2.html` | Modify | Update from `enablePersistence: false` to `persistence: 'none'` |
| `bin/datacontract-editor.js` | Modify | Update from `enablePersistence: false` to `persistence: 'none'` |

---

### Task 1: Create the storage strategy factory

**Files:**
- Create: `src/utils/persistence.js`

- [ ] **Step 1: Create `src/utils/persistence.js`**

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

- [ ] **Step 2: Commit**

```bash
git add src/utils/persistence.js
git commit -m "feat: add storage strategy factory for configurable persistence"
```

---

### Task 2: Update standalone store to use factory with VITE_PERSISTENCE

**Files:**
- Modify: `src/store.js:1-9` (imports) and `src/store.js:404-452` (store creation)

- [ ] **Step 1: Update imports in `src/store.js`**

Remove `createJSONStorage` from the zustand/middleware import (it's now used in `persistence.js`). Add import for `getStorageConfig`.

Change line 2 from:
```js
import {devtools, persist, createJSONStorage} from 'zustand/middleware'
```
to:
```js
import {devtools, persist} from 'zustand/middleware'
```

Add after the existing imports:
```js
import { getStorageConfig } from './utils/persistence.js';
```

- [ ] **Step 2: Update store creation in `src/store.js`**

Replace the store creation block (lines 404-452). Read `VITE_PERSISTENCE` env var, default to `'sessionStorage'`. When strategy is `'none'`, skip `persist` middleware.

Replace:
```js
// Create central zustand store for app state
const defaultEditorStore = create()(
	devtools(
		persist(defaultStoreConfig, {
			name: 'editor-store',
			storage: createJSONStorage(() => localStorage),
```

With:
```js
// Create central zustand store for app state
const persistence = import.meta.env.VITE_PERSISTENCE || 'sessionStorage';
const storageConfig = getStorageConfig(persistence);

const defaultEditorStore = create()(
	devtools(
		storageConfig
		? persist(defaultStoreConfig, {
			name: 'editor-store',
			storage: storageConfig,
```

And close the conditional after the `onRehydrateStorage` callback closing (lines 449-452). Replace:
```js
			},
		})
	)
);
```

With:
```js
			},
		})
		: defaultStoreConfig
	)
);
```

The merge and onRehydrateStorage callbacks inside persist remain unchanged.

- [ ] **Step 3: Verify the app builds**

```bash
npx vite build --mode production 2>&1 | tail -5
```

Expected: Build succeeds with no errors.

- [ ] **Step 4: Commit**

```bash
git add src/store.js
git commit -m "feat: use configurable persistence in standalone store (default: sessionStorage)"
```

---

### Task 3: Update embedded mode with new persistence option

**Files:**
- Modify: `src/embed.jsx:4` (imports), `src/embed.jsx:88-89` (DEFAULT_CONFIG), `src/embed.jsx:372-380` (store creation)

- [ ] **Step 1: Update imports in `src/embed.jsx`**

Remove `createJSONStorage` from the zustand import (line 4). Add import for `getStorageConfig`.

Change:
```js
import { persist, createJSONStorage } from 'zustand/middleware'
```
to:
```js
import { persist } from 'zustand/middleware'
```

Add after imports:
```js
import { getStorageConfig } from './utils/persistence.js';
```

- [ ] **Step 2: Update DEFAULT_CONFIG in `src/embed.jsx`**

Replace:
```js
  // Enable/disable localStorage persistence
  enablePersistence: false,
```
with:
```js
  // Storage persistence strategy: 'localStorage', 'sessionStorage', or 'none'
  // Left as undefined so backward compat for enablePersistence can detect when user didn't set it
  // persistence: undefined,
```

**Important:** Do NOT add `persistence` to `DEFAULT_CONFIG`. It must remain `undefined` after
the `{ ...DEFAULT_CONFIG, ...userConfig }` merge when the user only passes `enablePersistence`.
Simply remove the `enablePersistence` line entirely.

- [ ] **Step 3: Update `createConfiguredStore` in `src/embed.jsx`**

Replace lines 372-380:
```js
  if (config.enablePersistence) {
    return create()(
      persist(storeConfig, {
				name: 'editor-store',
				storage: createJSONStorage(() => localStorage),
		}))
  } else {
    return create()(storeConfig);
  }
```

With:
```js
  // Backward compat: only apply enablePersistence when persistence is not explicitly set
  let persistence = config.persistence;
  if (persistence === undefined) {
    if (config.enablePersistence === true) persistence = 'localStorage';
    else persistence = 'none';
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

- [ ] **Step 4: Verify the app builds**

```bash
npx vite build --mode production 2>&1 | tail -5
```

Expected: Build succeeds with no errors.

- [ ] **Step 5: Commit**

```bash
git add src/embed.jsx
git commit -m "feat: add persistence config option to embedded mode with backward compat"
```

---

### Task 4: Update HTML files and CLI to use new option

**Files:**
- Modify: `public/index.html:22`
- Modify: `embed.html:357`
- Modify: `embed-customizations.html:541`
- Modify: `embed-customizations2.html:292`
- Modify: `bin/datacontract-editor.js:165`

- [ ] **Step 1: Update `public/index.html`**

Replace:
```js
        enablePersistence: true,
```
with:
```js
        persistence: 'localStorage',
```

- [ ] **Step 2: Update `embed.html`**

Replace:
```js
        enablePersistence: false
```
with:
```js
        persistence: 'none'
```

- [ ] **Step 3: Update `embed-customizations.html`**

Replace:
```js
        enablePersistence: false
```
with:
```js
        persistence: 'none'
```

- [ ] **Step 4: Update `embed-customizations2.html`**

Replace:
```js
        enablePersistence: false
```
with:
```js
        persistence: 'none'
```

- [ ] **Step 5: Update `bin/datacontract-editor.js`**

Replace:
```js
            enablePersistence: false,
```
with:
```js
            persistence: 'none',
```

- [ ] **Step 6: Commit**

```bash
git add public/index.html embed.html embed-customizations.html embed-customizations2.html bin/datacontract-editor.js
git commit -m "feat: migrate all consumers from enablePersistence to persistence option"
```

---

### Task 5: Update documentation

**Files:**
- Modify: `CONFIGURATION.md:139-140`

- [ ] **Step 1: Update `CONFIGURATION.md`**

Replace the enablePersistence line in the Advanced section:
```js
  enablePersistence: false,          // localStorage persistence
```
with:
```js
  persistence: 'none',              // 'localStorage', 'sessionStorage', or 'none' (default: 'none')
```

Also add a note after the Advanced section config block explaining:
- `persistence` accepts `'localStorage'`, `'sessionStorage'`, or `'none'`
- Default is `'none'` for embedded mode, `'sessionStorage'` for standalone mode (configurable via `VITE_PERSISTENCE` env var)
- `enablePersistence` (boolean) is deprecated but still works for backward compatibility: `true` maps to `'localStorage'`, `false` maps to `'none'`

- [ ] **Step 2: Commit**

```bash
git add CONFIGURATION.md
git commit -m "docs: document persistence option, deprecate enablePersistence"
```

---

### Task 6: Manual verification with Playwright

- [ ] **Step 1: Build and start the app**

```bash
npm run build && node bin/datacontract-editor.js --port 9090 &
```

- [ ] **Step 2: Verify standalone mode uses sessionStorage**

Open http://localhost:9090 in the browser. Edit some YAML content. Check that:
- `sessionStorage` contains key `editor-store` with the data
- `localStorage` does NOT contain key `editor-store`

Use Playwright MCP tools:
1. Navigate to http://localhost:9090
2. Make an edit (e.g., change the contract name)
3. Run JS: `sessionStorage.getItem('editor-store')` — should return non-null
4. Run JS: `localStorage.getItem('editor-store')` — should return null

- [ ] **Step 3: Verify embedded mode with persistence: 'none'**

Open http://localhost:9090/embed in the browser. Edit some YAML content. Check that:
- Neither `sessionStorage` nor `localStorage` contain `editor-store`

Use Playwright MCP tools:
1. Navigate to the embed URL
2. Make an edit
3. Run JS: `sessionStorage.getItem('editor-store')` — should return null
4. Run JS: `localStorage.getItem('editor-store')` — should return null

- [ ] **Step 4: Stop the server**

```bash
kill %1
```
