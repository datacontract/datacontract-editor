/**
 * Let `relationships[].type` be any string.
 *
 * ODCS documents the field as a string defaulting to `foreignKey`, but the published JSON schema
 * pins it to `enum: ['foreignKey']`, so semantic-layer contracts using cardinalities such as
 * `many-to-one` are flagged as invalid (datacontract-editor#33). The enum is dropped and
 * `foreignKey` is kept as the default and as a suggestion for completion. A host that wants the
 * strict list back can restore it through its customizations, which are merged afterwards.
 *
 * Returns a copy when the schema has a relationship type enum; otherwise the schema itself.
 */
export function relaxRelationshipType(schema) {
	const type = schema?.$defs?.RelationshipBase?.properties?.type;
	if (!type || !Array.isArray(type.enum)) return schema;

	const { enum: allowed, ...rest } = type;
	const relaxedType = { ...rest, examples: [...new Set([...(rest.examples || []), ...allowed])] };
	const base = schema.$defs.RelationshipBase;

	return {
		...schema,
		$defs: {
			...schema.$defs,
			RelationshipBase: {
				...base,
				properties: { ...base.properties, type: relaxedType },
			},
		},
	};
}
