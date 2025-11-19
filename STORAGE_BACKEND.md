# Storage Backend Configuration

The Data Contract Editor supports multiple storage backends for loading and saving YAML files.

## Available Storage Backends

### 1. LocalFileStorageBackend (Default)
Uses the browser's File System Access API to read and write files directly on the user's local machine.

**Features:**
- Direct file system access
- Native file picker dialogs
- No server required
- Works offline

**Limitations:**
- Only works in modern browsers (Chrome, Edge, Opera)
- Requires user permission for each file operation

### 2. ServerFileStorageBackend
Connects to a remote server API for file management.

**Features:**
- Centralized file storage
- Multi-user access
- Server-side validation
- File listing and management

**Requirements:**
- Server must implement the YAML File Management API
- Default server URL: `http://localhost:4001`

## Configuration

### Quick Setup

Edit `/src/config/storage.js` and change the `STORAGE_TYPE` constant:

```javascript
// For local file storage (default)
const STORAGE_TYPE = 'local';

// For server-based storage
const STORAGE_TYPE = 'server';
```

### Server Configuration

If using server storage, also update the server URL:

```javascript
const SERVER_API_URL = 'http://localhost:4001';
```

### Advanced Configuration

You can also configure the storage backend programmatically in `/src/main.jsx`:

```javascript
import { ServerFileStorageBackend } from './services/ServerFileStorageBackend.js'
import { LocalFileStorageBackend } from './services/LocalFileStorageBackend.js'

// Option 1: Use server storage
const storageBackend = new ServerFileStorageBackend('http://localhost:4001');

// Option 2: Use local storage
const storageBackend = new LocalFileStorageBackend();

// Option 3: Use environment variable
const storageBackend = import.meta.env.VITE_USE_SERVER_STORAGE
  ? new ServerFileStorageBackend(import.meta.env.VITE_SERVER_URL)
  : new LocalFileStorageBackend();
```

## Server API Specification

The ServerFileStorageBackend expects the following API endpoints:

### GET /health
Health check endpoint

**Response:**
```json
{
  "status": "ok"
}
```

### GET /files
List all YAML files

**Response:**
```json
{
  "files": ["contract1.yaml", "contract2.yml"]
}
```

### GET /files/{filename}
Get content of a specific file

**Response:** (Content-Type: text/yaml)
```yaml
apiVersion: v3.1.0
kind: DataContract
id: example
```

### POST /files
Create a new file

**Request Body:**
```json
{
  "filename": "new-contract.yaml",
  "content": "apiVersion: v3.1.0\nkind: DataContract\n..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "File created successfully",
  "filename": "new-contract.yaml"
}
```

### PUT /files/{filename}
Update an existing file

**Request Body:** (Content-Type: text/yaml)
```yaml
apiVersion: v3.1.0
kind: DataContract
...
```

**Response:**
```json
{
  "success": true,
  "message": "File updated successfully",
  "filename": "contract.yaml"
}
```

### GET /example
Get example YAML file

**Response:** (Content-Type: text/yaml)
```yaml
apiVersion: v3.1.0
kind: DataContract
...
```

## Creating a Custom Storage Backend

To create your own storage backend:

1. Create a new class that extends `FileStorageBackend`
2. Implement the required methods:
   - `loadYamlFile(filename)`
   - `saveYamlFile(yamlContent, suggestedName, filename)`
   - `supportsFileDialog()`
   - `getBackendName()`

Example:

```javascript
import { FileStorageBackend } from './FileStorageBackend.js';

export class CustomStorageBackend extends FileStorageBackend {
  async loadYamlFile(filename = null) {
    // Your implementation
  }

  async saveYamlFile(yamlContent, suggestedName = 'datacontract.yaml', filename = null) {
    // Your implementation
  }

  supportsFileDialog() {
    return true; // or false
  }

  getBackendName() {
    return 'Custom Storage';
  }
}
```

3. Configure it in `/src/config/storage.js` or `/src/main.jsx`

## Troubleshooting

### Server Connection Issues

If you see "Cannot connect to server" errors:

1. Verify the server is running: `curl http://localhost:4001/health`
2. Check the server URL in `/src/config/storage.js`
3. Ensure CORS is configured on the server
4. Check browser console for detailed error messages

### File Access Issues with LocalFileStorageBackend

If file dialogs don't appear:

1. Ensure you're using a supported browser (Chrome, Edge, Opera)
2. Check that the site has necessary permissions
3. Try using HTTPS instead of HTTP (required by some browsers)

### Storage Backend Not Switching

If changes to the configuration don't take effect:

1. Hard refresh the browser (Ctrl+Shift+R or Cmd+Shift+R)
2. Clear browser cache
3. Check the browser console for the storage backend initialization message
