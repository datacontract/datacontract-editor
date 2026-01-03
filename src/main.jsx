import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { createStorageBackend } from './config/storage.js'
import { loadRuntimeConfig, buildEditorConfig } from './config/runtimeConfig.js'

// Create the configured storage backend
const storageBackendSlug = "standalone"
const storageBackend = createStorageBackend(storageBackendSlug);

async function init() {
  // Load runtime config (from /config.json in Docker, or empty for hosted)
  const runtimeConfig = await loadRuntimeConfig();
  const editorConfig = buildEditorConfig(runtimeConfig);

  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App storageBackend={storageBackend} editorConfig={editorConfig} />
    </StrictMode>
  );
}

init();
