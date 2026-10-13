/**
 * Server fields the server card in Preview renders on its own: the header (name, environment,
 * description), the curated field list, roles and custom properties. `id` is a technical
 * identifier and stays out of the preview.
 */
const RENDERED_SERVER_KEYS = new Set([
	'id', 'server', 'type', 'environment', 'description', 'roles', 'customProperties',
	'project', 'dataset', 'endpointUrl', 'location', 'path', 'account', 'catalog', 'database',
	'schema', 'table', 'view', 'host', 'port', 'topic', 'format', 'delimiter', 'stagingDir',
	'stream', 'serviceName', 'warehouse', 'region', 'regionName',
]);

const isScalar = (value) => ['string', 'number', 'boolean'].includes(typeof value);

/**
 * The remaining fields of a server, in document order, so type-specific fields the card has no
 * curated slot for (ODCS 3.2.0's `encoding`, Athena's `workgroup`, Iceberg's `catalogUrl`, …)
 * still show. Scalars and lists of scalars only; empty values are skipped.
 *
 * @param {Object} server - Server object
 * @returns {Array<{key: string, value: string}>}
 */
export function getAdditionalServerFields(server) {
	if (!server || typeof server !== 'object') return [];
	return Object.entries(server)
		.filter(([key]) => !RENDERED_SERVER_KEYS.has(key))
		.map(([key, value]) => {
			if (isScalar(value) && value !== '') return { key, value: String(value) };
			if (Array.isArray(value) && value.length > 0 && value.every(isScalar)) return { key, value: value.join(', ') };
			return null;
		})
		.filter(Boolean);
}

/** `catalogUrl` → `Catalog Url`, the label style of the schema-driven server form. */
export const humanizeFieldName = (name) => name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, ' $1');
