export const isSemanticAuthDef = (d) => d?.type === 'semantics' || d?.type === 'semantic';

/**
 * Resolves the authoritativeDefinitions `type` for a definition picked from the
 * browse tree. Tree nodes carry their own `authDefType` — 'semantics' for
 * ontology elements, 'definition' for business definitions — set by the
 * backend. Defaults to 'semantics' when a node carries no explicit type.
 */
export const resolveAuthDefType = (definition) =>
  definition?.authDefType || 'semantics';
