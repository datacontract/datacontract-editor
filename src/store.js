import {create} from 'zustand'
import {devtools, persist, createJSONStorage} from 'zustand/middleware'
import {LocalFileStorageBackend} from './services/LocalFileStorageBackend.js'
import * as Yaml from "yaml";
import { DEFAULT_AI_CONFIG, DEFAULT_TESTS_CONFIG } from './config/defaults.js';
import { fetchAllDefinitions as fetchAllDefinitionsApi, definitionsArrayToMap } from './lib/definitionsApi.js';

// Storage backend instance - can be set via setFileStorageBackend
let fileStorageBackend = new LocalFileStorageBackend();

export const initialYaml = 'apiVersion: "v3.1.0"\nkind: "DataContract"\nid: "example-id"\nversion: "0.0.1"\nstatus: draft\nname: "Example Data Contract"\n';

/**
 * Set the file storage backend to use for the editor
 * @param {FileStorageBackend} backend - The storage backend instance
 */
export const setFileStorageBackend = (backend) => {
	fileStorageBackend = backend;
};

/**
 * Get the current file storage backend
 * @returns {FileStorageBackend}
 */
export const getFileStorageBackend = () => {
	return fileStorageBackend;
};

// Override store - when set, useEditorStore will use this instead of the default store
let overrideStore = null;

/**
 * Set the override store for embedded mode
 * @param {Object} store - The zustand store instance to use
 */
export const setOverrideStore = (store) => {
	overrideStore = store;
};

/**
 * Get the override store
 * @returns {Object|null}
 */
export const getOverrideStore = () => {
	return overrideStore;
};

export function getValueWithPath(obj, path, defaultValue) {
	const keys = path?.split(/\.|\[|\]/).filter(Boolean);
	const result = keys?.reduce((acc, key) => acc?.[key], obj);
	return result !== undefined ? result : defaultValue;
}

export function setValueWithPath(obj, path, value) {
	// Deep clone the object to avoid mutations
	const newObj = JSON.parse(JSON.stringify(obj || {}));
	const keys = path.match(/[^.[\]]+/g);
	keys.slice(0, -1).reduce((acc, key, i) =>
		acc[key] = acc[key] || (/^\d+$/.test(keys[i + 1]) ? [] : {}), newObj
	)[keys[keys.length - 1]] = value;
	return newObj;
}

