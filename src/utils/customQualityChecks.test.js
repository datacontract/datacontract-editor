import { describe, it, expect } from 'vitest';
import {
  countCustomQualityCheckProblems,
  customQualityCheckProblems,
  fillCheckDescription,
  findCustomQualityCheck,
} from './customQualityChecks.js';

const between = {
  id: 'between',
  name: 'Value range',
  description: '${column} is between ${arguments.min} and ${arguments.max}.',
  arguments: [
    { name: 'min', type: 'any', required: true },
    { name: 'max', type: 'any', required: true },
  ],
  usesColumn: true,
  expectedResult: { comparator: 'mustBe', value: 0 },
};
const recentRows = {
  id: 'recent_rows',
  name: 'Recent rows',
  description: 'Rows that arrived within the last ${arguments.days} days in ${table}.',
  arguments: [
    { name: 'timestamp_column', type: 'identifier', required: true },
    { name: 'days', type: 'number', required: false, default: 1 },
  ],
  usesColumn: false,
  expectedResult: null,
};
const checks = [between, recentRows];

const rule = (check, args, extra = {}) => ({
  type: 'custom', engine: 'datacontract-cli', implementation: { check, arguments: args }, ...extra,
});

describe('findCustomQualityCheck', () => {
  it('matches IDs regardless of case', () => {
    expect(findCustomQualityCheck(checks, 'Between')).toBe(between);
    expect(findCustomQualityCheck(checks, 'betwen')).toBeNull();
    expect(findCustomQualityCheck(null, 'between')).toBeNull();
  });
});

describe('fillCheckDescription', () => {
  it('fills arguments, defaults, table and column', () => {
    expect(fillCheckDescription(between, { min: 0, max: 10000 }, { column: 'amount' }))
      .toBe('amount is between 0 and 10000.');
    expect(fillCheckDescription(recentRows, {}, { table: 'orders' }))
      .toBe('Rows that arrived within the last 1 days in orders.');
  });

  it('names missing arguments and keeps unknown placeholders', () => {
    expect(fillCheckDescription(between, { max: [1, 2] })).toBe('${column} is between min and 1, 2.');
  });
});

describe('customQualityCheckProblems', () => {
  it('reports nothing for a complete rule, other rule types or without a list', () => {
    expect(customQualityCheckProblems(rule('between', { min: 0, max: 1 }), checks, 'property')).toEqual([]);
    expect(customQualityCheckProblems({ type: 'sql', query: 'SELECT 1' }, checks, 'property')).toEqual([]);
    expect(customQualityCheckProblems(rule('betwen', {}), null, 'property')).toEqual([]);
  });

  it('reports a missing or unknown check', () => {
    expect(customQualityCheckProblems(rule('', {}), checks, 'property')).toEqual([{ field: 'check', key: 'required' }]);
    expect(customQualityCheckProblems(rule('betwen', {}), checks, 'property')).toEqual([{ field: 'check', key: 'unknownCheck' }]);
  });

  it('reports a column check on a schema', () => {
    expect(customQualityCheckProblems(rule('between', { min: 0, max: 1 }), checks, 'schema'))
      .toEqual([{ field: 'check', key: 'columnCheckOnSchema' }]);
  });

  it('reports missing, invalid and undeclared arguments', () => {
    const problems = customQualityCheckProblems(
      rule('recent_rows', { days: 'two', hours: 24 }, { mustBeGreaterThan: 0 }), checks, 'schema');
    expect(problems).toEqual([
      { field: 'arguments.timestamp_column', key: 'required' },
      { field: 'arguments.days', key: 'notANumber' },
      { field: 'arguments.hours', key: 'undeclaredArgument', values: { check: 'recent_rows', argument: 'hours' } },
    ]);
  });

  it('accepts numbers written as text, as datacontract-cli does', () => {
    expect(customQualityCheckProblems(
      rule('recent_rows', { timestamp_column: 'created_at', days: '7' }, { mustBeGreaterThan: 0 }), checks, 'schema'))
      .toEqual([]);
  });

  it('reports a missing expected result only when the check has none', () => {
    expect(customQualityCheckProblems(rule('recent_rows', { timestamp_column: 'created_at' }), checks, 'schema'))
      .toEqual([{ field: 'operator', key: 'noExpectedResult' }]);
  });
});

describe('countCustomQualityCheckProblems', () => {
  it('adds up the problems of all rules', () => {
    expect(countCustomQualityCheckProblems([rule('betwen', {}), rule('between', { min: 0 })], checks, 'property')).toBe(2);
    expect(countCustomQualityCheckProblems(undefined, checks, 'property')).toBe(0);
  });
});
