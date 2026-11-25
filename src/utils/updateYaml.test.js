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

  it('keeps the comments inside a schema when the schema is renamed', () => {
    const { value, yaml } = changed((v) => { v.schema[0].name = 'purchase_orders'; });

    expect(parseYaml(yaml)).toEqual(value);
    expect(yaml).toContain('# the main table');
    expect(yaml).toContain('# the key');
    expect(yaml).toContain('# when the cohort starts');
  });

  it('keeps the comment of a property when the property is renamed', () => {
    const { value, yaml } = changed((v) => { v.schema[0].properties[0].name = 'client_id'; });

    expect(parseYaml(yaml)).toEqual(value);
    expect(yaml).toMatch(/client_id"? # the key/);
  });

  it('gives a new item inserted before the others no comment of theirs', () => {
    const { value, yaml } = changed((v) => { v.schema[0].properties.unshift({ name: 'cohort_id', logicalType: 'string' }); });

    expect(parseYaml(yaml)).toEqual(value);
    expect(yaml).toMatch(/customer_id"? # the key/);
    expect(yaml.indexOf('# when the cohort starts')).toBeLessThan(yaml.indexOf('start_date'));
    expect(yaml.indexOf('cohort_id')).toBeLessThan(yaml.indexOf('# the key'));
  });

  it('keeps a comment at the end of the document where it is', () => {
    const previous = 'id: "x"\nname: "n"\n# end of contract\n';
    const value = parseYaml(previous);
    value.name = 'm';

    expect(updateYaml(previous, value)).toBe('id: "x"\nname: "m"\n# end of contract\n');
  });

  it('keeps the blank line before a comment at the end of the document', () => {
    const previous = 'id: "x"\nname: "n"\n\n# end of contract\n';
    const value = parseYaml(previous);
    value.name = 'm';

    expect(updateYaml(previous, value)).toBe('id: "x"\nname: "m"\n\n# end of contract\n');
  });

  it('gives back the same text when a value is changed and changed back', () => {
    const previous = `${contract}# end of contract\n`;
    const value = parseYaml(previous);
    value.name = 'Other';
    const changedYaml = updateYaml(previous, value);
    value.name = 'Customer Cohorts';

    expect(updateYaml(changedYaml, value)).toBe(previous);
  });

  it('writes the whole value when the previous YAML is empty or invalid', () => {
    expect(parseYaml(updateYaml('', { id: 'x' }))).toEqual({ id: 'x' });
    expect(parseYaml(updateYaml('id: [unclosed', { id: 'x' }))).toEqual({ id: 'x' });
  });
});
