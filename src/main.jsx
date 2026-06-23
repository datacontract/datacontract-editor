import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Configure Monaco's loader to use the locally bundled module before any
// consumer (e.g. AiDiffPreviewModal) imports @monaco-editor/react.
import './lib/monaco-workers.js'
import App from './App.jsx'
import { I18nextProvider } from 'react-i18next'
import i18n from './i18n/index.js'
import { createStorageBackend } from './config/storage.js'
import { loadRuntimeConfig, buildEditorConfig } from './config/runtimeConfig.js'

// Create the configured storage backend
const storageBackendSlug = "standalone"
const storageBackend = createStorageBackend(storageBackendSlug);

async function init() {
  // Load runtime config (from /config.json in Docker, or empty for hosted)
  const runtimeConfig = await loadRuntimeConfig();
  const editorConfig = buildEditorConfig(runtimeConfig);

  // Standalone dev/Docker may carry a locale in runtime config; default English.
  if (editorConfig?.locale) i18n.changeLanguage(editorConfig.locale);

  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <I18nextProvider i18n={i18n}>
        <App storageBackend={storageBackend} editorConfig={editorConfig} />
      </I18nextProvider>
    </StrictMode>
  );
}

init();
