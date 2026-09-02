import { beforeEach, describe, expect, it, vi } from 'vitest';

// The registry reads the host-configured schema URL from the store; keep the store out of the test.
const storeState = { schemaUrl: null, odcsVersions: null, getValue: () => undefined };
vi.mock('../store.js', () => ({
  useEditorStore: { getState: () => storeState },
}));

import {
  DEFAULT_ODCS_SCHEMA_URL,
  DEFAULT_ODCS_VERSIONS,
  activeSchemaUrl,
  clearSchemaCache,
  defaultOdcsVersion,
  getSchemaAcceptedApiVersions,
  getSchemaApiVersion,
  getSchemaFilename,
  loadSchema,
  loadSchemaOrNull,
  mergeSchema,
  odcsVersionEntryFor,
  odcsVersionsFromConfig,
  resolveSchemaUrl,
} from './schemaRegistry.js';

const okResponse = (body) => ({ ok: true, json: () => Promise.resolve(body) });

describe('resolveSchemaUrl', () => {
  it('falls back to the default for empty input', () => {
    expect(resolveSchemaUrl(null)).toBe(DEFAULT_ODCS_SCHEMA_URL);
    expect(resolveSchemaUrl('   ')).toBe(DEFAULT_ODCS_SCHEMA_URL);
  });

  it('keeps a configured URL, trimmed', () => {
    expect(resolveSchemaUrl(' /acme/odcs-schema ')).toBe('/acme/odcs-schema');
  });

  it('activeSchemaUrl reads the store', () => {
    storeState.schemaUrl = '/acme/odcs-schema';
    expect(activeSchemaUrl()).toBe('/acme/odcs-schema');
    storeState.schemaUrl = null;
    expect(activeSchemaUrl()).toBe(DEFAULT_ODCS_SCHEMA_URL);
  });

  it("activeSchemaUrl picks the document's own version from the host list", () => {
    storeState.odcsVersions = odcsVersionsFromConfig({
      odcsVersions: [
        { version: 'v3.2.0', schema: '/acme/odcs-schema/v3.2.0', default: true },
        { version: 'v3.1.0', schema: '/acme/odcs-schema/v3.1.0' },
      ],
    });
    storeState.getValue = () => 'v3.1.0';
    expect(activeSchemaUrl()).toBe('/acme/odcs-schema/v3.1.0');
    storeState.getValue = () => undefined;
    expect(activeSchemaUrl()).toBe('/acme/odcs-schema/v3.2.0');
    storeState.odcsVersions = null;
  });
});

describe('odcsVersionsFromConfig', () => {
  it('sorts newest first and keeps the flagged default', () => {
    const versions = odcsVersionsFromConfig({
      odcsVersions: [
        { version: '3.1.0', schema: '/s/3.1.0', default: true },
        { version: 'v3.2.0', schema: '/s/3.2.0' },
      ],
    });
    expect(versions.map((v) => v.version)).toEqual(['v3.2.0', 'v3.1.0']);
    expect(versions.map((v) => v.default)).toEqual([false, true]);
  });

  it('makes the newest the default when none is flagged, and drops entries without a schema', () => {
    const versions = odcsVersionsFromConfig({
      odcsVersions: [{ version: 'v3.1.0', schema: '/s/3.1.0' }, { version: 'v3.2.0', schema: '/s/3.2.0' }, { version: 'v3.0.0' }],
    });
    expect(versions.map((v) => [v.version, v.default])).toEqual([['v3.2.0', true], ['v3.1.0', false]]);
  });

  it('turns a legacy schemaUrl into one entry of unknown version, and nothing into the built-in list', () => {
    expect(odcsVersionsFromConfig({ schemaUrl: ' /legacy.json ' })).toEqual([{ version: null, schema: '/legacy.json', default: true }]);
    expect(odcsVersionsFromConfig({})).toEqual([...DEFAULT_ODCS_VERSIONS]);
  });
});

describe('odcsVersionEntryFor and defaultOdcsVersion', () => {
  const versions = odcsVersionsFromConfig({
    odcsVersions: [
      { version: 'v3.2.0', schema: '/s/3.2.0', default: true },
      { version: 'v3.1.0', schema: '/s/3.1.0' },
    ],
  });

  it("resolves the document's own version, else the default", () => {
    expect(odcsVersionEntryFor(versions, 'v3.1.0').schema).toBe('/s/3.1.0');
    expect(odcsVersionEntryFor(versions, '3.1.0').schema).toBe('/s/3.1.0');
    expect(odcsVersionEntryFor(versions, 'v3.0.2').schema).toBe('/s/3.2.0');
    expect(odcsVersionEntryFor(versions, null).schema).toBe('/s/3.2.0');
    expect(odcsVersionEntryFor(null, 'v3.1.0').schema).toBe(DEFAULT_ODCS_SCHEMA_URL);
  });

  it('takes the default version from the list, or from the loaded schema for a legacy entry', () => {
    expect(defaultOdcsVersion(versions, null)).toBe('v3.2.0');
    const legacy = odcsVersionsFromConfig({ schemaUrl: '/legacy.json' });
    expect(defaultOdcsVersion(legacy, { properties: { apiVersion: { default: 'v3.0.2' } } })).toBe('v3.0.2');
    expect(defaultOdcsVersion(legacy, null)).toBeNull();
  });
});

