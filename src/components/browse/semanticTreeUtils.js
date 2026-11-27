/**
 * Pure helpers for the semantic ontology tree, shared by the
 * DefinitionSelectionModal and the browse panel.
 */

/**
 * A node is selectable/addable when it represents a concrete element,
 * not a structural container.
 */
export const isSelectableNode = (node) =>
  node.elementType !== 'namespace' && node.elementType !== 'group';

/**
 * The link that a selection of the node writes. A property under a concept
 * carries `ontologyReference.url`, the link to the relationship that leads
 * from the concept to the property (`…/semantics/crm/Customer.email`), so the
 * link also says whose property the column holds. Every other node links by
 * `url`: the IRI when the concept has one, else the platform URL.
 */
export const nodeLinkUrl = (node) => node.ontologyReference?.url || node.url;

/**
 * Which row of the tree is selected. A shared property shows up twice: on its
 * own, linked as the property, and under each concept that has it, linked
 * through the relationship. Those rows share the externalId but write
 * different links, so each one is a selection of its own. The externalId stays
 * in the key because two concepts can carry the same IRI.
 */
export const nodeSelectionKey = (node) => `${node.externalId}\u0000${nodeLinkUrl(node) ?? ''}`;

/**
 * Convert a tree node into the definition shape used when applying a
 * selection to a property (same shape the definitions API returns).
 */
export const nodeToDefinition = (node) => ({
  name: node.externalId,
  url: nodeLinkUrl(node),
  authDefType: node.authDefType,
  businessName: node.businessName || node.name,
  logicalType: node.logicalType,
  description: node.description,
  tags: node.tags,
  customProperties: [
    { property: 'elementType', value: node.elementType },
    ...(node.owner ? [{ property: 'owner', value: node.owner }] : []),
  ],
});

/**
 * Filter the tree by a query, keeping parents of matching descendants.
 * A matching parent keeps all its children.
 */
export const filterTree = (nodes, q) => {
  if (!q) return nodes;
  const lower = q.toLowerCase();
  return nodes.reduce((acc, node) => {
    const match = node.name?.toLowerCase().includes(lower)
      || node.externalId?.toLowerCase().includes(lower)
      || node.description?.toLowerCase().includes(lower);
    const filteredChildren = node.children ? filterTree(node.children, q) : [];
    if (match || filteredChildren.length > 0) {
      acc.push({ ...node, children: filteredChildren.length > 0 ? filteredChildren : node.children });
    }
    return acc;
  }, []);
};

/**
 * Collect the externalIds of all nodes that have children (for auto-expanding
 * the tree while filtering).
 */
export const collectExpandableIds = (nodes) => {
  const ids = new Set();
  const collect = (list) => list.forEach((n) => {
    if (n.children?.length) { ids.add(n.externalId); collect(n.children); }
  });
  collect(nodes);
  return ids;
};

/**
 * The externalIds of the nodes that stand for a concept on its own, without
 * a relationship: every node of the tree that has no `ontologyReference.url`.
 */
export const collectStandaloneIds = (nodes, ids = new Set()) => {
  for (const node of nodes || []) {
    if (!node.ontologyReference?.url) ids.add(node.externalId);
    collectStandaloneIds(node.children, ids);
  }
  return ids;
};

/**
 * The links of a contract that a semantic tree node stands for. A property
 * under a concept stands for the relationship link. A link to the property on
 * its own belongs to the row of the property itself, if the tree has one
 * ([standaloneIds], see collectStandaloneIds); else the row under the concept
 * shows it too, so such a link is never hidden. Every other node matches `url`
 * (the IRI when the concept has one, else the platform URL) and the platform
 * URL, so contracts linked via either form match.
 */
export const nodeLinkUrls = (node, standaloneIds = new Set()) => {
  const ownUrls = [node.url, node.platformUrl].filter(Boolean);
  if (!node.ontologyReference?.url) return [...new Set(ownUrls)];
  if (standaloneIds.has(node.externalId)) return [node.ontologyReference.url];
  return [...new Set([node.ontologyReference.url, ...ownUrls])];
};
