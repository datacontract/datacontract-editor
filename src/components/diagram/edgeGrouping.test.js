import { describe, it, expect } from 'vitest';
import { groupEdges } from './edgeGrouping.js';

const edge = (id, source, target, type = 'propertyBezier') => ({
  id,
  source,
  target,
  sourceHandle: `${id}-s`,
  targetHandle: `${id}-t`,
  type,
});

describe('groupEdges', () => {
  const edges = [
    edge('a', 'schema-0', 'schema-1'),
    edge('b', 'schema-0', 'schema-1', 'schemaRelationship'),
    edge('c', 'schema-1', 'schema-0'),
    edge('d', 'schema-2', 'schema-2', 'selfReference'),
    edge('e', 'schema-2', 'schema-2', 'selfReference'),
  ];

  it('bundles edges between the same pair of tables into one edge', () => {
    const result = groupEdges(edges);
    expect(result.map((e) => e.id)).toEqual(['group-schema-0-schema-1', 'c', 'd', 'e']);
    expect(result[0].type).toBe('groupedRelationship');
    expect(result[0].data.members.map((m) => m.id)).toEqual(['a', 'b']);
  });

  it('keeps expanded groups as individual edges', () => {
    const result = groupEdges(edges, { expandedGroups: new Set(['schema-0->schema-1']) });
    expect(result.map((e) => e.id)).toEqual(['a', 'b', 'c', 'd', 'e']);
  });
});
