import { describe, it, expect } from 'vitest';
import { updateYaml, parseYaml } from './yaml.js';

const contract = `# The contract of the customer cohorts
apiVersion: "v3.1.0"
kind: "DataContract"
id: "customer-cohorts" # never change this
name: "Customer Cohorts"
status: "active"
schema:
  # the main table
  - name: "customer_cohorts"
    properties:
      - name: "customer_id" # the key
        logicalType: "string"
      # when the cohort starts
      - name: "start_date"
        logicalType: "date"
`;

const changed = (mutate) => {
  const value = parseYaml(contract);
  mutate(value);
  return { value, yaml: updateYaml(contract, value) };
};

describe('updateYaml keeps comments of a document whose values change', () => {
  it('keeps every comment when a form changes one value', () => {
    const { value, yaml } = changed((v) => { v.name = 'Customer Cohorts (edited)'; });

    expect(parseYaml(yaml)).toEqual(value);
    expect(yaml).toContain('# The contract of the customer cohorts');
    expect(yaml).toContain('# never change this');
    expect(yaml).toContain('# the main table');
    expect(yaml).toContain('# the key');
    expect(yaml).toContain('# when the cohort starts');
  });

  it('leaves the text unchanged when no value changes', () => {
    expect(updateYaml(contract, parseYaml(contract))).toBe(contract);
  });

  it('keeps the comments of the other keys when a key is removed', () => {
    const { value, yaml } = changed((v) => { delete v.status; });

    expect(parseYaml(yaml)).toEqual(value);
    expect(yaml).not.toContain('status');
    expect(yaml).toContain('# never change this');
  });

  it('adds a new key without losing comments', () => {
    const { value, yaml } = changed((v) => { v.description = { purpose: 'Cohorts' }; });

    expect(parseYaml(yaml)).toEqual(value);
    expect(yaml).toContain('# the main table');
  });

  it('keeps the comment of a list item that moves when an item before it is removed', () => {
    const { value, yaml } = changed((v) => { v.schema[0].properties.splice(0, 1); });

    expect(parseYaml(yaml)).toEqual(value);
    expect(yaml).toContain('# when the cohort starts');
    expect(yaml).not.toContain('# the key');
  });

  it('keeps the comment of a list item when the items are reordered', () => {
    const { value, yaml } = changed((v) => { v.schema[0].properties.reverse(); });

    expect(parseYaml(yaml)).toEqual(value);
    expect(yaml.indexOf('# when the cohort starts')).toBeLessThan(yaml.indexOf('start_date'));
    expect(yaml).toMatch(/customer_id"? # the key/);
  });

  it('writes a value of another type with its own type', () => {
    const { value, yaml } = changed((v) => { v.schema[0].properties[0].logicalType = 42; v.name = 'true'; });

    expect(parseYaml(yaml)).toEqual(value);
  });

  it('writes a new multi-line text as a block literal', () => {
    const { value, yaml } = changed((v) => { v.name = 'line one\nline two'; });

    expect(parseYaml(yaml)).toEqual(value);
    expect(yaml).toContain('|-');
  });

  it('keeps a trailing space of a changed text', () => {
    const { value, yaml } = changed((v) => { v.name = 'abc\ndef '; });

    expect(parseYaml(yaml)).toEqual(value);
  });

  it('writes the whole value when the previous YAML is empty or invalid', () => {
    expect(parseYaml(updateYaml('', { id: 'x' }))).toEqual({ id: 'x' });
    expect(parseYaml(updateYaml('id: [unclosed', { id: 'x' }))).toEqual({ id: 'x' });
  });
});
