import { describe, it, expect } from 'vitest';
import { mergePersistedEmbedState } from './embedPersistence.js';

const BUILT_IN = 'id: example-id\n';
const HOST = 'id: acme\n';
const CUSTOM_SCHEMA = [{ version: null, schema: 'https://example.org/acme.json', default: true }];

// The state init() builds from the host's config.
function hostState(overrides = {}) {
  return {
    yaml: HOST,
    yamlParts: { id: 'acme' },
    baselineYaml: HOST,
    isDirty: false,
    odcsVersions: CUSTOM_SCHEMA,
    schemaUrl: 'https://example.org/acme.json',
    schemaData: null,
    isTestRunning: false,
    editorConfig: { ai: { enabled: false }, tests: { enabled: true } },
    ...overrides,
  };
}

const merge = (persisted, current = hostState()) => mergePersistedEmbedState(persisted, current, { builtInYaml: BUILT_IN });

describe('mergePersistedEmbedState', () => {
  it("keeps the user's own contract", () => {
    const merged = merge({ yaml: 'id: mine\n', yamlParts: { id: 'mine' }, baselineYaml: 'id: mine\n', isDirty: true });

    expect(merged).toMatchObject({ yaml: 'id: mine\n', yamlParts: { id: 'mine' }, isDirty: true });
  });

  it("replaces a stored built-in example with the host's initial contract", () => {
    const merged = merge({ yaml: BUILT_IN, yamlParts: { id: 'example-id' }, baselineYaml: BUILT_IN, isDirty: false });

    expect(merged).toMatchObject({ yaml: HOST, yamlParts: { id: 'acme' }, baselineYaml: HOST, isDirty: false });
  });

  it("uses the host's contract when nothing is stored", () => {
    expect(merge(undefined).yaml).toBe(HOST);
  });

  it("validates against the host's schemas, not stored ones", () => {
    const merged = merge({
      yaml: 'id: mine\n',
      odcsVersions: null,
      schemaUrl: 'https://raw.githubusercontent.com/bitol-io/open-data-contract-standard/refs/heads/main/schema/odcs-json-schema-v3.2.0.json',
      schemaData: { title: 'stale' },
    });

    expect(merged).toMatchObject({ odcsVersions: CUSTOM_SCHEMA, schemaUrl: 'https://example.org/acme.json', schemaData: null });
  });

  it('lets the host config win for ai and the user win for tests', () => {
    const merged = merge({
      editorConfig: { ai: { enabled: true, model: 'old' }, tests: { dataContractCliApiServerUrl: 'http://mine' } },
    });

    expect(merged.editorConfig.ai).toEqual({ enabled: false, model: 'old' });
    expect(merged.editorConfig.tests).toEqual({ enabled: true, dataContractCliApiServerUrl: 'http://mine' });
  });

  it('never restores a running test', () => {
    expect(merge({ yaml: 'id: mine\n', isTestRunning: true }).isTestRunning).toBe(false);
  });
});
