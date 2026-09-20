/**
 * Resolves child properties for schema property rendering in Preview mode.
 * Handles both object properties (property.properties) and array properties
 * with nested item definitions (property.items.properties).
 *
 * @param {Object} property - Schema property object
 * @returns {Array|null} Array of child properties, or null if none
 */
export function resolveChildProperties(property) {
	if (!property) return null;
	if (property.properties && Array.isArray(property.properties) && property.properties.length > 0) {
		return property.properties;
	}
	if (property.items?.properties && Array.isArray(property.items.properties) && property.items.properties.length > 0) {
		return property.items.properties;
	}
	return null;
}

/**
 * Resolves effective logical/physical types and options for schema property rendering.
 *
 * @param {Object} property - Schema property object
 * @param {Object} [propDefinition] - Inherited semantic definition if available
 * @returns {{
 *   effectiveLogicalType: string|undefined,
 *   isLogicalTypeInherited: boolean,
 *   physicalType: string|undefined,
 *   opts: Object
 * }}
 */
export function resolvePropertyTypeInfo(property, propDefinition = null) {
	const effectiveLogicalType = property?.logicalType || property?.items?.logicalType || propDefinition?.logicalType;
	const isLogicalTypeInherited = !property?.logicalType && !property?.items?.logicalType && !!propDefinition?.logicalType;
	const physicalType = property?.physicalType || property?.items?.physicalType;
	const opts = { ...(property?.items?.logicalTypeOptions || {}), ...(property?.logicalTypeOptions || {}) };
	return { effectiveLogicalType, isLogicalTypeInherited, physicalType, opts };
}
