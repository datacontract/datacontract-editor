import { describe, expect, it } from 'vitest';
import { formatEnumValues, formatRelationship, formatSynonyms, resolveChildProperties, resolvePropertyTypeInfo, resolveQualityCheckRows, resolveTypeDetailRows } from './previewSchemaUtils.js';

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

describe('previewSchemaUtils - resolveTypeDetailRows', () => {
  it('lists the physical type and the logical type options in order', () => {
    const rows = resolveTypeDetailRows({
      logicalType: 'string',
      physicalType: 'varchar(36)',
      logicalTypeOptions: { maxLength: 36, minLength: 1, pattern: '^[a-z]+$' },
    });
    expect(rows).toEqual([
      { key: 'physicalType', value: 'varchar(36)' },
      { key: 'minLength', value: 1 },
      { key: 'maxLength', value: 36 },
      { key: 'pattern', value: '^[a-z]+$' },
    ]);
  });

  it('keeps the array options and physical type next to the item type details', () => {
    const rows = resolveTypeDetailRows({
      logicalType: 'array',
      physicalType: 'array<string>',
      logicalTypeOptions: { minItems: 1, maxItems: 200, uniqueItems: true },
      items: { logicalType: 'string', logicalTypeOptions: { maxLength: 20 }, description: 'One SKU' },
    });
    expect(rows).toEqual([
      { key: 'physicalType', value: 'array<string>' },
      { key: 'maxLength', value: 20 },
      { key: 'minItems', value: 1 },
      { key: 'maxItems', value: 200 },
      { key: 'uniqueItems', value: true },
      { key: 'itemsDescription', value: 'One SKU' },
    ]);
  });

  it('prefers the item physical type for arrays', () => {
    const rows = resolveTypeDetailRows({ physicalType: 'array<int>', items: { physicalType: 'int' } });
    expect(rows).toEqual([{ key: 'physicalType', value: 'int' }]);
  });

  it('lists vector options and map key/value types', () => {
    expect(resolveTypeDetailRows({
      logicalType: 'vector',
      logicalTypeOptions: { dimensions: 768, elementType: 'float32', distanceMetric: 'cosine', normalized: false, embeddingModel: 'm' },
    })).toEqual([
      { key: 'dimensions', value: 768 },
      { key: 'elementType', value: 'float32' },
      { key: 'distanceMetric', value: 'cosine' },
      { key: 'normalized', value: false },
      { key: 'embeddingModel', value: 'm' },
    ]);
    expect(resolveTypeDetailRows({
      logicalType: 'map',
      map: { key: { logicalType: 'string' }, value: { logicalType: 'integer', description: 'Count' } },
    })).toEqual([
      { key: 'mapKeyType', value: 'string' },
      { key: 'mapValueType', value: 'integer' },
      { key: 'mapValueDescription', value: 'Count' },
    ]);
  });

  it('joins the required list and returns nothing for an empty property', () => {
    expect(resolveTypeDetailRows({ logicalType: 'object', logicalTypeOptions: { required: ['a', 'b'] } }))
      .toEqual([{ key: 'requiredList', value: 'a, b' }]);
    expect(resolveTypeDetailRows(null)).toEqual([]);
    expect(resolveTypeDetailRows({ logicalType: 'string' })).toEqual([]);
  });
});

describe('previewSchemaUtils - resolveQualityCheckRows', () => {
  it('lists every field the quality editor sets, and the operators', () => {
    const rows = resolveQualityCheckRows({
      name: 'Orders arrive daily',
      description: 'At least one order per day',
      type: 'sql',
      query: 'SELECT COUNT(*) FROM orders',
      mustBeGreaterThan: 0,
      mustBeBetween: [1, 10],
      dimension: 'completeness',
      severity: 'error',
      businessImpact: 'operational',
      schedule: '0 6 * * *',
      scheduler: 'cron',
      unit: 'rows',
      tags: ['daily'],
    });
    expect(rows).toEqual([
      { key: 'qualityType', value: 'sql' },
      { key: 'qualityDimension', value: 'completeness' },
      { key: 'qualityQuery', value: 'SELECT COUNT(*) FROM orders' },
      { key: 'qualitySeverity', value: 'error' },
      { key: 'qualityBusinessImpact', value: 'operational' },
      { key: 'qualitySchedule', value: '0 6 * * *' },
      { key: 'qualityScheduler', value: 'cron' },
      { key: 'qualityUnit', value: 'rows' },
      { key: 'mustBeGreaterThan', value: '0' },
      { key: 'mustBeBetween', value: '1, 10' },
      { key: 'qualityTags', value: 'daily' },
    ]);
  });

  it('formats library arguments and custom checks', () => {
    expect(resolveQualityCheckRows({ metric: 'invalidValues', arguments: { validValues: ['a', 'b'] }, mustBe: 0 }))
      .toEqual([
        { key: 'qualityMetric', value: 'invalidValues' },
        { key: 'qualityArguments', value: 'validValues: a, b' },
        { key: 'mustBe', value: '0' },
      ]);
    expect(resolveQualityCheckRows({ type: 'custom', engine: 'soda', implementation: 'checks for t' }))
      .toEqual([
        { key: 'qualityType', value: 'custom' },
        { key: 'qualityEngine', value: 'soda' },
        { key: 'qualityImplementation', value: 'checks for t' },
      ]);
    expect(resolveQualityCheckRows(null)).toEqual([]);
  });
});

describe('previewSchemaUtils - formatEnumValues, formatSynonyms, formatRelationship', () => {
  it('formats enum values with labels and plain values', () => {
    expect(formatEnumValues([{ value: 'placed', label: 'Placed' }, { value: 'x', label: 'x' }, { value: 0 }, 'raw', null, { label: 'no value' }]))
      .toEqual(['placed (Placed)', 'x', '0', 'raw']);
    expect(formatEnumValues(undefined)).toEqual([]);
  });

  it('formats synonyms with their locale', () => {
    expect(formatSynonyms([{ synonym: 'purchases', locale: 'en' }, { synonym: 'Bestellung' }, 'legacy', { locale: 'de' }]))
      .toEqual(['purchases (en)', 'Bestellung', 'legacy']);
    expect(formatSynonyms(null)).toEqual([]);
  });

  it('formats single and composite relationships', () => {
    expect(formatRelationship({ type: 'foreignKey', to: 'customers.id' }))
      .toEqual({ type: 'foreignKey', from: undefined, to: 'customers.id' });
    expect(formatRelationship({ from: ['a.x', 'a.y'], to: ['b.x', 'b.y'] }))
      .toEqual({ type: undefined, from: 'a.x, a.y', to: 'b.x, b.y' });
  });
});
