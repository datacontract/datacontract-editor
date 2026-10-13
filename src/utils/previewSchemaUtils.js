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

const TYPE_OPTION_KEYS = [
	'minLength', 'maxLength', 'pattern', 'format', 'minimum', 'exclusiveMinimum', 'maximum',
	'exclusiveMaximum', 'multipleOf', 'minItems', 'maxItems', 'uniqueItems', 'minProperties',
	'maxProperties', 'requiredList', 'timezone', 'defaultTimezone',
	// vector (ODCS 3.2.0)
	'dimensions', 'elementType', 'distanceMetric', 'normalized', 'embeddingModel', 'embeddingModelVersion',
];

const optionRows = (opts) => TYPE_OPTION_KEYS
	.map((key) => {
		const value = key === 'requiredList' ? opts.required : opts[key];
		if (value === undefined || value === null || value === '') return null;
		if (Array.isArray(value)) return value.length > 0 ? { key, value: value.join(', ') } : null;
		return { key, value };
	})
	.filter(Boolean);

/**
 * The detail rows behind the type pill, as `{key, value}` pairs where `key` names an i18n
 * entry under `preview.schema` and a boolean `value` renders as yes/no. Covers the physical
 * type, every logicalTypeOptions entry (for an array both the item options and the array's own
 * minItems/maxItems/uniqueItems), vector options and the key/value types of a map.
 *
 * @param {Object} property - Schema property object
 * @param {Object} [propDefinition] - Inherited semantic definition if available
 * @returns {Array<{key: string, value: *}>}
 */
export function resolveTypeDetailRows(property, propDefinition = null) {
	if (!property) return [];
	const { physicalType, opts } = resolvePropertyTypeInfo(property, propDefinition);
	const rows = [];
	const effectivePhysicalType = physicalType || (property.items != null ? property.physicalType : undefined);
	if (effectivePhysicalType) rows.push({ key: 'physicalType', value: effectivePhysicalType });
	rows.push(...optionRows(opts));
	if (property.items != null) {
		// the pill describes the item type; the array's own options still belong to the property
		const shown = new Set(rows.map((row) => row.key));
		rows.push(...optionRows(property.logicalTypeOptions || {}).filter((row) => !shown.has(row.key)));
		if (property.items.description) rows.push({ key: 'itemsDescription', value: property.items.description });
	}
	if (property.map) {
		const { key, value } = property.map;
		if (key?.logicalType) rows.push({ key: 'mapKeyType', value: key.logicalType });
		if (key?.description) rows.push({ key: 'mapKeyDescription', value: key.description });
		if (value?.logicalType) rows.push({ key: 'mapValueType', value: value.logicalType });
		if (value?.description) rows.push({ key: 'mapValueDescription', value: value.description });
	}
	return rows;
}

const QUALITY_OPERATORS = [
	'mustBe', 'mustNotBe', 'mustBeGreaterThan', 'mustBeGreaterOrEqualTo', 'mustBeLessThan',
	'mustBeLessOrEqualTo', 'mustBeBetween', 'mustNotBeBetween',
];

const formatQualityValue = (value) => {
	if (Array.isArray(value)) return value.map(formatQualityValue).join(', ');
	if (value !== null && typeof value === 'object') {
		return Object.entries(value).map(([key, v]) => `${key}: ${formatQualityValue(v)}`).join('; ');
	}
	return String(value);
};

/**
 * The detail rows of a quality check, as `{key, value}` pairs where `key` names an i18n entry
 * under `preview.schema`. Lists every field the quality editor sets (type, dimension, metric,
 * rule, arguments, query, engine, implementation, severity, business impact, method, schedule,
 * scheduler, unit, tags) and every comparison operator. The description is rendered separately.
 *
 * @param {Object} check - DataQuality object
 * @returns {Array<{key: string, value: string}>}
 */
export function resolveQualityCheckRows(check) {
	if (!check || typeof check !== 'object') return [];
	const fields = [
		['qualityType', check.type],
		['qualityDimension', check.dimension],
		['qualityMetric', check.metric],
		['qualityRule', check.rule],
		['qualityArguments', check.arguments],
		['qualityQuery', check.query],
		['qualityEngine', check.engine],
		['qualityImplementation', check.implementation],
		['qualitySeverity', check.severity],
		['qualityBusinessImpact', check.businessImpact],
		['qualityMethod', check.method],
		['qualitySchedule', check.schedule],
		['qualityScheduler', check.scheduler],
		['qualityUnit', check.unit],
		...QUALITY_OPERATORS.map((operator) => [operator, check[operator]]),
		['qualityTags', check.tags],
	];
	return fields
		.filter(([, value]) => value !== undefined && value !== null && value !== '' && !(Array.isArray(value) && value.length === 0))
		.map(([key, value]) => ({ key, value: formatQualityValue(value) }));
}

/**
 * Enum values as display strings: `value` or `value (label)`. Accepts the ODCS 3.2.0 object
 * form (`{value, label}`) and plain values.
 *
 * @param {Array} values - The property's `enum` list
 * @returns {Array<string>}
 */
export function formatEnumValues(values) {
	if (!Array.isArray(values)) return [];
	return values
		.map((entry) => {
			if (entry !== null && typeof entry === 'object') {
				if (entry.value === undefined || entry.value === null) return null;
				return entry.label && String(entry.label) !== String(entry.value)
					? `${entry.value} (${entry.label})`
					: String(entry.value);
			}
			return entry === undefined || entry === null ? null : String(entry);
		})
		.filter(Boolean);
}

/**
 * Synonyms as display strings: `synonym` or `synonym (locale)`. Accepts the ODCS 3.2.0 object
 * form and plain strings.
 *
 * @param {Array} synonyms - A `synonyms` list
 * @returns {Array<string>}
 */
export function formatSynonyms(synonyms) {
	if (!Array.isArray(synonyms)) return [];
	return synonyms
		.map((entry) => {
			if (typeof entry === 'string') return entry;
			if (!entry?.synonym) return null;
			return entry.locale ? `${entry.synonym} (${entry.locale})` : entry.synonym;
		})
		.filter(Boolean);
}

/**
 * A relationship's ends as display strings; composite keys join with a comma.
 *
 * @param {Object} relationship - A relationship object
 * @returns {{type: string|undefined, from: string|undefined, to: string|undefined}}
 */
export function formatRelationship(relationship) {
	const join = (end) => (Array.isArray(end) ? end.join(', ') : end || undefined);
	return { type: relationship?.type, from: join(relationship?.from), to: join(relationship?.to) };
}