describe('getSchemaAcceptedApiVersions', () => {
  it('reads the root enum and narrows it by allOf branches', () => {
    expect(getSchemaAcceptedApiVersions({ properties: { apiVersion: { enum: ['v3.1.0', 'v3.0.0'] } } })).toEqual(['v3.1.0', 'v3.0.0']);
    const composed = {
      allOf: [{ properties: { apiVersion: { enum: ['v3.1.0', 'v3.0.0'] } } }, { properties: { apiVersion: { enum: ['v3.0.0'] } } }],
    };
    expect(getSchemaAcceptedApiVersions(composed)).toEqual(['v3.0.0']);
    expect(getSchemaAcceptedApiVersions(null)).toEqual([]);
  });
});

describe('loadSchema', () => {
  beforeEach(() => {
    clearSchemaCache();
    storeState.schemaUrl = null;
  });

  it('fetches a URL once and shares the result', async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse({ title: 'ODCS' }));
    vi.stubGlobal('fetch', fetchMock);

    const [first, second] = await Promise.all([loadSchema('/a.json'), loadSchema('/a.json')]);
    const third = await loadSchema('/a.json');

    expect(first).toEqual({ title: 'ODCS' });
    expect(second).toBe(first);
    expect(third).toBe(first);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith('/a.json');
  });

  it('caches per URL', async () => {
    const fetchMock = vi.fn((url) => Promise.resolve(okResponse({ url })));
    vi.stubGlobal('fetch', fetchMock);

    expect(await loadSchema('/a.json')).toEqual({ url: '/a.json' });
    expect(await loadSchema('/b.json')).toEqual({ url: '/b.json' });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('uses the store URL when none is given', async () => {
    storeState.schemaUrl = '/from-store.json';
    const fetchMock = vi.fn().mockResolvedValue(okResponse({}));
    vi.stubGlobal('fetch', fetchMock);

    await loadSchema();

    expect(fetchMock).toHaveBeenCalledWith('/from-store.json');
  });

  it('rejects on an HTTP error and retries on the next call', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 503, statusText: 'Unavailable' })
      .mockResolvedValueOnce(okResponse({ recovered: true }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(loadSchema('/flaky.json')).rejects.toThrow('HTTP 503: Unavailable');
    expect(await loadSchema('/flaky.json')).toEqual({ recovered: true });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('loadSchemaOrNull degrades to null', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    expect(await loadSchemaOrNull('/offline.json')).toBeNull();

    warn.mockRestore();
  });
});

describe('mergeSchema', () => {
  const base = { type: 'object', properties: { status: { type: 'string' } } };

  it('returns the base untouched when there are no customizations', () => {
    expect(mergeSchema(base, null)).toBe(base);
    expect(mergeSchema(null, null)).toBeNull();
  });

  it('returns the same merged object for the same customizations', () => {
    const customizations = {
      dataContract: { root: { standardProperties: [{ property: 'status', enum: ['draft', 'active'] }] } },
    };

    const first = mergeSchema(base, customizations);
    const second = mergeSchema(base, { ...customizations });

    expect(first).not.toBe(base);
    expect(first.properties.status.enum).toEqual(['draft', 'active']);
    expect(second).toBe(first);
  });
});

describe('getSchemaApiVersion', () => {
  it('reads default, const, or a single enum value from the root', () => {
    expect(getSchemaApiVersion({ properties: { apiVersion: { default: 'v3.1.0', enum: ['v3.1.0', 'v3.0.0'] } } })).toBe('v3.1.0');
    expect(getSchemaApiVersion({ properties: { apiVersion: { const: 'v3.0.2' } } })).toBe('v3.0.2');
    expect(getSchemaApiVersion({ properties: { apiVersion: { enum: ['v3.0.1'] } } })).toBe('v3.0.1');
  });

  it('looks through a composed schema whose base sits under allOf', () => {
    const composed = {
      $defs: {},
      allOf: [{ properties: { apiVersion: { default: 'v3.0.2' } } }, { properties: { status: { enum: ['draft'] } } }],
    };
    expect(getSchemaApiVersion(composed)).toBe('v3.0.2');
  });

  it('returns null when the schema says nothing', () => {
    expect(getSchemaApiVersion(null)).toBeNull();
    expect(getSchemaApiVersion({ properties: { apiVersion: { enum: ['v3.1.0', 'v3.0.0'] } } })).toBeNull();
  });
});

describe('getSchemaFilename', () => {
  it('takes the last path segment and drops the query string', () => {
    expect(getSchemaFilename(DEFAULT_ODCS_SCHEMA_URL)).toBe('odcs-json-schema-v3.1.0.json');
    expect(getSchemaFilename('/acme/datacontract-editor-api/odcs-schema?apiVersion=v3.1.0')).toBe('odcs-schema');
    expect(getSchemaFilename(null)).toBeNull();
  });
});
