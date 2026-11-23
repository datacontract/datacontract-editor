import { afterAll, describe, expect, it, vi } from 'vitest';
import { create } from 'zustand';
import { renderToStaticMarkup } from 'react-dom/server';

// The store feature-detects its storage backend at import.
vi.hoisted(() => {
  globalThis.window ??= {};
  globalThis.sessionStorage ??= {};
});

const offered = vi.hoisted(() => ({ types: [] }));
vi.mock('../ui/ValidatedCombobox.jsx', () => ({
  default: ({ validationKey, options }) => {
    if (validationKey.endsWith('.type')) offered.types = options.map((option) => option.id);
    return null;
  },
}));

// Loads monaco, which needs a browser.
vi.mock('../ui/ObjectYamlEditor.jsx', () => ({ default: () => null }));

import ServerEditor from './ServerEditor.jsx';
import { defaultStoreConfig, setOverrideStore } from '../../store.js';
import { getServerTypeSchemaFields } from '../../lib/serverTypeFields.js';
import odcs310 from '../../utils/fixtures/odcs-json-schema-v3.1.0.json';
import odcs320 from '../../utils/fixtures/odcs-json-schema-v3.2.0.json';

const render = (apiVersion, schemaData, server) => {
  // Server rendering reads a store's initial state, so each render gets a store of its own.
  setOverrideStore(create((set, get) => ({
    ...defaultStoreConfig(set, get),
    schemaData,
    yamlParts: { apiVersion, servers: [server] },
  })));
  return renderToStaticMarkup(<ServerEditor serverIndex={0} />);
};

afterAll(() => setOverrideStore(null));

describe.each([['v3.1.0', odcs310], ['v3.2.0', odcs320]])('the server form in %s', (apiVersion, schema) => {
  const schemaTypes = schema.$defs.Server.properties.type.enum;
  const allFields = [...new Set(schemaTypes.flatMap((type) => getServerTypeSchemaFields(schema, type).map((field) => field.name)))];
  // Kinesis shows its stream only when it has one.
  const probed = [...allFields, 'topic', 'table'].filter((field) => field !== 'stream');

  it.each(schemaTypes)('offers only fields ODCS defines for %s', (type) => {
    const html = render(apiVersion, schema, { server: 's', type, ...Object.fromEntries(probed.map((field) => [field, `probe-${field}-`])) });
    const shown = probed.filter((field) => html.includes(`probe-${field}-`));
    const defined = getServerTypeSchemaFields(schema, type).map((field) => field.name);

    expect(shown.length).toBeGreaterThan(0);
    expect(shown.filter((field) => !defined.includes(field))).toEqual([]);
  });

  it('offers only types ODCS defines, also while no schema is loaded', () => {
    for (const schemaData of [schema, null]) {
      render(apiVersion, schemaData, { server: 's' });
      expect(offered.types).toContain('kafka');
      expect(offered.types.filter((type) => !schemaTypes.includes(type))).toEqual([]);
    }
  });

  it('shows the stream of a kinesis server only when it has one', () => {
    expect(render(apiVersion, schema, { server: 's', type: 'kinesis', region: 'eu' })).not.toContain('my-stream');
    expect(render(apiVersion, schema, { server: 's', type: 'kinesis', stream: 'orders' })).toContain('value="orders"');
  });

  it('still shows the fields of an existing gcs server', () => {
    expect(render(apiVersion, schema, { server: 's', type: 'gcs', location: 'gs://orders' })).toContain('gs://orders');
  });
});
