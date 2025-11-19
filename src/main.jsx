import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { createStorageBackend } from './config/storage.js'

// Create the configured storage backend
// To change the storage backend, edit src/config/storage.js
const storageBackendSlug = "standalone"
const storageBackend = createStorageBackend(storageBackendSlug);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App storageBackend={storageBackend} />
  </StrictMode>
)
