import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { createStorageBackend } from './config/storage.js'

// Create the configured storage backend
// To change the storage backend, edit src/config/storage.js
const storageBackendSlug = "standalone"
const storageBackend = createStorageBackend(storageBackendSlug);

// Editor configuration
// Configure the Data Contract CLI API server URL for running tests
// Set to null to use relative /test endpoint (default for server mode)
// Set to a URL like 'https://api.datacontract.com' for remote API
const editorConfig = {
  tests: {
    enabled: true,
    dataContractCliApiServerUrl: null, // e.g., 'https://api.datacontract.com'
  },
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App storageBackend={storageBackend} editorConfig={editorConfig} />
  </StrictMode>
)
