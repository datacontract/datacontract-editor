/**
 * Fill a server with the defaults the host knows for its type, e.g. the host
 * and port of the organization's one Dremio cluster. Only fields the server
 * leaves empty are filled, so nothing the user typed is overwritten. The
 * name, type, environment, description, roles and custom properties are never
 * taken from the defaults: they describe this server, not the platform.
 *
 * @param {Object} server - The server being edited
 * @param {Object} defaults - Field values from the host, e.g. { host, port }
 * @returns {Object} the server with the defaults filled in
 */
export function applyServerDefaults(server, defaults) {
  if (!server || !defaults || typeof defaults !== 'object' || Array.isArray(defaults)) return server;
  const filled = { ...server };
  Object.entries(defaults).forEach(([field, value]) => {
    if (PROTECTED_FIELDS.has(field)) return;
    if (value === null || value === undefined || value === '') return;
    const current = filled[field];
    if (current !== null && current !== undefined && current !== '') return;
    filled[field] = value;
  });
  return filled;
}

const PROTECTED_FIELDS = new Set(['id', 'server', 'type', 'environment', 'description', 'roles', 'customProperties']);
