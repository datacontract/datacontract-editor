import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import App from './App.jsx'
import { LocalFileStorageBackend } from './services/LocalFileStorageBackend.js'
import { useEditorStore, setOverrideStore } from './store.js'
import './index.css'
import './App.css'
import './components/diagram/DiagramStyles.css'

/**
 * Data Contract Editor - Embeddable Component
 *
 * This module provides an easy way to embed the Data Contract Editor
 * into any HTML page or web application.
 */

// Store the active editor instance
let activeEditorInstance = null;

// Global store instance for the embedded editor
let globalEditorStore = null;
let globalBackend = null;

/**
 * Default configuration for the editor
 */
const DEFAULT_CONFIG = {
  // Container element (string selector or DOM element)
  container: '#datacontract-editor',

  // Initial YAML content
  yaml: 'apiVersion: "v3.1.0"\nkind: "DataContract"\nid: example-id\nversion: "0.0.1"\nstatus: draft\n',

  // Schema URL for validation
  schemaUrl: 'https://raw.githubusercontent.com/bitol-io/open-data-contract-standard/refs/heads/dev/schema/odcs-json-schema-v3.1.0.json',

  // Available server types (null = all, array = filtered list)
  serverTypes: null,

  // Available views (yaml, form, diagram)
  availableViews: ['yaml', 'form', 'diagram'],

  // Initial view
  initialView: 'yaml',

  // Test configuration
  tests: {
    enabled: true,
    dataContractCliApiServerUrl: null, // null means use relative /test endpoint
  },

  // Editor mode: 'SERVER' (default), 'DESKTOP', or 'EMBEDDED'
  // - SERVER: Server mode with full menu
  // - DESKTOP: Desktop mode with file operations in menu
  // - EMBEDDED: Embedded mode with Cancel/Delete/Save buttons, no menu
  mode: 'SERVER',

  // Callbacks
  onSave: null,        // (yaml) => void
  onCancel: null,      // () => void - only for EMBEDDED mode
  onDelete: null,      // () => void - only for EMBEDDED mode

  // Optional lists for dropdowns (if not provided, text fields are used)
  teams: null,         // Array of {id: string, name: string} or null
  domains: null,       // Array of {id: string, name: string} or null

  // Custom backend
  backend: null,

  // Enable/disable localStorage persistence
  enablePersistence: false,

  // Base path for assets (workers, etc.) - auto-detected if not provided
  basePath: null,
};

/**
 * Create a custom Zustand store with configuration
 */
function createConfiguredStore(config) {
  const fileStorageBackend = config.backend || new LocalFileStorageBackend();
  globalBackend = fileStorageBackend;

  const storeConfig = (set, get) => {
    const actions = {
      setYaml: (newYaml) => {
        set({ yaml: newYaml, isDirty: true });
      },
      loadYaml: (newYaml) => set({ yaml: newYaml, isDirty: false }),
      markClean: () => set({ isDirty: false }),
      clearSaveInfo: () => set({ lastSaveInfo: null }),
      addNotification: (notification) => {
        const id = Date.now() + Math.random();
        const newNotification = {
          id,
          type: 'info',
          duration: 3000,
          ...notification,
        };
        set((state) => ({
          notifications: [...state.notifications, newNotification]
        }));

        if (newNotification.duration > 0) {
          setTimeout(() => {
            set((state) => ({
              notifications: state.notifications.filter(n => n.id !== id)
            }));
          }, newNotification.duration);
        }

        return id;
      },
      removeNotification: (id) => set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id)
      })),
      togglePreview: () => set((state) => ({
        isPreviewVisible: !state.isPreviewVisible,
        isWarningsVisible: state.isPreviewVisible ? false : false,
        isTestResultsVisible: state.isPreviewVisible ? false : false,
      })),
      toggleWarnings: () => set((state) => ({
        isWarningsVisible: !state.isWarningsVisible,
        isPreviewVisible: state.isWarningsVisible ? false : false,
        isTestResultsVisible: state.isWarningsVisible ? false : false,
      })),
      toggleTestResults: () => set((state) => ({
        isTestResultsVisible: !state.isTestResultsVisible,
        isPreviewVisible: state.isTestResultsVisible ? false : false,
        isWarningsVisible: state.isTestResultsVisible ? false : false,
      })),
      runTest: async (server) => {
        const { yaml } = get();
        set({ isTestRunning: true });
        try {
          // Build the test endpoint URL
          const baseUrl = config.tests?.dataContractCliApiServerUrl || '';
          const testEndpoint = `${baseUrl}/test`;
          const url = server
            ? `${testEndpoint}?server=${encodeURIComponent(server)}`
            : testEndpoint;
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'text/plain',
            },
            body: yaml,
          });

          if (!response.ok) {
            let errorMessage = `Server returned error: ${response.status} ${response.statusText}`;
            try {
              const errorData = await response.json();
              if (errorData.message) {
                errorMessage = errorData.message;
              } else if (errorData.error) {
                errorMessage = errorData.error;
              }
            } catch {
              try {
                const errorText = await response.text();
                if (errorText) {
                  errorMessage = errorText;
                }
              } catch {
                // Keep default error message
              }
            }
            throw new Error(errorMessage);
          }

          const result = await response.json();
          let success = false;
          if (result.result) {
            success = result.result === 'passed' || result.result === 'pass';
          } else if (Array.isArray(result.checks)) {
            const hasFailures = result.checks.some(check =>
              check.result === 'failed' || check.result === 'fail' || check.result === false
            );
            success = !hasFailures;
          }

          const newResult = {
            timestamp: new Date().toISOString(),
            success: success,
            data: result,
          };

          set({ testResults: [newResult], isTestRunning: false });
          return newResult;
        } catch (error) {
          let errorMessage = error.message;
          let isConnectionError = false;

          if (error.name === 'TypeError' && error.message.includes('fetch')) {
            errorMessage = 'Cannot connect to test server.';
            isConnectionError = true;
          } else if (error.message === 'Unexpected end of JSON input' || error.message.includes('JSON')) {
            errorMessage = 'Test server returned an invalid response.';
          }

          const errorResult = {
            timestamp: new Date().toISOString(),
            success: false,
            error: errorMessage,
            isConnectionError: isConnectionError,
          };

          set({ testResults: [errorResult], isTestRunning: false });
          throw error;
        }
      },
      clearTestResults: () => set({ testResults: [] }),
      setMarkers: (markers) => set({ markers }),
      setView: (view) => set({ currentView: view }),
      setSelectedDiagramSchemaIndex: (index) => set({ selectedDiagramSchemaIndex: index }),
      setSchemaInfo: (schemaUrl, schemaData) => set({ schemaUrl, schemaData }),
      loadFromFile: async () => {
        try {
          const yamlContent = await fileStorageBackend.loadYamlFile();
          set({ yaml: yamlContent, isDirty: false });
          return yamlContent;
        } catch (error) {
          if (error.message !== 'File selection cancelled') {
            throw error;
          }
        }
      },
      saveToFile: async (suggestedName = 'datacontract.yaml') => {
        const { yaml } = get();

        // Use custom onSave callback if provided
        if (config.onSave) {
          config.onSave(yaml);
          set({ isDirty: false });
          return;
        }

        await fileStorageBackend.saveYamlFile(yaml, suggestedName);
        set({ isDirty: false });
      },
    };

    return {
      yaml: config.yaml,
      isDirty: false,
      isPreviewVisible: true,
      isWarningsVisible: false,
      isTestResultsVisible: false,
      isTestRunning: false,
      testResults: [],
      markers: [],
      currentView: config.initialView,
      schemaUrl: config.schemaUrl,
      schemaData: null,
      yamlCursorLine: 1,
      lastSaveInfo: null,
      notifications: [],
      selectedDiagramSchemaIndex: null, // Currently selected schema in diagram view
      // Store editor config for components to access
      editorConfig: {
        mode: config.mode,
        onCancel: config.onCancel,
        onDelete: config.onDelete,
        teams: config.teams,
        domains: config.domains,
        tests: config.tests,
      },
      ...actions,
    };
  };

  if (config.enablePersistence) {
    return create()(
      persist(storeConfig, {
        name: 'datacontract-editor-store',
        storage: createJSONStorage(() => localStorage),
      })
    );
  } else {
    return create()(storeConfig);
  }
}

