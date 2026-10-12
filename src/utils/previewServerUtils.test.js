import { describe, expect, it } from 'vitest';
import { getAdditionalServerFields, humanizeFieldName } from './previewServerUtils.js';

describe('previewServerUtils - getAdditionalServerFields', () => {
  it('returns the fields the server card has no curated slot for', () => {
    const fields = getAdditionalServerFields({
      id: 'srv-1',
      server: 'production',
      type: 'athena',
      environment: 'prod',
      regionName: 'eu-central-1',
      workgroup: 'analytics',
      encoding: 'UTF-8',
      port: 443,
      roles: [{ role: 'reader' }],
      customProperties: [{ property: 'a', value: 'b' }],
    });
    expect(fields).toEqual([
      { key: 'workgroup', value: 'analytics' },
      { key: 'encoding', value: 'UTF-8' },
    ]);
  });

  it('keeps numbers, booleans and lists of scalars, and skips empty or nested values', () => {
    expect(getAdditionalServerFields({ type: 'custom', retries: 3, secure: false, brokers: ['a:1', 'b:2'], empty: '', nested: { a: 1 }, none: [] }))
      .toEqual([
        { key: 'retries', value: '3' },
        { key: 'secure', value: 'false' },
        { key: 'brokers', value: 'a:1, b:2' },
      ]);
    expect(getAdditionalServerFields(null)).toEqual([]);
  });
});

describe('previewServerUtils - humanizeFieldName', () => {
  it('turns a camelCase field name into a label', () => {
    expect(humanizeFieldName('catalogUrl')).toBe('Catalog Url');
    expect(humanizeFieldName('workgroup')).toBe('Workgroup');
  });
});
