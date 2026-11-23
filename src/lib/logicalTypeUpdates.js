const LOGICAL_TYPES = ['string', 'date', 'timestamp', 'time', 'number', 'integer', 'object', 'array', 'boolean', 'map', 'vector'];
const OPTION_FAMILIES = [['date', 'timestamp', 'time'], ['integer', 'number']];

const optionsAfterChange = (options, from, to) => {
  if (from === to) return options;
  if (!OPTION_FAMILIES.some((family) => family.includes(from) && family.includes(to))) return undefined;
  const kept = { ...options };
  // ODCS gives integer and number different format values, and date no time zone.
  if (to === 'integer' || to === 'number') delete kept.format;
  if (to === 'date') {
    delete kept.timezone;
    delete kept.defaultTimezone;
  }
  return Object.keys(kept).length > 0 ? kept : undefined;
};

/**
 * The fields to set on [property] when its logical type changes: the type itself, and `undefined`
 * for what ODCS does not allow with the new one. A map gets the key and value ODCS requires of it.
 */
export function logicalTypeUpdates(property, logicalType) {
  const updates = { logicalType: logicalType || undefined };
  // The type field also commits half-typed names, which must not delete anything.
  if (logicalType && !LOGICAL_TYPES.includes(logicalType)) return updates;
  if (property?.items && logicalType && logicalType !== 'array') updates.items = undefined;
  if (property?.properties && logicalType && logicalType !== 'object') updates.properties = undefined;
  if (property?.map && logicalType !== 'map') updates.map = undefined;
  if (!property?.map && logicalType === 'map') updates.map = { key: {}, value: {} };
  if (property?.logicalTypeOptions) {
    updates.logicalTypeOptions = optionsAfterChange(property.logicalTypeOptions, property.logicalType, logicalType);
  }
  return updates;
}
