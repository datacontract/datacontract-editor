import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],
  define: {
    'global': 'globalThis',
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  resolve: {
    alias: {
      'path': 'path-browserify'
    }
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/embed.jsx'),
      name: 'DataContractEditor',
      formats: ['es', 'umd'],
      fileName: (format) => `datacontract-editor.${format}.js`
    },
    rollupOptions: {
      // Externalize dependencies for ESM build
      // For UMD, we bundle everything
      external: (id) => {
        // Don't externalize anything for UMD build
        return false;
      },
      output: {
        // Use named exports only
        exports: 'named',
        // Provide global variables for UMD build
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') return 'datacontract-editor.css';
          return assetInfo.name;
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
