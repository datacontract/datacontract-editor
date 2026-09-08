// Blueprint for a newly added schema object. Keep the fields aligned with the
// ODCS 3.2.0 SchemaObject definition (unevaluatedProperties: false) — any
// extra key makes the whole contract fail validation.
export const createSchemaStub = (existingCount = 0) => {
  const schemaNumber = existingCount + 1;
  return {
    name: `schema_${schemaNumber}`,
    businessName: `Schema ${schemaNumber}`,
    logicalType: 'object',
    physicalType: 'table',
    properties: [],
  };
};
