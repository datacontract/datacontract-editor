import { describe, it, expect } from 'vitest';
import { normalizeContext } from './context.js';

describe('normalizeContext', () => {
  it('treats a string as instructions shorthand', () => {
    expect(normalizeContext('Use for revenue questions.')).toEqual({ instructions: 'Use for revenue questions.' });
    expect(normalizeContext('   ')).toBeNull();
  });

  it('keeps the parts of an object and defaults the lists', () => {
    const context = {
      instructions: 'Prefer the daily aggregate.',
      verifiedStatements: [{ question: 'How many orders?', answer: 'Count rows.' }],
    };
    expect(normalizeContext(context)).toEqual({
      instructions: 'Prefer the daily aggregate.',
      verifiedStatements: context.verifiedStatements,
      constraints: [],
    });
  });

  it('is null for nothing, an empty object, or a non-object', () => {
    expect(normalizeContext(null)).toBeNull();
    expect(normalizeContext(undefined)).toBeNull();
    expect(normalizeContext({})).toBeNull();
    expect(normalizeContext({ instructions: '', verifiedStatements: [], constraints: [] })).toBeNull();
    expect(normalizeContext(42)).toBeNull();
  });
});
