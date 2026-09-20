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

  it('renders both properties and items.properties when both exist', () => {
    const prop = {
      name: 'mixed',
      properties: [{ name: 'topLevel', logicalType: 'string' }],
      items: {
        properties: [{ name: 'nestedItem', logicalType: 'string' }],
      },
    };

    const children = resolveChildProperties(prop);
    expect(children.map((c) => c.name)).toEqual(['topLevel', 'nestedItem']);
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

  it('describes the item type for an array, even when the property says array', () => {
    const prop = {
      name: 'tags',
      logicalType: 'array',
      logicalTypeOptions: { minItems: 1 },
      items: {
        logicalType: 'string',
        physicalType: 'VARCHAR(20)',
        logicalTypeOptions: { maxLength: 20 },
      },
    };

    const info = resolvePropertyTypeInfo(prop);
    expect(info.effectiveLogicalType).toBe('string');
    expect(info.physicalType).toBe('VARCHAR(20)');
    expect(info.opts).toEqual({ maxLength: 20 });
    expect(info.isLogicalTypeInherited).toBe(false);
  });

  it('resolves type info from items when the property has no type of its own', () => {
    const prop = {
      name: 'codes',
      items: { logicalType: 'integer' },
    };

    const info = resolvePropertyTypeInfo(prop);
    expect(info.effectiveLogicalType).toBe('integer');
    expect(info.physicalType).toBeUndefined();
    expect(info.opts).toEqual({});
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

  it('does not treat an item type as inherited from the semantic definition', () => {
    const prop = { name: 'tags', items: { logicalType: 'string' } };
    const info = resolvePropertyTypeInfo(prop, { logicalType: 'text' });
    expect(info.effectiveLogicalType).toBe('string');
    expect(info.isLogicalTypeInherited).toBe(false);
  });
});
