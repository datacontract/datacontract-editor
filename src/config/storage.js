import { ServerFileStorageBackend } from '../services/ServerFileStorageBackend.js';
import { LocalFileStorageBackend } from '../services/LocalFileStorageBackend.js';

/**
 * Storage backend configuration
 *
 * To switch between storage backends, change the STORAGE_TYPE constant:
 * - 'standalone': Use browser's File System Access API (default)
 * - 'server': Use remote server API
 */

const SERVER_API_URL = 'http://localhost:4001';

/**
 * Create and return the configured storage backend
 * @returns {FileStorageBackend}
 */
export function createStorageBackend(storageBackendSlug = 'standalone') {
  switch (storageBackendSlug) {
    case 'server':
      console.log(`Initializing ServerFileStorageBackend with URL: ${SERVER_API_URL}`);
      return new ServerFileStorageBackend(SERVER_API_URL)

    case 'standalone':
    default:
      console.log('Initializing LocalFileStorageBackend');
      return new LocalFileStorageBackend();
  }
}
