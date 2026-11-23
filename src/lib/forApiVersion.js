import { isBeforeApiVersion } from './apiVersion.js';
import { logicalTypeUpdates } from './logicalTypeUpdates.js';

/** A property, and every property in it, with only what ODCS [apiVersion] has. */
export function propertyForApiVersion(property, apiVersion) {
  const result = { ...property };
  const before310 = isBeforeApiVersion(apiVersion, 'v3.1.0');
  const before320 = isBeforeApiVersion(apiVersion, 'v3.2.0');

  if (before320 && (result.logicalType === 'map' || result.map)) {
    Object.assign(result, logicalTypeUpdates(result, 'object'));
  } else if (before320 && result.logicalType === 'vector') {
    Object.assign(result, logicalTypeUpdates(result, 'array'), { items: { logicalType: 'number' } });
  } else if (before310 && (result.logicalType === 'timestamp' || result.logicalType === 'time')) {
    Object.assign(result, logicalTypeUpdates(result, 'date'));
    if (result.logicalTypeOptions) {
      // Before 3.1.0 these are booleans.
      result.logicalTypeOptions = { ...result.logicalTypeOptions };
      delete result.logicalTypeOptions.exclusiveMinimum;
      delete result.logicalTypeOptions.exclusiveMaximum;
    }
  }
  Object.keys(result).forEach((key) => {
    if (result[key] === undefined) delete result[key];
  });

  if (result.properties) result.properties = result.properties.map((child) => propertyForApiVersion(child, apiVersion));
  if (result.items) result.items = propertyForApiVersion(result.items, apiVersion);
  if (result.map) {
    result.map = {
      key: propertyForApiVersion(result.map.key, apiVersion),
      value: propertyForApiVersion(result.map.value, apiVersion),
    };
  }
  return result;
}

/**
 * A server with only what ODCS [apiVersion] has: before 3.2.0 an exasol or iceberg server becomes
 * a `custom` one that names its type in the custom property `customType`.
 */
export function serverForApiVersion(server, apiVersion) {
  if (!isBeforeApiVersion(apiVersion, 'v3.2.0') || !['exasol', 'iceberg'].includes(server?.type)) return server;
  const { type, catalogUrl, namespace, ...rest } = server;
  const moved = Object.entries({ customType: type, catalogUrl, namespace })
    .filter(([, value]) => value)
    .map(([property, value]) => ({ property, value }));
  return { ...rest, type: 'custom', customProperties: [...(rest.customProperties || []), ...moved] };
}
