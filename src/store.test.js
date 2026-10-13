import { describe, it, expect, beforeEach, vi } from 'vitest';

// The store creates the local file storage backend on import, which feature-detects on window.
vi.hoisted(() => {
  globalThis.window ??= {};
});

import { applyDocumentConfig, initialYaml, useEditorStore } from './store.js';

const ACME = 'apiVersion: v3.2.0\nkind: DataContract\nid: acme\nversion: 1.0.0\nstatus: active\n';

beforeEach(() => {
  useEditorStore.setState({ odcsVersions: null, schemaUrl: null });
  useEditorStore.getState().loadYaml(initialYaml);
});

describe('applyDocumentConfig', () => {
  it('replaces the built-in example with the configured data contract', () => {
    applyDocumentConfig({ yaml: ACME });

    const state = useEditorStore.getState();
    expect(state.yaml).toBe(ACME);
    expect(state.getValue('id')).toBe('acme');
    expect(state.isDirty).toBe(false);
  });

  it('keeps a contract the user already works on', () => {
    useEditorStore.getState().setYaml('id: my-own\n');

    applyDocumentConfig({ yaml: ACME });

    expect(useEditorStore.getState().yaml).toBe('id: my-own\n');
  });

  it('sets the configured schemas', () => {
    const odcsVersions = [{ version: null, schema: 'https://example.org/acme.json', default: true }];

    applyDocumentConfig({ odcsVersions, schemaUrl: 'https://example.org/acme.json' });

    expect(useEditorStore.getState()).toMatchObject({ odcsVersions, schemaUrl: 'https://example.org/acme.json' });
  });

  it('changes nothing for an empty config', () => {
    applyDocumentConfig({});

    expect(useEditorStore.getState()).toMatchObject({ yaml: initialYaml, odcsVersions: null, schemaUrl: null });
  });
});
