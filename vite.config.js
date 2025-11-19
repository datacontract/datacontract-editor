import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
      tailwindcss(),
      react()
  ],
  server: {
    proxy: {
      '/test': {
        target: 'http://localhost:4242',
        changeOrigin: true,
      }
    }
  },
  optimizeDeps: {
    include: [
      'monaco-editor',
      'monaco-yaml'
    ]
  },
  define: {
    'global': 'globalThis',
  },
  resolve: {
    alias: {
      'path': 'path-browserify'
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          monaco: ['monaco-editor'],
        }
      }
    }
  }
})
