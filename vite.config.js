import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'
import { createRequire } from 'module'
import { readFileSync } from 'fs'

const require = createRequire(import.meta.url)
const pkg = require('./package.json')
const monacoVersion = pkg.dependencies['@monaco-editor/react'].replace(/[^\d.]/g, '')

// Publishes the editor version as datacontract-editor-version.json, so the daily
// deployment check can see which version editor.datacontract.com runs
function versionFilePlugin() {
  return {
    name: 'version-file',
    apply: 'build',
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'datacontract-editor-version.json',
        source: JSON.stringify({ version: pkg.version }) + '\n',
      });
    },
  };
}

// Dev-only plugin to serve dev-config.json as /config.json
function devConfigPlugin() {
  return {
    name: 'dev-config',
    configureServer(server) {
      server.middlewares.use('/config.json', (req, res) => {
        try {
          const content = readFileSync(resolve(__dirname, 'dev-config.json'), 'utf-8');
          res.setHeader('Content-Type', 'application/json');
          res.end(content);
        } catch {
          res.statusCode = 404;
          res.end();
        }
      });
    },
  };
}

// The module name that the `shared-monaco` build imports Monaco from. The host page maps it to
// its own Monaco with an import map.
const SHARED_MONACO = 'monaco-shared'

// `vite build --mode shared-monaco` builds the same library without Monaco, monaco-yaml and the
// workers: `#monaco` becomes the external module `monaco-shared`. A host that embeds several
// Monaco editors uses it to load Monaco once. That build does not run standalone.
export default defineConfig(({ mode }) => {
  const sharedMonaco = mode === 'shared-monaco'
  return {
  plugins: [
    tailwindcss(),
    react(),
    mode === 'custom' && devConfigPlugin(),
    versionFilePlugin(),
  ],
  // Use relative base for assets to support context paths
  base: './',
  define: {
    'global': 'globalThis',
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  resolve: {
    alias: {
      'path': 'path-browserify',
      '#monaco': sharedMonaco ? SHARED_MONACO : resolve(__dirname, 'src/lib/monaco-bundled.js'),
    }
  },
  worker: {
    format: 'es',
    // Output workers with version-based names for stable caching
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name]-${monacoVersion}.js`
      }
    }
  },
  build: {
    outDir: 'dist',
    copyPublicDir: true,
    // Enable sourcemaps in debug mode
    sourcemap: mode === 'debug' ? true : false,
    // Disable minification in debug mode for easier debugging
    minify: mode === 'debug' ? false : 'oxc',
    lib: {
      entry: resolve(__dirname, 'src/embed.jsx'),
      name: 'DataContractEditor',
      formats: ['es'],
      fileName: () => `datacontract-editor.es.js`
    },
    rollupOptions: {
      external: sharedMonaco ? [SHARED_MONACO] : [],
      output: {
        exports: 'named',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') return 'datacontract-editor.css';
          return assetInfo.name;
        },
        // Split Monaco into its own chunk for stable caching
        manualChunks: (id) => {
          // Without Monaco the chunk would hold only the small React wrapper of Monaco
          if (sharedMonaco) return;
          if (/node_modules\/(monaco-editor|@monaco-editor|monaco-yaml|vscode-|yaml-language-server|jsonc-parser)/.test(id)) {
            return 'monaco';
          }
        },
        // Use version-based names for Monaco chunk, hash for others
        chunkFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'monaco') {
            return `monaco-${monacoVersion}.js`;
          }
          if (chunkInfo.name.includes('worker')) {
            return `assets/[name]-${monacoVersion}.js`;
          }
          return '[name]-[hash].js';
        }
      }
    },
    // Increase chunk size warnings threshold for Monaco
    chunkSizeWarningLimit: 5000,
    // Ensure all assets are properly bundled
    cssCodeSplit: false,
  },
  optimizeDeps: {
    include: [
      'monaco-editor/esm/vs/editor/edcore.main.js',
      'monaco-yaml'
    ]
  }
}})
