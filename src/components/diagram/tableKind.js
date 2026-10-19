// Dimensional-modeling naming conventions (Kimball / dbt): fct_ / fact_ for
// fact tables, dim_ for dimension tables. Returns 'fact', 'dimension' or null.
export function getTableKind(name) {
  if (typeof name !== 'string') return null;
  const lower = name.toLowerCase();
  if (lower.startsWith('fct_') || lower.startsWith('fact_')) return 'fact';
  if (lower.startsWith('dim_')) return 'dimension';
  return null;
}