/**
 * Initialize the Data Contract Editor
 *
 * @param {Object} userConfig - Configuration options
 * @returns {Object} Editor instance with control methods
 */
export function init(userConfig = {}) {
  // Merge user config with defaults
  const config = { ...DEFAULT_CONFIG, ...userConfig };

  // Set up base path for workers if provided
  if (config.basePath && typeof window !== 'undefined') {
    window.__DATACONTRACT_EDITOR_BASE_PATH__ = config.basePath;
  }

  // Get container element
  let containerElement;
  if (typeof config.container === 'string') {
    containerElement = document.querySelector(config.container);
    if (!containerElement) {
      throw new Error(`Container element not found: ${config.container}`);
    }
  } else if (config.container instanceof HTMLElement) {
    containerElement = config.container;
  } else {
    throw new Error('Container must be a CSS selector string or HTMLElement');
  }

  // Destroy existing instance if any
  if (activeEditorInstance) {
    activeEditorInstance.destroy();
  }

  // Create the store with configuration
  globalEditorStore = createConfiguredStore(config);

  // Inject the configured store so all components will use it
  setOverrideStore(globalEditorStore);

  // Create root and render
  const root = createRoot(containerElement);

  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );

  // Create the instance API
  const instance = {
    /**
     * Get current YAML content
     */
    getYaml() {
      return globalEditorStore.getState().yaml;
    },

    /**
     * Set YAML content
     */
    setYaml(yaml) {
      globalEditorStore.getState().loadYaml(yaml);
    },

    /**
     * Check if editor has unsaved changes
     */
    isDirty() {
      return globalEditorStore.getState().isDirty;
    },

    /**
     * Set the current view
     */
    setView(view) {
      if (!config.availableViews.includes(view)) {
        throw new Error(`View "${view}" is not available. Available views: ${config.availableViews.join(', ')}`);
      }
      globalEditorStore.getState().setView(view);
    },

    /**
     * Get current view
     */
    getView() {
      return globalEditorStore.getState().currentView;
    },

    /**
     * Run tests
     */
    async runTest(server) {
      return globalEditorStore.getState().runTest(server);
    },

    /**
     * Get validation markers
     */
    getMarkers() {
      return globalEditorStore.getState().markers;
    },

    /**
     * Subscribe to state changes
     */
    subscribe(callback) {
      return globalEditorStore.subscribe(callback);
    },

    /**
     * Destroy the editor instance
     */
    destroy() {
      root.unmount();
      setOverrideStore(null);
      activeEditorInstance = null;
      globalEditorStore = null;
      globalBackend = null;
    },

    /**
     * Get the store (for advanced usage)
     */
    getStore() {
      return globalEditorStore;
    },
  };

  activeEditorInstance = instance;
  return instance;
}

/**
 * Get the active editor instance
 */
export function getInstance() {
  return activeEditorInstance;
}

/**
 * Export store and backend for use by App components
 * This allows the App to use the configured store when embedded
 */
export function getEditorStore() {
  return globalEditorStore;
}

export function getFileStorageBackend() {
  return globalBackend;
}
