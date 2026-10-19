// Cardinality label for the referencing (foreign-key) side of a relationship,
// using the same rules as the Entropy Data visualizer: only relationships to a
// primary key get a label. '1' = exactly one, '?' = zero or one, 'n' = many.
export function getCardinality(referencingProperty, referencedProperty) {
  if (referencedProperty?.primaryKey !== true) return null;
  if (referencingProperty?.unique === true) {
    return referencingProperty.required === true ? '1' : '?';
  }
  return 'n';
}
