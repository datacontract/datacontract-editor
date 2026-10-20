/**
 * Fill a server from an asset catalog suggestion. The suggestion's type,
 * location fields and custom properties (the assetId) replace the
 * type-specific fields, as a type change does. The name, environment,
 * description, roles and other custom properties stay; an unnamed server
 * takes the suggestion's name.
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
  const suggestedProperties = suggestedCustomProperties || [];
  const currentProperties = Array.isArray(current?.customProperties) ? current.customProperties : [];
  const customProperties = [
    ...currentProperties.filter((item) => !suggestedProperties.some((p) => p.property === item?.property)),
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
