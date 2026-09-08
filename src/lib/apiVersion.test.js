import { describe, expect, it } from 'vitest';
import { compareApiVersions } from './apiVersion.js';

describe('compareApiVersions', () => {
  it('compares numerically with or without the v prefix', () => {
    expect(compareApiVersions('v3.2.0', 'v3.1.0')).toBeGreaterThan(0);
    expect(compareApiVersions('3.1.0', 'v3.1.0')).toBe(0);
    expect(compareApiVersions('v3.1.0', 'v3.2.0')).toBeLessThan(0);
    expect(compareApiVersions('v3.10.0', 'v3.9.9')).toBeGreaterThan(0);
    expect(compareApiVersions('v3.2', 'v3.2.0')).toBe(0);
  });

  it('treats unparsable parts as zero', () => {
    expect(compareApiVersions(null, 'v0.0.0')).toBe(0);
    expect(compareApiVersions('vX', 'v0')).toBe(0);
  });
});
