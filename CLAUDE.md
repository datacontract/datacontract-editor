Automatically use context7 for code generation and library documentation.

We use React with Javascript and Vite. The codebase is plain `.js`/`.jsx` — there is no TypeScript.
Make use of the following libraries:
- react-router-dom (remix-run/react-router)
- eemeli/yaml (`yaml`)
- pmndrs/zustand
- For the diagram editor we use React Flow v12 — import from `@xyflow/react` (context7: reactflow_dev)
- Monaco for the code editor (`@monaco-editor/react` + `monaco-yaml`)
- ajv / ajv-formats for JSON Schema validation
- dnd-kit (`@dnd-kit/*`) for drag-and-drop
- react-i18next for i18n (locales: en/de)

As documentation and when looking up apis for the react libraries use the following context7 stuffs:
- https://react.dev/
- /remix-run/react-router 
- /eemeli/yaml
- /pmndrs/zustand
- /websites/reactflow_dev

The Zustand store lives in a single file: `/src/store.js`. It exports `useEditorStore` (the
hook) plus helpers like `getValueWithPath` / `setValueWithPath`.

Standalone vs. embedded mode is handled by store injection, not separate store files:
- `defaultEditorStore` is the default `create()` store (persisted via `devtools` + `persist`).
- Embedded hosts can inject their own configured store with `setOverrideStore(...)`.
- `useEditorStore` returns the override store when one is set, otherwise the default store.

Editor mode (`SERVER` / `DESKTOP` / `EMBEDDED`) is held in `editorConfig.mode` inside the store.

Use Tailwind CSS with Tailwind Plus as a style guide.
Use TailwindPlus react for TailwindCSS v4.
Do never use Heroicons

`@playwright/test` is available for ad-hoc browser checks, but there is no committed Playwright
config or test suite yet — there is no `test` script in package.json. Run the dev server
(`npm run dev`) and drive it manually when you need to verify UI behavior.
If you need to start a server, use port 9090 or greater.
To test stuff that is only available in embedded mode, use the /embed suburl.

When the term data contract is used, this refers to https://raw.githubusercontent.com/bitol-io/open-data-contract-standard/refs/heads/dev/docs/README.md
