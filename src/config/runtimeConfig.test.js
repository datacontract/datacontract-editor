import { describe, it, expect, vi, afterEach } from 'vitest';

// The schema registry reads the store; keep the store out of the test.
vi.mock('../store.js', () => ({
  useEditorStore: { getState: () => ({}) },
}));

import { buildDocumentConfig, buildEditorConfig, loadInitialYaml, loadRuntimeConfig } from './runtimeConfig.js';
import { DEFAULT_ODCS_SCHEMA_URL } from '../services/schemaRegistry.js';

afterEach(() => {
  vi.restoreAllMocks();
});

// A fetch that answers the given paths and 404s everything else.
function serve(files) {
  return vi.spyOn(globalThis, 'fetch').mockImplementation(async (path) => {
    const file = files[path];
    if (!file) return new Response('', { status: 404 });
    return new Response(file.body, { status: 200, headers: { 'Content-Type': file.type } });
  });
}

describe('buildEditorConfig', () => {
  it('omits an empty model so the default model is kept', () => {
    const config = buildEditorConfig({
      ai: { enabled: true, endpoint: 'https://example.test/v1/chat/completions', apiKey: 'k', model: '' },
    });
    expect(config.ai.enabled).toBe(true);
    expect('model' in config.ai).toBe(false);
  });

  it('passes a configured model through', () => {
    const config = buildEditorConfig({
      ai: { enabled: true, endpoint: 'https://example.test/v1/chat/completions', model: 'gpt-4o-mini' },
    });
    expect(config.ai.model).toBe('gpt-4o-mini');
  });

  it('enables AI without an API key for auth-less proxies', () => {
    const config = buildEditorConfig({
      ai: { enabled: true, endpoint: 'https://proxy.test/v1/messages', provider: 'anthropic' },
    });
    expect(config.ai).toMatchObject({ enabled: true, apiKey: '', provider: 'anthropic' });
  });

  it('disables AI when enabled is false', () => {
    expect(buildEditorConfig({ ai: { enabled: false, endpoint: 'x' } }).ai).toEqual({ enabled: false });
  });

  it('does not set ai when runtime config has none', () => {
    expect(buildEditorConfig({}).ai).toBeUndefined();
  });
});

describe('buildDocumentConfig', () => {
  it('takes the initial data contract', () => {
    expect(buildDocumentConfig({ yaml: 'id: acme\n' })).toEqual({ yaml: 'id: acme\n' });
  });

  it('validates against a custom schema URL', () => {
    const document = buildDocumentConfig({ schemaUrl: 'https://example.org/acme-schema.json' });
    expect(document.schemaUrl).toBe('https://example.org/acme-schema.json');
    expect(document.odcsVersions).toEqual([{ version: null, schema: 'https://example.org/acme-schema.json', default: true }]);
  });

  it('prefers odcsVersions over the deprecated schemaUrl, like the embed API', () => {
    const document = buildDocumentConfig({
      schemaUrl: 'https://example.org/ignored.json',
      odcsVersions: [
        { version: '3.1.0', schema: 'https://example.org/v3.1.0.json' },
        { version: 'v3.2.0', schema: 'https://example.org/v3.2.0.json', default: true },
      ],
    });
    expect(document.schemaUrl).toBe('https://example.org/v3.2.0.json');
    expect(document.odcsVersions.map((entry) => entry.version)).toEqual(['v3.2.0', 'v3.1.0']);
  });

  it('leaves out what the config does not set, so the built-in defaults stay', () => {
    expect(buildDocumentConfig({})).toEqual({});
    // the Docker image writes empty strings for unset environment variables
    expect(buildDocumentConfig({ yaml: '', schemaUrl: '' })).toEqual({});
  });

  it('ignores an initial data contract that is not valid YAML', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(buildDocumentConfig({ yaml: 'id: [unclosed' })).toEqual({});
  });

  it('does not touch the default schema when only yaml is set', () => {
    expect(buildDocumentConfig({ yaml: 'id: acme\n' }).schemaUrl).toBeUndefined();
    expect(DEFAULT_ODCS_SCHEMA_URL).toContain('v3.2.0');
  });
});

describe('loadInitialYaml', () => {
  it('reads the data contract served next to the app', async () => {
    serve({ '/data-contract.yaml': { body: 'id: acme\n', type: 'application/octet-stream' } });
    expect(await loadInitialYaml()).toBe('id: acme\n');
  });

  it('ignores the SPA fallback page', async () => {
    serve({ '/data-contract.yaml': { body: '<!doctype html>', type: 'text/html' } });
    expect(await loadInitialYaml()).toBeNull();
  });

  it('returns null when there is no file', async () => {
    serve({});
    expect(await loadInitialYaml()).toBeNull();
  });
});

describe('loadRuntimeConfig', () => {
  it('uses data-contract.yaml when config.json has no yaml', async () => {
    serve({
      '/config.json': { body: JSON.stringify({ schemaUrl: 'https://example.org/s.json' }), type: 'application/json' },
      '/data-contract.yaml': { body: 'id: from-file\n', type: 'application/octet-stream' },
    });
    expect(await loadRuntimeConfig()).toMatchObject({ schemaUrl: 'https://example.org/s.json', yaml: 'id: from-file\n' });
  });

  it('keeps the yaml of config.json over data-contract.yaml', async () => {
    serve({
      '/config.json': { body: JSON.stringify({ yaml: 'id: from-config\n' }), type: 'application/json' },
      '/data-contract.yaml': { body: 'id: from-file\n', type: 'application/octet-stream' },
    });
    expect((await loadRuntimeConfig()).yaml).toBe('id: from-config\n');
  });
});
