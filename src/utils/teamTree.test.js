import { describe, it, expect } from 'vitest';
import { buildTeamTree, filterTeams, hasTeamOverrides } from './teamTree.js';

const teams = [
  { id: 'shipping', name: 'Shipping', parentId: 'fulfillment' },
  { id: 'fulfillment', name: 'Fulfillment', type: 'Domain', selectable: false },
  { id: 'inventory', name: 'Inventory', parentId: 'fulfillment', description: 'Stock levels' },
  { id: 'controlling', name: 'Controlling', parentId: 'unknown-parent' },
];

describe('buildTeamTree', () => {
  it('orders parents before their children and sorts siblings by name', () => {
    const tree = buildTeamTree(teams);
    expect(tree.map((t) => [t.id, t.level])).toEqual([
      ['controlling', 0],
      ['fulfillment', 0],
      ['inventory', 1],
      ['shipping', 1],
    ]);
  });

  it('treats teams as selectable unless the host says otherwise', () => {
    const tree = buildTeamTree(teams);
    expect(tree.find((t) => t.id === 'fulfillment').selectable).toBe(false);
    expect(tree.find((t) => t.id === 'shipping').selectable).toBe(true);
  });

  it('survives a parent cycle', () => {
    const tree = buildTeamTree([
      { id: 'a', name: 'A', parentId: 'b' },
      { id: 'b', name: 'B', parentId: 'a' },
      { id: 'c', name: 'C' },
    ]);
    expect(tree.map((t) => t.id)).toEqual(['c']);
  });

  it('accepts the plain id and name shape', () => {
    expect(buildTeamTree([{ id: 'team-1', name: 'Team 1' }])).toEqual([
      { id: 'team-1', name: 'Team 1', level: 0, selectable: true },
    ]);
  });
});

describe('filterTeams', () => {
  it('matches description and id, and keeps the ancestors of a match', () => {
    const tree = buildTeamTree(teams);
    expect(filterTeams(tree, 'stock').map((t) => [t.id, t.level])).toEqual([['fulfillment', 0], ['inventory', 1]]);
    expect(filterTeams(tree, 'SHIP').map((t) => t.id)).toEqual(['fulfillment', 'shipping']);
    expect(filterTeams(tree, 'controlling').map((t) => t.id)).toEqual(['controlling']);
  });
});

describe('hasTeamOverrides', () => {
  it('ignores the name and empty values', () => {
    expect(hasTeamOverrides({ name: 'shipping' })).toBe(false);
    expect(hasTeamOverrides({ name: 'shipping', members: [], description: '' })).toBe(false);
  });

  it('reports members, description and other fields', () => {
    expect(hasTeamOverrides({ name: 'shipping', members: [{ username: 'jdoe' }] })).toBe(true);
    expect(hasTeamOverrides({ name: 'shipping', description: 'Carrier events' })).toBe(true);
    expect(hasTeamOverrides([{ username: 'jdoe' }])).toBe(true);
  });

  it('ignores custom properties the organization configured', () => {
    const team = { name: 'shipping', customProperties: [{ property: 'costCenter', value: '4711' }] };
    expect(hasTeamOverrides(team, ['costCenter'])).toBe(false);
    expect(hasTeamOverrides(team)).toBe(true);
  });
});
