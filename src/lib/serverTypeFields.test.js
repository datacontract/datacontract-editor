import { describe, expect, it } from 'vitest';
import odcsSchema310 from '../utils/fixtures/odcs-json-schema-v3.1.0.json';
import odcsSchema320 from '../utils/fixtures/odcs-json-schema-v3.2.0.json';
import { getServerTypeSchemaFields, parsePortInput, resolveLocalRef } from './serverTypeFields.js';

describe('getServerTypeSchemaFields', () => {
  it('returns the field set for a server type ODCS 3.2.0 added', () => {
    const fields = getServerTypeSchemaFields(odcsSchema320, 'iceberg');
    const byName = Object.fromEntries(fields.map((field) => [field.name, field]));

    expect(Object.keys(byName)).toEqual(expect.arrayContaining(['catalog', 'catalogUrl', 'namespace', 'warehouse']));
    expect(byName.catalog.required).toBe(true);
    expect(byName.catalogUrl.required).toBe(true);
    expect(byName.namespace.required).toBe(false);
  });

  it('surfaces fields 3.2.0 adds to existing types', () => {
    const kafka = getServerTypeSchemaFields(odcsSchema320, 'kafka').map((field) => field.name);
    expect(kafka).toContain('encoding');

    const athena = getServerTypeSchemaFields(odcsSchema320, 'athena').map((field) => field.name);
    expect(athena).toContain('workgroup');
  });

  it('marks port fields so string values like variables are allowed', () => {
    const postgres = getServerTypeSchemaFields(odcsSchema320, 'postgresql');
    const port = postgres.find((field) => field.name === 'port');
    expect(port.isPort).toBe(true);
  });

  it('returns null for types the schema does not define', () => {
    expect(getServerTypeSchemaFields(odcsSchema310, 'iceberg')).toBeNull();
    expect(getServerTypeSchemaFields(odcsSchema320, 'not-a-type')).toBeNull();
    expect(getServerTypeSchemaFields(null, 'kafka')).toBeNull();
    expect(getServerTypeSchemaFields(odcsSchema320, null)).toBeNull();
  });
});

describe('resolveLocalRef', () => {
  it('resolves nested definitions', () => {
    expect(resolveLocalRef(odcsSchema320, '#/$defs/ServerSource/KafkaServer')).toBeTruthy();
    expect(resolveLocalRef(odcsSchema320, '#/$defs/Port')).toBeTruthy();
    expect(resolveLocalRef(odcsSchema320, '#/$defs/Nope')).toBeNull();
    expect(resolveLocalRef(odcsSchema320, 'https://example.com/schema.json')).toBeNull();
  });
});

describe('parsePortInput', () => {
  it('keeps digits as a number, variables verbatim, blank clears', () => {
    expect(parsePortInput('5432')).toBe(5432);
    expect(parsePortInput('${DB_PORT:-5432}')).toBe('${DB_PORT:-5432}');
    expect(parsePortInput('')).toBeUndefined();
    expect(parsePortInput('  ')).toBeUndefined();
    expect(parsePortInput('0')).toBe(0);
  });
});
