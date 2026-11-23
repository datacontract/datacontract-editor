import { describe, expect, it } from 'vitest';
import { buildPropertyFromBrowseDrag, linkPropertyFromBrowseDrag } from './browseInsert.js';
import { propertyErrors } from '../../utils/fixtures/odcsValidator.js';

const column = { name: 'ORDER_ID', logicalType: 'string', physicalType: 'VARCHAR', description: 'The order' };

function documentWith(property) {
  const doc = { schema: [{ properties: [property] }] };
  return {
    doc,
    getValue: () => doc.schema[0].properties[0],
    setValue: (_path, value) => { doc.schema[0].properties[0] = value; },
  };
}

describe('asset column drags', () => {
  it('copies the column without lineage', () => {
    const property = buildPropertyFromBrowseDrag({ source: 'browse', kind: 'asset', property: column });

    expect(property).toEqual({ name: 'ORDER_ID', logicalType: 'string', physicalType: 'VARCHAR', description: 'The order' });
    expect(property.transformSourceObjects).toBeUndefined();
  });

  it('maps an existing property onto the column', () => {
    const { doc, getValue, setValue } = documentWith({ name: 'order_id', logicalType: 'string' });

    const linked = linkPropertyFromBrowseDrag(getValue, setValue, 0, 0, { kind: 'asset', property: column });

    expect(linked).toBe(true);
    expect(doc.schema[0].properties[0]).toEqual({ name: 'order_id', logicalType: 'string', physicalName: 'ORDER_ID', physicalType: 'VARCHAR' });
  });

  it('keeps the physical type a property already has', () => {
    const { doc, getValue, setValue } = documentWith({ name: 'order_id', physicalType: 'TEXT' });

    linkPropertyFromBrowseDrag(getValue, setValue, 0, 0, { kind: 'asset', property: column });

    expect(doc.schema[0].properties[0].physicalType).toBe('TEXT');
  });
});

describe.each(['asset', 'dataProduct'])('%s drags into a document of each ODCS version', (kind) => {
  const build = (property, apiVersion) => buildPropertyFromBrowseDrag({ source: 'browse', kind, property }, apiVersion);
  const attributes = {
    name: 'attributes',
    logicalType: 'map',
    physicalType: 'map<string,timestamp>',
    map: { key: { name: 'key', logicalType: 'string' }, value: { name: 'value', logicalType: 'timestamp' } },
  };

  it.each(['v3.0.2', 'v3.1.0', 'v3.2.0'])('inserts what %s allows', (apiVersion) => {
    const row = { name: 'row', logicalType: 'object', properties: [attributes, { name: 'at', logicalType: 'time' }] };

    for (const property of [attributes, row, { name: 'm', logicalType: 'map' }]) {
      expect(propertyErrors(apiVersion, build(property, apiVersion))).toEqual([]);
    }
  });

  it('copies the key and value of a map in 3.2.0 and makes it an object before', () => {
    expect(build(attributes, 'v3.2.0')).toEqual({
      ...attributes,
      map: { key: { logicalType: 'string' }, value: { logicalType: 'timestamp' } },
    });
    expect(build(attributes, 'v3.1.0')).toEqual({ name: 'attributes', logicalType: 'object', physicalType: 'map<string,timestamp>' });
  });
});
