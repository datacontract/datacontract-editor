import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

export default defineConfig({
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
    // Output workers to assets directory
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name]-[hash].js'
      }
    }
  },
  build: {
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
        // Ensure workers are placed in assets/
        chunkFileNames: (chunkInfo) => {
          if (chunkInfo.name.includes('worker')) {
            return 'assets/[name]-[hash].js';
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
})
