import { describe, expect, it } from 'vitest';
import { propertyForApiVersion, serverForApiVersion } from './forApiVersion.js';
import { mergeAssetServer } from './mergeAssetServer.js';
import { propertyErrors, serverErrors } from '../utils/fixtures/odcsValidator.js';

const map = {
  logicalType: 'map',
  map: { key: { logicalType: 'string' }, value: { logicalType: 'timestamp' } },
};
const nested = {
  name: 'root',
  logicalType: 'object',
  properties: [
    { name: 'tags', ...map },
    { name: 'times', logicalType: 'array', items: { logicalType: 'object', properties: [{ name: 'at', logicalType: 'time' }] } },
    { name: 'created', logicalType: 'timestamp', logicalTypeOptions: { format: 'yyyy', timezone: true, exclusiveMaximum: '2030-01-01' } },
    { name: 'embedding', logicalType: 'vector', logicalTypeOptions: { dimensions: 384 } },
  ],
};

describe('propertyForApiVersion', () => {
  it.each(['v3.0.2', 'v3.1.0', 'v3.2.0'])('fits every depth of a property to %s', (apiVersion) => {
    expect(propertyErrors(apiVersion, propertyForApiVersion(nested, apiVersion))).toEqual([]);
  });

  it('keeps everything in 3.2.0, and in a document without a version', () => {
    expect(propertyForApiVersion(nested, 'v3.2.0')).toEqual(nested);
    expect(propertyForApiVersion(nested, undefined)).toEqual(nested);
  });

  it('turns a map into an object and a vector into an array of numbers before 3.2.0', () => {
    const { properties } = propertyForApiVersion(nested, 'v3.1.0');

    expect(properties[0]).toEqual({ name: 'tags', logicalType: 'object' });
    expect(properties[2]).toEqual(nested.properties[2]);
    expect(properties[3]).toEqual({ name: 'embedding', logicalType: 'array', items: { logicalType: 'number' } });
  });

  it('turns a timestamp and a time into a date before 3.1.0', () => {
    const { properties } = propertyForApiVersion(nested, 'v3.0.2');

    expect(properties[1].items.properties[0].logicalType).toBe('date');
    expect(properties[2]).toEqual({ name: 'created', logicalType: 'date', logicalTypeOptions: { format: 'yyyy' } });
  });

  it('fits a map of maps', () => {
    const mapOfMaps = { name: 'm', logicalType: 'map', map: { key: { logicalType: 'string' }, value: map } };

    expect(propertyErrors('v3.2.0', propertyForApiVersion(mapOfMaps, 'v3.2.0'))).toEqual([]);
    expect(propertyForApiVersion(mapOfMaps, 'v3.1.0')).toEqual({ name: 'm', logicalType: 'object' });
  });
});

describe('serverForApiVersion', () => {
  const exasol = { type: 'exasol', host: 'h', port: 8563, schema: 'SALES' };
  const iceberg = { type: 'iceberg', catalog: 'c', catalogUrl: 'https://example.com', namespace: 'n', warehouse: 'w' };

  it.each([exasol, iceberg])('picking a suggested $type server fits both versions', (suggested) => {
    expect(serverErrors('v3.1.0', suggested)).not.toEqual([]);
    for (const apiVersion of ['v3.1.0', 'v3.2.0']) {
      const server = mergeAssetServer({ server: 'production' }, serverForApiVersion(suggested, apiVersion));
      expect(serverErrors(apiVersion, server)).toEqual([]);
      expect(server.type).toBe(apiVersion === 'v3.1.0' ? 'custom' : suggested.type);
    }
  });

  it('keeps the type and what custom servers have no field for as custom properties', () => {
    const owner = { property: 'owner', value: 'sales' };

    expect(serverForApiVersion({ ...iceberg, customProperties: [owner] }, 'v3.1.0')).toEqual({
      type: 'custom',
      catalog: 'c',
      warehouse: 'w',
      customProperties: [
        owner,
        { property: 'customType', value: 'iceberg' },
        { property: 'catalogUrl', value: 'https://example.com' },
        { property: 'namespace', value: 'n' },
      ],
    });
  });

  it('leaves athena without a staging directory for the user to complete', () => {
    expect(serverForApiVersion({ type: 'athena', schema: 's' }, 'v3.1.0')).toEqual({ type: 'athena', schema: 's' });
  });
});
