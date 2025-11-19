# Data Contract Editor

A modern web-based editor for creating and managing data contracts using the Open Data Contract Standard (ODCS). This application provides both form-based and YAML code editing interfaces with real-time preview capabilities.

## Features

- **Dual Editing Modes**: Switch between intuitive form-based editing and direct YAML code editing
- **Schema Management**: Individual schema editors accessible via sidebar navigation
- **Real-time Preview**: Live preview of data contracts with syntax validation
- **File Operations**: Load contracts from local storage or files
- **ODCS Compliance**: Full support for Open Data Contract Standard v3.0.1

## Technology Stack

### Frontend Framework
- **React 19** - Modern React with concurrent features
- **Vite** - Fast build tool and development server
- **React Router v7** - Client-side routing for SPA navigation

### State Management
- **Zustand** - Lightweight state management for editor state and YAML content

### Code Editing
- **Monaco Editor** - VS Code-powered editor with syntax highlighting
- **monaco-yaml** - YAML language support and validation
- **YAML.js** - YAML parsing and stringification

### Styling
- **Tailwind CSS v4** - Utility-first CSS framework for modern UI design

### Development Tools
- **ESLint** - Code linting and quality enforcement
- **TypeScript Types** - Type definitions for React components
- **Vite Workers** - Optimized web worker configuration for Monaco Editor

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint
```

## Usage

### Standalone Application

1. **Load a Contract**: Use the "Load from Storage" button to import existing contracts
2. **Navigate Schemas**: Click on individual schemas in the sidebar to edit them
3. **Toggle Views**: Switch between form and YAML editing modes
4. **Preview**: Enable the preview panel to see real-time contract rendering

### Embedding in Your Website

The Data Contract Editor can be embedded in any HTML page or web application. See the [Embedding Guide](#embedding-guide) below for detailed instructions.

## Sample Data

The application includes sample data contracts in the `public/` directory demonstrating various ODCS features and schema configurations.

## Technical Notes

### Monaco Editor & Web Workers

The application includes a properly configured setup for Monaco Editor with Vite:

- **Worker Configuration**: Located in `src/lib/monaco-workers.js` - configures web workers for different language services (JSON, CSS, HTML, TypeScript, and the main editor)
- **Vite Integration**: The `vite.config.js` includes optimized dependencies and manual chunking for Monaco Editor
- **Error Handling**: The YAML editor gracefully handles monaco-yaml configuration failures and continues with basic editing capabilities

This setup resolves the common "Could not create web worker" errors when using Monaco Editor with Vite in modern browsers.

## Embedding Guide

The Data Contract Editor can be easily embedded into any HTML page or integrated into existing web applications.

- **🚀 Quick Start**: See [QUICK-START-EMBEDDING.md](QUICK-START-EMBEDDING.md)
- **📖 Full Documentation**: See [EMBEDDING.md](EMBEDDING.md)
- **📋 Implementation Summary**: See [SUMMARY.md](SUMMARY.md)
- **✅ Test Results**: See [TEST-RESULTS.md](TEST-RESULTS.md)

### Building the Embeddable Version

```bash
# Build just the library version
npm run build:lib

# Build both standalone and library versions
npm run build:all
```

This creates:
- `dist/datacontract-editor.es.js` - ES Module build (for modern browsers and bundlers)
- `dist/datacontract-editor.umd.js` - UMD build (for direct browser usage)
- `dist/datacontract-editor.css` - Bundled styles

### Basic Usage

#### Option 1: UMD Build (Plain HTML)

```html
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="datacontract-editor.css">
</head>
<body>
    <div id="editor"></div>

    <script src="datacontract-editor.umd.js"></script>
    <script>
        const editor = DataContractEditor.init({
            container: '#editor',
            yaml: 'apiVersion: "v3.1.0"\nkind: "DataContract"\n...',
            schemaUrl: 'https://raw.githubusercontent.com/bitol-io/open-data-contract-standard/refs/heads/dev/schema/odcs-json-schema-v3.1.0.json'
        });
    </script>
</body>
</html>
```

#### Option 2: ES Module (Modern Browsers)

```html
<div id="editor"></div>

<script type="module">
    import { init } from './datacontract-editor.es.js';

    const editor = init({
        container: '#editor',
        yaml: '...'
    });
</script>
```

### Configuration Options

The `init()` function accepts a configuration object with the following options:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `container` | `string \| HTMLElement` | `'#datacontract-editor'` | CSS selector or DOM element for the editor |
| `yaml` | `string` | Default template | Initial YAML content |
| `schemaUrl` | `string` | ODCS v3.1.0 schema | JSON Schema URL for validation |
| `serverTypes` | `string[] \| null` | `null` (all) | Limit available server types |
| `availableViews` | `string[]` | `['yaml', 'form', 'diagram']` | Available view modes |
| `initialView` | `string` | `'yaml'` | Starting view (`'yaml'`, `'form'`, or `'diagram'`) |
| `testEndpoint` | `string` | `'/test'` | Test API endpoint |
| `onSave` | `function` | `null` | Callback when save is triggered: `(yaml) => void` |
| `lookupTeamName` | `function` | `null` | Team name resolver: `(id) => Promise<string>` |
| `backend` | `object` | `LocalFileStorageBackend` | Custom storage backend instance |
| `enablePersistence` | `boolean` | `false` | Enable localStorage persistence |

### Advanced Examples

#### Custom Save Handler

```javascript
const editor = DataContractEditor.init({
    container: '#editor',
    onSave: async (yaml) => {
        // Save to your backend
        await fetch('/api/contracts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/yaml' },
            body: yaml
        });
        console.log('Contract saved!');
    }
});
```

#### Filtered Server Types

```javascript
const editor = DataContractEditor.init({
    container: '#editor',
    // Only allow these server types
    serverTypes: ['snowflake', 'bigquery', 'postgres', 'redshift']
});
```

#### Team Name Lookup

```javascript
const editor = DataContractEditor.init({
    container: '#editor',
    lookupTeamName: async (teamId) => {
        const response = await fetch(`/api/teams/${teamId}`);
        const team = await response.json();
        return team.name;
    }
});
```

### Programmatic API

The editor instance returned by `init()` provides methods for programmatic control:

```javascript
const editor = DataContractEditor.init({ container: '#editor' });

// Get current YAML content
const yaml = editor.getYaml();

// Set YAML content
editor.setYaml('apiVersion: "v3.1.0"...');

// Check for unsaved changes
const isDirty = editor.isDirty();

// Switch views
editor.setView('form');     // 'yaml', 'form', or 'diagram'
const currentView = editor.getView();

// Run tests
await editor.runTest('production');

// Get validation errors
const markers = editor.getMarkers();

// Subscribe to state changes
const unsubscribe = editor.subscribe((state) => {
    console.log('Editor state changed:', state);
});

// Clean up
editor.destroy();
```

### Examples

See the `examples/` directory for complete working examples:

- **basic-embed.html** - Simple integration with minimal configuration
- **advanced-embed.html** - Full-featured example with custom callbacks
- **esm-embed.html** - ES Module usage for modern browsers
