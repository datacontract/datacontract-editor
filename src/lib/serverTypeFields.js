/**
 * Schema-driven server fields: which fields the active ODCS schema defines for a server `type`.
 *
 * The ODCS `Server` definition carries one `allOf` branch per type (`if type == X then $ref
 * ServerSource/X`). Reading those branches lets the editor render the field set for server types
 * it has no hand-written form for (everything ODCS 3.2.0 added: iceberg, teradata, exasol, …) and
 * discover fields 3.2.0 added to existing types (`encoding`, Athena's `workgroup`).
 */

const definitionsRoot = (schema) => schema?.$defs || schema?.definitions || null;

/** Resolves a local ref like `#/$defs/ServerSource/KafkaServer` (any depth). */
export const resolveLocalRef = (schema, ref) => {
  if (typeof ref !== 'string' || !ref.startsWith('#/')) return null;
  const segments = ref.slice(2).split('/');
  if (segments[0] !== '$defs' && segments[0] !== 'definitions') return null;
  let node = definitionsRoot(schema);
  for (const segment of segments.slice(1)) {
    node = node?.[segment];
    if (!node) return null;
  }
  return node;
};

const isPortRef = (ref) => typeof ref === 'string' && /\/Port$/.test(ref);

/**
 * The fields the active schema defines for [serverType], or null when the schema has no branch
 * for it (unknown type, or no schema loaded). `type` itself is omitted.
 *
 * @returns {Array<{name: string, description: string|undefined, required: boolean,
 *   defaultValue: *, enumValues: Array<string>|null, isPort: boolean, isNumber: boolean}>|null}
 */
export const getServerTypeSchemaFields = (schema, serverType) => {
  if (!schema || !serverType) return null;
  const server = definitionsRoot(schema)?.Server;
  if (!Array.isArray(server?.allOf)) return null;

  for (const branch of server.allOf) {
    if (branch?.if?.properties?.type?.const !== serverType) continue;

    let def = branch.then;
    if (def?.$ref) def = resolveLocalRef(schema, def.$ref);
    if (!def?.properties) return [];

    const required = Array.isArray(def.required) ? def.required : [];
    return Object.entries(def.properties)
      .filter(([name]) => name !== 'type')
      .map(([name, prop]) => {
        const resolved = prop?.$ref ? resolveLocalRef(schema, prop.$ref) : null;
        const effective = resolved || prop || {};
        return {
          name,
          description: prop?.description || effective.description,
          required: required.includes(name),
          defaultValue: prop?.default ?? effective.default,
          enumValues: Array.isArray(effective.enum) ? effective.enum : null,
          isPort: isPortRef(prop?.$ref) || name === 'port',
          isNumber: effective.type === 'integer' || effective.type === 'number',
        };
      });
  }
  return null;
};

/**
 * Parses a port input. ODCS 3.2.0 widens `port` to integer-or-string so variables like
 * `${DB_PORT:-5432}` are legal: digits become a number, anything else is kept verbatim,
 * blank clears the field.
 */
export const parsePortInput = (value) => {
  const trimmed = (value ?? '').trim();
  if (!trimmed) return undefined;
  return /^\d+$/.test(trimmed) ? parseInt(trimmed, 10) : value;
};
