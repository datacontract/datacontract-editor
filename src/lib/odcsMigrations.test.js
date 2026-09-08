import { describe, expect, it } from 'vitest';
import { upgradeOdcsDocument } from './odcsMigrations.js';

const fakeStore = (initial) => {
  const parts = { ...initial };
  return {
    parts,
    getValue: (path) => parts[path],
    setValue: (path, value) => {
      parts[path] = value;
    },
  };
};

describe('upgradeOdcsDocument', () => {
  it('3.1.0 to 3.2.0 bumps only apiVersion', () => {
    const store = fakeStore({ apiVersion: 'v3.1.0', version: '0.0.1', team: { members: [{ username: 'a' }] } });

    expect(upgradeOdcsDocument(store, 'v3.1.0', 'v3.2.0')).toBe(true);

    expect(store.parts.apiVersion).toBe('v3.2.0');
    expect(store.parts.version).toBe('0.0.1');
    expect(store.parts.team).toEqual({ members: [{ username: 'a' }] });
  });

  it('crossing 3.1.0 converts the deprecated team array into the team object', () => {
    const store = fakeStore({ apiVersion: 'v3.0.1', team: [{ username: 'a' }, { username: 'b', role: 'owner' }] });

    expect(upgradeOdcsDocument(store, 'v3.0.1', 'v3.2.0')).toBe(true);

    expect(store.parts.apiVersion).toBe('v3.2.0');
    expect(store.parts.team).toEqual({ members: [{ username: 'a' }, { username: 'b', role: 'owner' }] });
  });

  it('leaves a team that is already an object untouched when crossing 3.1.0', () => {
    const store = fakeStore({ apiVersion: 'v3.0.2', team: { name: 'data-team', members: [] } });

    upgradeOdcsDocument(store, 'v3.0.2', 'v3.2.0');

    expect(store.parts.team).toEqual({ name: 'data-team', members: [] });
  });

  it('does nothing when the document is already at or above the target', () => {
    const store = fakeStore({ apiVersion: 'v3.2.0' });

    expect(upgradeOdcsDocument(store, 'v3.2.0', 'v3.2.0')).toBe(false);
    expect(upgradeOdcsDocument(store, 'v3.3.0', 'v3.2.0')).toBe(false);
    expect(upgradeOdcsDocument(store, 'v3.1.0', null)).toBe(false);
    expect(store.parts.apiVersion).toBe('v3.2.0');
  });
});
