// Edge types that connect two different tables and may be bundled.
// Self-references keep their own routing around the node.
const GROUPABLE_TYPES = new Set(['propertyBezier', 'schemaRelationship']);

export const getEdgeGroupKey = (edge) => `${edge.source}->${edge.target}`;

/**
 * Bundle all relationship edges that run between the same pair of tables
 * (same direction) into a single 'groupedRelationship' edge. Groups whose key
 * is in `expandedGroups` stay as individual edges so each one can be clicked.
 * Pairs with only one edge are left untouched.
 */
export function groupEdges(edges, { expandedGroups = new Set() } = {}) {
  const buckets = new Map();
  edges.forEach((edge) => {
    if (!GROUPABLE_TYPES.has(edge.type)) return;
    const key = getEdgeGroupKey(edge);
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(edge);
  });

  const result = [];
  const emitted = new Set();
  edges.forEach((edge) => {
    const key = GROUPABLE_TYPES.has(edge.type) ? getEdgeGroupKey(edge) : null;
    const members = key ? buckets.get(key) : null;
    if (!members || members.length < 2 || expandedGroups.has(key)) {
      result.push(edge);
      return;
    }
    if (emitted.has(key)) return;
    emitted.add(key);
    result.push({
      id: `group-${edge.source}-${edge.target}`,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
      type: 'groupedRelationship',
      selectable: false,
      deletable: false,
      focusable: false,
      interactionWidth: 20,
      style: edge.style,
      data: {
        groupKey: key,
        members: members.map((m) => ({ id: m.id, sourceHandle: m.sourceHandle, targetHandle: m.targetHandle, cardinality: m.data?.cardinality })),
      },
    });
  });
  return result;
}
