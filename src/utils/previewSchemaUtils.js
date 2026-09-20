/**
 * Resolves the child rows to render under a schema property in Preview mode.
 * Objects nest via `properties`, arrays of objects via `items.properties`. Both
 * lists render when both exist, matching the data contract details page in
 * Entropy Data.
 *
 * @param {Object} property - Schema property object
 * @returns {Array|null} Array of child properties, or null if none
 */
export function resolveChildProperties(property) {
	if (!property) return null;
	const own = Array.isArray(property.properties) ? property.properties : [];
	const items = Array.isArray(property.items?.properties) ? property.items.properties : [];
	const children = [...own, ...items];
	return children.length > 0 ? children : null;
}

/**
 * Resolves the logical/physical type and options shown in the type pill.
 * For an array the pill describes the item type (the row name carries the
 * `[]` marker), so everything is read from `items` when it is present.
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
	const typeSource = property?.items != null ? property.items : (property || {});
	const effectiveLogicalType = typeSource.logicalType || propDefinition?.logicalType;
	const isLogicalTypeInherited = !typeSource.logicalType && !!propDefinition?.logicalType;
	const physicalType = typeSource.physicalType;
	const opts = typeSource.logicalTypeOptions || {};
	return { effectiveLogicalType, isLogicalTypeInherited, physicalType, opts };
}
