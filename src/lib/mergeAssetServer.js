/**
 * Fill a server from an asset catalog suggestion. The suggestion's type,
 * location fields and custom properties replace the type-specific fields, as
 * a type change does. The name, environment, description, roles and other
 * custom properties stay; an unnamed server takes the suggestion's name.
 * An assetId custom property is never filled in, also when a host sends one:
 * the server describes a location, and the host finds its assets by it.
 *
 * @param {Object} current - The server being edited
 * @param {Object} suggested - The suggestion's server
 * @returns {Object} the merged server
 */
export function mergeAssetServer(current, suggested) {
  const {
    server: suggestedName,
    environment,
    description: _description,
    roles: _roles,
    customProperties: suggestedCustomProperties,
    ...location
  } = suggested || {};
  const suggestedProperties = (suggestedCustomProperties || []).filter((p) => p?.property !== 'assetId');
  const currentProperties = Array.isArray(current?.customProperties) ? current.customProperties : [];
  // What serverForApiVersion wrote for the type this replaces
  const customType = current?.type === 'custom' && currentProperties.find((item) => item?.property === 'customType')?.value;
  const replaced = [
    ...suggestedProperties.map((p) => p.property),
    ...(customType ? ['customType'] : []),
    ...(customType === 'iceberg' ? ['catalogUrl', 'namespace'] : []),
  ];
  const customProperties = [
    ...currentProperties.filter((item) => !replaced.includes(item?.property)),
    ...suggestedProperties,
  ];

  const merged = {
    server: current?.server || suggestedName,
    environment: current?.environment ?? environment,
    description: current?.description,
    roles: current?.roles,
    ...Object.fromEntries(Object.entries(location).filter(([, value]) => value !== null && value !== undefined && value !== '')),
    customProperties: customProperties.length > 0 ? customProperties : undefined,
  };
  Object.keys(merged).forEach((key) => {
    if (merged[key] === undefined) delete merged[key];
  });
  return merged;
}
