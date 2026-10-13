/**
 * How the embedded editor's persisted state is merged with the state built from init() config
 * on rehydrate.
 *
 * The user's work persists: the data contract (unless it is still the built-in example, which
 * the host's initial contract then replaces) and the user-editable `tests` settings. Host
 * configuration wins: `ai`, and the schemas the contract is validated against (`odcsVersions`,
 * `schemaUrl`), so a host that changes its schema does not keep validating against a stale one.
 */
export function mergePersistedEmbedState(persistedState, currentState, { builtInYaml } = {}) {
  const persistedYaml = persistedState?.yaml;
  const keepsPersistedContract = typeof persistedYaml === 'string' && persistedYaml !== builtInYaml;
  const document = keepsPersistedContract
    ? {}
    : {
        yaml: currentState.yaml,
        yamlParts: currentState.yamlParts,
        baselineYaml: currentState.baselineYaml,
        isDirty: currentState.isDirty,
      };

  return {
    ...currentState,
    ...persistedState,
    ...document,
    // a test cannot survive a reload, so never restore a running test
    isTestRunning: false,
    odcsVersions: currentState.odcsVersions,
    schemaUrl: currentState.schemaUrl,
    // loaded again for the configured schema
    schemaData: currentState.schemaData,
    editorConfig: {
      ...currentState.editorConfig,
      ...persistedState?.editorConfig,
      ai: {
        ...persistedState?.editorConfig?.ai,
        ...currentState.editorConfig?.ai,
      },
      tests: {
        ...currentState.editorConfig?.tests,
        ...persistedState?.editorConfig?.tests,
      },
    },
  };
}