export function defaultStoreConfig(set, get) {
	// Define action functions to ensure stable references
	const actions = {
		setYaml: (newYaml) => {
			try {
				const yamlParts = Yaml.parse(newYaml);
				set({yaml: newYaml, isDirty: true, yamlParts});
			} catch(e) {
				// NOOP
			}
		},
		loadYaml: (newYaml) => {
			try {
				const yamlParts = Yaml.parse(newYaml);
				set({yaml: newYaml, baselineYaml: newYaml, isDirty: false, yamlParts});
			} catch(e) {
				// NOOP
			}
		},
		getValue: (path) => getValueWithPath(get().yamlParts, path),
		setValue: (path, value) => {
			const newYamlParts = setValueWithPath(get().yamlParts, path, value);
			set({yamlParts: newYamlParts, yaml: Yaml.stringify(newYamlParts), isDirty: true})
		},
		clearSaveInfo: () => set({lastSaveInfo: null}),
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

			// Auto-remove notification after duration
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
		toggleMobileSidebar: () => set((state) => ({
			isMobileSidebarOpen: !state.isMobileSidebarOpen,
		})),
		closeMobileSidebar: () => set({ isMobileSidebarOpen: false }),
		togglePreview: () => set((state) => ({
			isPreviewVisible: !state.isPreviewVisible,
			isWarningsVisible: false,
			isTestResultsVisible: false,
		})),
		toggleWarnings: () => set((state) => ({
			isWarningsVisible: !state.isWarningsVisible,
			isPreviewVisible: false,
			isTestResultsVisible: false,
		})),
		toggleTestResults: () => set((state) => ({
			isTestResultsVisible: !state.isTestResultsVisible,
			isPreviewVisible: false,
			isWarningsVisible: false,
		})),
		toggleAiPanel: () => set((state) => ({
			isAiPanelOpen: !state.isAiPanelOpen,
		})),
		openAiPanel: () => set({ isAiPanelOpen: true }),
		closeAiPanel: () => set({ isAiPanelOpen: false }),
		resetAiChat: () => set((state) => ({ aiChatResetKey: (state.aiChatResetKey || 0) + 1, aiChatHasMessages: false })),
		setAiChatHasMessages: (hasMessages) => set({ aiChatHasMessages: hasMessages }),
		runTest: async (server) => {
			const {yaml, editorConfig} = get();
			set({isTestRunning: true});
			try {
				// Build the test endpoint URL
				const baseUrl = editorConfig?.tests?.dataContractCliApiServerUrl || 'https://api.datacontract.com';
				const testEndpoint = `${baseUrl}/test`;
				const url = server ? `${testEndpoint}?server=${encodeURIComponent(server)}` : testEndpoint;

				// Build headers with optional API key
				const headers = {
					'Content-Type': 'text/plain',
				};
				if (editorConfig?.tests?.apiKey) {
					headers['X-API-KEY'] = editorConfig.tests.apiKey;
				}

				const response = await fetch(url, {
					method: 'POST',
					headers,
					body: yaml,
				});

				// Check if response status is OK
				if (!response.ok) {
					let errorMessage = `Server returned error: ${response.status} ${response.statusText}`;

					// Try to parse error response as JSON
					try {
						const errorData = await response.json();
						if (errorData.message) {
							errorMessage = errorData.message;
						} else if (errorData.error) {
							errorMessage = errorData.error;
						}
					} catch {
						// If JSON parsing fails, try to get text
						try {
							const errorText = await response.text();
							if (errorText) {
								errorMessage = errorText;
							}
						} catch {
							// Keep the default error message
						}
					}

					throw new Error(errorMessage);
				}

				// Parse successful response
				const result = await response.json();

				// Determine success from response data's result field
				let success = false;
				if (result.result) {
					// Use the result field from the response
					success = result.result === 'passed' || result.result === 'pass';
				} else if (Array.isArray(result.checks)) {
					// Fallback: check if any checks failed
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

				// Keep only the current result (no history)
				set({testResults: [newResult], isTestRunning: false});

				return newResult;
			} catch (error) {
				// Provide better error messages for common issues
				let errorMessage = error.message;
				let isConnectionError = false;

				if (error.name === 'TypeError' && error.message.includes('fetch')) {
					const displayUrl = editorConfig?.tests?.dataContractCliApiServerUrl || 'https://api.datacontract.com';
					errorMessage = `Cannot connect to Data Contract CLI at ${displayUrl}.`;
					isConnectionError = true;
				} else if (error.message === 'Unexpected end of JSON input' || error.message.includes('JSON')) {
					errorMessage = 'Test server returned an invalid response. The server may be misconfigured or not responding correctly.';
				}

				const errorResult = {
					timestamp: new Date().toISOString(),
					success: false,
					error: errorMessage,
					isConnectionError: isConnectionError,
				};

				// Keep only the current result (no history)
				set({testResults: [errorResult], isTestRunning: false});

				throw error;
			}
		},
		clearTestResults: () => set({testResults: []}),
		setMarkers: (markers) => set({markers}),
		// AI pending change actions
		setPendingAiChange: (change) => set({ pendingAiChange: change }),
		clearPendingAiChange: () => set({ pendingAiChange: null }),
		applyPendingAiChange: () => {
			const { pendingAiChange, yaml } = get();
			if (pendingAiChange?.isValid && pendingAiChange?.updatedYaml) {
				// Store original YAML for unapply
				set({ lastAppliedAiChange: { originalYaml: yaml, summary: pendingAiChange.summary } });
				actions.setYaml(pendingAiChange.updatedYaml);
			}
			set({ pendingAiChange: null });
		},
		unapplyAiChange: () => {
			const { lastAppliedAiChange } = get();
			if (lastAppliedAiChange?.originalYaml) {
				actions.setYaml(lastAppliedAiChange.originalYaml);
				set({ lastAppliedAiChange: null });
			}
		},
		clearLastAppliedAiChange: () => set({ lastAppliedAiChange: null }),
		setView: (view) => set({currentView: view}),
		setSelectedDiagramSchemaIndex: (index) => set({selectedDiagramSchemaIndex: index}),
		setSchemaInfo: (schemaUrl, schemaData) => set({schemaUrl, schemaData}),
		// Definitions functions for semantic definitions support
		fetchAllDefinitions: async () => {
			const { editorConfig } = get();
			const org = editorConfig?.semantics?.organizationVanityUrl;

			if (!org) {
				console.warn('fetchAllDefinitions: organizationVanityUrl not configured in editorConfig.semantics');
				return [];
			}

			try {
				const definitions = await fetchAllDefinitionsApi(org);
				const definitionsMap = definitionsArrayToMap(definitions, org);
				set({ definitionsMap });
				return definitions;
			} catch (error) {
				console.error('Error in fetchAllDefinitions:', error);
				return [];
			}
		},
		getDefinition: (definitionUrl) => {
			const { definitionsMap } = get();
			if (!definitionsMap || typeof definitionsMap.get !== 'function') {
				return null;
			}
			return definitionsMap.get(definitionUrl) || null;
		},
		loadFromFile: async (filename = null) => {
			try {
				const yamlContent = await fileStorageBackend.loadYamlFile(filename);

				// Try to parse the YAML to get the contract name
				let contractName = 'untitled';
				try {
					const parsed = Yaml.parse(yamlContent);
					contractName = parsed.name || 'untitled';
				} catch {
					// If parsing fails, use default
				}

				// Set the loaded file info so subsequent saves update the same file
				get().setYaml(yamlContent);
				set({
					baselineYaml: yamlContent,
					lastSaveInfo: filename ? {
						filename: filename,
						timestamp: new Date().toISOString(),
						contractName: contractName
					} : null
				});
				return yamlContent;
			} catch (error) {
				if (error.message !== 'File selection cancelled') {
					throw error;
				}
			}
		},
		saveToFile: async (suggestedName) => {
			const {yaml, lastSaveInfo} = get();
			const dataContract = Yaml.parse(yaml);

			// Validate required fundamental fields
			const requiredFields = ['name', 'version', 'status', 'id'];
			const missingFields = requiredFields.filter(field => !dataContract[field] || dataContract[field].trim() === '');

			if (missingFields.length > 0) {
				const missingFieldsList = missingFields.join(', ');
				throw new Error(`Cannot save: Missing required fields: ${missingFieldsList}`);
			}

			const dataContractName = dataContract.name.replace(/[^a-zA-Z0-9_-]/g, '_');
			const suggestedFilename = `${suggestedName || dataContractName}.yaml`;

			// If we have a previous save, pass the filename to update the existing file
			const existingFilename = lastSaveInfo?.filename;
			const result = await fileStorageBackend.saveYamlFile(
				yaml,
				suggestedFilename,
				existingFilename
			);

			// Update save status and baseline
			set({
				isDirty: false,
				baselineYaml: yaml,
				lastSaveInfo: {
					filename: result?.filename || suggestedFilename,
					timestamp: new Date().toISOString(),
					contractName: dataContract.name
				}
			});

			// Show success notification
			const {addNotification} = get();
			addNotification({
				type: 'success',
				title: 'Saved successfully',
				message: `${result?.filename || suggestedFilename} has been saved`,
				duration: 3000
			});
		},
	};


	return {
		yaml: initialYaml,
		yamlParts: Yaml.parse(initialYaml),
		baselineYaml: initialYaml, // YAML at last save/load for diff comparison
		isDirty: false,
		isMobileSidebarOpen: false,
		isPreviewVisible: true,
		isWarningsVisible: false,
		isTestResultsVisible: false,
		isTestRunning: false,
		testResults: [],
		markers: [],
		currentView: 'form', // 'yaml' or 'form'
		schemaUrl: null,
		schemaData: null,
		yamlCursorLine: 1,
		lastSaveInfo: null, // { filename, timestamp, contractName }
		notifications: [], // { id, type, message, duration }
		selectedDiagramSchemaIndex: null, // Currently selected schema in diagram view
		selectedProperty: null, // { schemaIndex, propPath, property, onUpdate, onDelete } for property details drawer
		definitionsMap: new Map(), // Map<url, definition> for semantic definitions
		editorConfig: {
			mode: 'SERVER', // SERVER, DESKTOP, or EMBEDDED
			onCancel: null,
			onDelete: null,
			showDelete: true, // Show Delete button in EMBEDDED mode
			teams: null,
			domains: null,
			tests: DEFAULT_TESTS_CONFIG,
			ai: DEFAULT_AI_CONFIG,
			customizations: null, // See CUSTOMIZATION.md for documentation
		},
		isAiPanelOpen: false,
		aiChatResetKey: 0,
		aiChatHasMessages: false,
		pendingAiChange: null, // { updatedYaml, summary, validationErrors, isValid }
		lastAppliedAiChange: null, // { originalYaml, summary } - for unapply
		...actions,
	};
}


// Create central zustand store for app state
const defaultEditorStore = create()(
	devtools(
		persist(defaultStoreConfig, {
			name: 'editor-store',
			storage: createJSONStorage(() => localStorage),
			merge: (persistedState, currentState) => {
				// Deep merge editorConfig, ensuring empty strings don't override build-time defaults
				const persistedAi = persistedState?.editorConfig?.ai || {};
				const defaultAi = currentState.editorConfig?.ai || {};

				const mergedEditorConfig = {
					...currentState.editorConfig,
					...persistedState?.editorConfig,
					tests: {
						...currentState.editorConfig?.tests,
						...persistedState?.editorConfig?.tests,
					},
					ai: {
						...defaultAi,
						...persistedAi,
						// Prefer build-time defaults over empty persisted values
						endpoint: persistedAi.endpoint || defaultAi.endpoint,
						apiKey: persistedAi.apiKey || defaultAi.apiKey,
					},
				};
				return {
					...currentState,
					...persistedState,
					editorConfig: mergedEditorConfig,
				};
			},
			onRehydrateStorage: () => (state) => {
				// Sync yamlParts from yaml when rehydrating from localStorage
				// setTimeout needed because defaultEditorStore isn't fully initialized yet
				if (state?.yaml) {
					setTimeout(() => {
						try {
							const yamlParts = Yaml.parse(state.yaml);
							defaultEditorStore.setState({ yamlParts });
						} catch (e) {
							console.warn('Failed to parse yaml during rehydration:', e);
						}
					}, 0);
				}
			},
		})
	)
);

/**
 * Hook that returns either the override store (when embedded) or the default store
 * This allows embedded mode to inject a configured store while maintaining backward compatibility
 */
export const useEditorStore = (selector) => {
	const store = overrideStore || defaultEditorStore;
	return store(selector);
};

// Expose setState for direct state updates (needed for event handlers)
useEditorStore.setState = (state) => {
	const store = overrideStore || defaultEditorStore;
	return store.setState(state);
};

useEditorStore.getState = () => {
	const store = overrideStore || defaultEditorStore;
	return store.getState();
};

/**
 * Update the editor configuration
 * @param {Object} config - Configuration object to merge with existing config
 */
export const setEditorConfig = (config) => {
	const store = overrideStore || defaultEditorStore;
	const currentConfig = store.getState().editorConfig;
	store.setState({
		editorConfig: {
			...currentConfig,
			...config,
			// Deep merge the tests object if provided
			tests: config.tests ? {
				...currentConfig.tests,
				...config.tests,
			} : currentConfig.tests,
			// Deep merge the ai object if provided
			ai: config.ai ? {
				...currentConfig.ai,
				...config.ai,
			} : currentConfig.ai,
		},
	});
};
