import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const pkg = require('./package.json')
const monacoVersion = pkg.dependencies['@monaco-editor/react'].replace(/[^\d.]/g, '')

export default defineConfig(({ mode }) => ({
  plugins: [
    tailwindcss(),
    react()
  ],
  // Use relative base for assets to support context paths
  base: './',
  define: {
    'global': 'globalThis',
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  resolve: {
    alias: {
      'path': 'path-browserify'
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
    minify: mode === 'debug' ? false : 'esbuild',
    lib: {
      entry: resolve(__dirname, 'src/embed.jsx'),
      name: 'DataContractEditor',
      formats: ['es'],
      fileName: () => `datacontract-editor.es.js`
    },
    rollupOptions: {
      output: {
        exports: 'named',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') return 'datacontract-editor.css';
          return assetInfo.name;
        },
        // Split Monaco into its own chunk for stable caching
        manualChunks: {
          monaco: ['monaco-editor', '@monaco-editor/react', 'monaco-yaml']
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
      'monaco-editor',
      'monaco-yaml'
    ]
  }
}))
