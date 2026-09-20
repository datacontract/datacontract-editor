import { describe, expect, it } from 'vitest';
import { resolveChildProperties, resolvePropertyTypeInfo } from './previewSchemaUtils.js';

describe('previewSchemaUtils - resolveChildProperties', () => {
  it('returns child properties for an object property with properties array', () => {
    const prop = {
      name: 'user',
      logicalType: 'object',
      properties: [
        { name: 'id', logicalType: 'string' },
        { name: 'name', logicalType: 'string' },
      ],
    };

    const children = resolveChildProperties(prop);
    expect(children).toHaveLength(2);
    expect(children[0].name).toBe('id');
    expect(children[1].name).toBe('name');
  });

  it('returns child properties for an array property with items.properties', () => {
    const prop = {
      name: 'orderLines',
      logicalType: 'array',
      items: {
        logicalType: 'object',
        properties: [
          { name: 'sku', logicalType: 'string' },
          { name: 'quantity', logicalType: 'integer' },
          { name: 'price', logicalType: 'number' },
        ],
      },
    };

    const children = resolveChildProperties(prop);
    expect(children).toHaveLength(3);
    expect(children[0].name).toBe('sku');
    expect(children[1].name).toBe('quantity');
    expect(children[2].name).toBe('price');
  });

  it('prefers top-level properties over items.properties if both exist', () => {
    const prop = {
      name: 'mixed',
      properties: [{ name: 'topLevel', logicalType: 'string' }],
      items: {
        properties: [{ name: 'nestedItem', logicalType: 'string' }],
      },
    };

    const children = resolveChildProperties(prop);
    expect(children).toHaveLength(1);
    expect(children[0].name).toBe('topLevel');
  });

  it('returns null when properties and items.properties are empty or missing', () => {
    expect(resolveChildProperties({ name: 'code', logicalType: 'string' })).toBeNull();
    expect(resolveChildProperties({ name: 'emptyObj', properties: [] })).toBeNull();
    expect(resolveChildProperties({ name: 'emptyArray', items: { properties: [] } })).toBeNull();
    expect(resolveChildProperties({ name: 'plainArray', items: { logicalType: 'string' } })).toBeNull();
    expect(resolveChildProperties(null)).toBeNull();
    expect(resolveChildProperties(undefined)).toBeNull();
  });
});

describe('previewSchemaUtils - resolvePropertyTypeInfo', () => {
  it('extracts logical and physical type from a standard property', () => {
    const prop = {
      name: 'id',
      logicalType: 'string',
      physicalType: 'VARCHAR(50)',
      logicalTypeOptions: { maxLength: 50 },
    };

    const info = resolvePropertyTypeInfo(prop);
    expect(info.effectiveLogicalType).toBe('string');
    expect(info.physicalType).toBe('VARCHAR(50)');
    expect(info.opts.maxLength).toBe(50);
    expect(info.isLogicalTypeInherited).toBe(false);
  });

  it('resolves type info from items for array properties when top-level is omitted', () => {
    const prop = {
      name: 'tags',
      items: {
        logicalType: 'string',
        physicalType: 'VARCHAR(20)',
        logicalTypeOptions: { maxLength: 20 },
      },
    };

    const info = resolvePropertyTypeInfo(prop);
    expect(info.effectiveLogicalType).toBe('string');
    expect(info.physicalType).toBe('VARCHAR(20)');
    expect(info.opts.maxLength).toBe(20);
    expect(info.isLogicalTypeInherited).toBe(false);
  });

  it('merges logicalTypeOptions from property and items', () => {
    const prop = {
      name: 'data',
      logicalType: 'array',
      logicalTypeOptions: { minItems: 1 },
      items: {
        logicalTypeOptions: { maxLength: 100 },
      },
    };

    const info = resolvePropertyTypeInfo(prop);
    expect(info.effectiveLogicalType).toBe('array');
    expect(info.opts.minItems).toBe(1);
    expect(info.opts.maxLength).toBe(100);
  });

  it('inherits logicalType from semantic authoritative definition if not on property or items', () => {
    const prop = {
      name: 'country',
    };
    const propDefinition = {
      logicalType: 'string',
      businessName: 'Country Code',
    };

    const info = resolvePropertyTypeInfo(prop, propDefinition);
    expect(info.effectiveLogicalType).toBe('string');
    expect(info.isLogicalTypeInherited).toBe(true);
  });
});
