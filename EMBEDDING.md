# Embedding the Data Contract Editor

This guide explains how to embed the Data Contract Editor into your web application using ES modules.

## Quick Start

1. Build the library:
```bash
npm run build:lib
```

2. Include the CSS and import the ES module in your HTML:
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <link rel="stylesheet" href="./dist/datacontract-editor.css">
</head>
<body>
    <div id="editor"></div>

    <script type="module">
        import { init } from './dist/datacontract-editor.es.js';

        const editor = init({
            container: '#editor',
            yaml: `apiVersion: "v3.1.0"
kind: "DataContract"
id: my-contract
version: "1.0.0"
status: draft
info:
  title: My Data Contract
  description: Example contract
`,
            initialView: 'yaml'
        });
    </script>
</body>
</html>
```

3. Serve your files via HTTP (ES modules require HTTP, not file://)

## Live Example

See `embed.html` in the root directory for a complete working example with interactive controls.

## Configuration Options

The `init()` function accepts the following configuration options:

```javascript
const editor = init({
    // Required: Container element (CSS selector or HTMLElement)
    container: '#editor',

    // Initial YAML content (optional, defaults to minimal contract)
    yaml: 'apiVersion: "v3.1.0"...',

    // Schema URL for validation (optional)
    schemaUrl: 'https://raw.githubusercontent.com/bitol-io/open-data-contract-standard/refs/heads/dev/schema/odcs-json-schema-v3.1.0.json',

    // Available server types (optional, null = all types)
    serverTypes: ['snowflake', 'bigquery', 'postgres'],

    // Available views (optional, defaults to all)
    availableViews: ['yaml', 'form', 'diagram'],

    // Initial view (optional, defaults to 'yaml')
    initialView: 'yaml',

    // Test endpoint for running contract tests (optional)
    testEndpoint: '/test',

    // Custom save callback (optional)
    onSave: (yaml) => {
        console.log('Saving:', yaml);
        // Send to your backend
    },

    // Team name lookup function (optional)
    lookupTeamName: async (teamId) => {
        const response = await fetch(`/api/teams/${teamId}`);
        return response.json();
    },

    // Custom storage backend (optional)
    backend: null,

    // Enable localStorage persistence (optional, defaults to false)
    enablePersistence: false
});
```

## API Methods

The editor instance provides the following methods:

### `getYaml(): string`
Get the current YAML content.

```javascript
const yaml = editor.getYaml();
console.log(yaml);
```

### `setYaml(yaml: string): void`
Set the YAML content programmatically.

```javascript
editor.setYaml('apiVersion: "v3.1.0"...');
```

### `isDirty(): boolean`
Check if the editor has unsaved changes.

```javascript
if (editor.isDirty()) {
    console.log('There are unsaved changes');
}
```

### `setView(view: string): void`
Change the current view ('yaml', 'form', or 'diagram').

```javascript
editor.setView('diagram');
```

### `getView(): string`
Get the current view.

```javascript
const currentView = editor.getView();
```

### `runTest(server?: string): Promise<TestResult>`
Run tests against the configured test endpoint.

```javascript
try {
    const result = await editor.runTest('production');
    console.log('Tests passed:', result.success);
} catch (error) {
    console.error('Tests failed:', error);
}
```

### `getMarkers(): ValidationMarker[]`
Get current validation errors/warnings.

```javascript
const errors = editor.getMarkers();
console.log('Validation errors:', errors.length);
```

### `subscribe(callback: (state) => void): () => void`
Subscribe to state changes. Returns an unsubscribe function.

```javascript
const unsubscribe = editor.subscribe((state) => {
    console.log('State changed');
    console.log('Current view:', editor.getView());
    console.log('Is dirty:', editor.isDirty());
});

// Later, to unsubscribe:
unsubscribe();
```

### `destroy(): void`
Unmount the editor and clean up resources.

```javascript
editor.destroy();
```

### `getStore(): Store`
Get the underlying Zustand store (advanced usage).

```javascript
const store = editor.getStore();
```

## Examples

### Auto-save on Changes

```javascript
let saveTimeout;
editor.subscribe((state) => {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
        if (editor.isDirty()) {
            const yaml = editor.getYaml();
            // Send to backend
            fetch('/api/contracts/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/yaml' },
                body: yaml
            });
        }
    }, 2000);
});
```

### Custom Save Handler

```javascript
const editor = init({
    container: '#editor',
    onSave: async (yaml) => {
        const response = await fetch('/api/contracts/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/yaml' },
            body: yaml
        });

        if (response.ok) {
            alert('Saved successfully!');
        } else {
            alert('Save failed!');
        }
    }
});
```

### View Switching Controls

```javascript
const editor = init({
    container: '#editor',
    initialView: 'yaml'
});

document.getElementById('yaml-btn').addEventListener('click', () => {
    editor.setView('yaml');
});

document.getElementById('form-btn').addEventListener('click', () => {
    editor.setView('form');
});

document.getElementById('diagram-btn').addEventListener('click', () => {
    editor.setView('diagram');
});
```

### Team Lookup Integration

```javascript
const editor = init({
    container: '#editor',
    lookupTeamName: async (teamId) => {
        const response = await fetch(`/api/teams/${teamId}`);
        const team = await response.json();
        return team.name;
    }
});
```

## Build Output

The library build creates the following files in the `dist/` directory:

- `datacontract-editor.es.js` - Main ES module bundle
- `datacontract-editor.css` - Styles (must be included)
- `embed-*.js` - Main application code
- `assets/*.js` - Monaco editor workers and language modules
- Various language-specific modules for Monaco editor syntax highlighting

## Browser Compatibility

The editor uses ES modules and requires a modern browser with support for:
- ES2015+ (ES6)
- ES Modules
- Web Workers
- CSS Grid and Flexbox

Supported browsers:
- Chrome/Edge 90+
- Firefox 88+
- Safari 15+

## Important Notes

1. **HTTP Required**: ES modules must be served over HTTP(S), not from `file://` URLs. Use a local development server.

2. **Path Configuration**: Ensure the paths to CSS and JS files are correct relative to your HTML file.

3. **Worker Scripts**: The Monaco editor uses web workers. These are automatically loaded from the `dist/assets/` directory.

4. **CORS**: If serving the editor from a different domain than your API, ensure proper CORS headers are configured.

5. **Bundle Size**: The complete bundle is approximately 6.7 MB uncompressed (1.6 MB gzipped) due to Monaco editor and its language modules. Consider:
   - Using CDN caching
   - HTTP/2 or HTTP/3 for multiplexing
   - Gzip/Brotli compression

## Development

To work on the editor and see changes reflected in your embed:

1. Make changes to the source code
2. Run `npm run build:lib`
3. Refresh your browser

For rapid development, use the main development server:
```bash
npm run dev
```

## Troubleshooting

### "Failed to load resource" errors
- Ensure you're serving files via HTTP, not file://
- Check that all paths in your HTML are correct
- Verify the `dist/` directory contains all built files

### Editor not appearing
- Check browser console for errors
- Verify the container element exists before calling `init()`
- Ensure CSS is loaded

### Monaco editor not working
- Check that worker files in `dist/assets/` are accessible
- Look for CORS errors in the console
- Verify your web server serves `.js` files with the correct MIME type

### Validation not working
- Ensure the `schemaUrl` is accessible
- Check for CORS issues with the schema URL
- Verify the schema URL returns valid JSON Schema

## Support

For issues and questions:
- GitHub Issues: https://github.com/bitol-io/datacontract-editor/issues
- Documentation: https://datacontract.com
