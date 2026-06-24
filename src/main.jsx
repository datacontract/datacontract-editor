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

// Reflect the active locale on <html lang> for a11y/SEO. Standalone-only: the embedded
// build mounts via embed.jsx (not this entry), so the host page keeps control of its own
// lang attribute.
const syncHtmlLang = (lng) => { document.documentElement.lang = lng; };
syncHtmlLang(i18n.resolvedLanguage || 'en');
i18n.on('languageChanged', syncHtmlLang);

async function init() {
  // Load runtime config (from /config.json in Docker, or empty for hosted)
  const runtimeConfig = await loadRuntimeConfig();
  const editorConfig = buildEditorConfig(runtimeConfig);

  // Standalone locale is resolved by i18next-browser-languagedetector (querystring →
  // localStorage → browser), configured in ./i18n. The in-app language switcher persists
  // the user's choice; nothing to do here.

  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <I18nextProvider i18n={i18n}>
        <App storageBackend={storageBackend} editorConfig={editorConfig} />
      </I18nextProvider>
    </StrictMode>
  );
}

init();
