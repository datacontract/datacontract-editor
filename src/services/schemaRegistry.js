/**
 * The one place the editor loads, caches and merges the ODCS JSON schema.
 *
 * Every consumer (Monaco validation, AJV validation, completion, the AI schema tool) goes through
 * here, so the schema is fetched once per URL and merged once per customization set instead of
 * each module keeping its own copy. Loading is keyed by URL so the next step, several schema
 * versions side by side, only has to add more URLs.
 */
import { useEditorStore } from '../store.js';
import { mergeCustomizationsIntoSchema } from '../utils/mergeCustomizationsIntoSchema.js';
import { compareApiVersions } from '../lib/apiVersion.js';

/** Used when neither the host nor the store provides a schema URL. */
export const DEFAULT_ODCS_SCHEMA_URL =
  'https://raw.githubusercontent.com/bitol-io/open-data-contract-standard/refs/heads/main/schema/odcs-json-schema-v3.1.0.json';

/** The version list when the host configures none: the default schema, under the version it names. */
export const DEFAULT_ODCS_VERSIONS = Object.freeze([
  Object.freeze({ version: 'v3.1.0', schema: DEFAULT_ODCS_SCHEMA_URL, default: true }),
]);

const normalizeApiVersion = (value) => {
  if (typeof value !== 'string' || !value.trim()) return null;
  const trimmed = value.trim();
  return trimmed.startsWith('v') ? trimmed : `v${trimmed}`;
};

/**
 * The host's `odcsVersions` config as the editor uses it: `{ version, schema, default }` entries,
 * newest first, with exactly one default (the newest when the host flags none). Entries without a
 * schema URL are dropped. A legacy single `schemaUrl` becomes one entry whose version is unknown
 * until that schema is loaded (see [defaultOdcsVersion]); nothing at all means the built-in list.
 */
export function odcsVersionsFromConfig({ odcsVersions, schemaUrl } = {}) {
  const entries = (Array.isArray(odcsVersions) ? odcsVersions : [])
    .filter((entry) => entry && typeof entry.schema === 'string' && entry.schema.trim())
    .map((entry) => ({
      version: normalizeApiVersion(entry.version),
      schema: entry.schema.trim(),
      default: entry.default === true,
    }));
  if (entries.length === 0) {
    if (typeof schemaUrl === 'string' && schemaUrl.trim()) {
      return [{ version: null, schema: schemaUrl.trim(), default: true }];
    }
    return [...DEFAULT_ODCS_VERSIONS];
  }
  entries.sort((a, b) => compareApiVersions(b.version, a.version));
  const flagged = entries.findIndex((entry) => entry.default);
  const defaultIndex = flagged >= 0 ? flagged : 0;
  return entries.map((entry, index) => ({ ...entry, default: index === defaultIndex }));
}

/** The entry new documents get and migrations target. */
export function defaultOdcsVersionEntry(versions) {
  const list = Array.isArray(versions) && versions.length > 0 ? versions : DEFAULT_ODCS_VERSIONS;
  return list.find((entry) => entry.default) ?? list[0];
}

/**
 * The entry to validate a document declaring [apiVersion] against: the one of its own version, so
 * a `v3.1.0` document is checked against the 3.1.0 schema even when 3.2.0 is the default; the
 * default entry when the document's version is not listed (or missing).
 */
export function odcsVersionEntryFor(versions, apiVersion) {
  const list = Array.isArray(versions) && versions.length > 0 ? versions : DEFAULT_ODCS_VERSIONS;
  const wanted = normalizeApiVersion(apiVersion);
  const own = wanted && list.find((entry) => entry.version && compareApiVersions(entry.version, wanted) === 0);
  return own || defaultOdcsVersionEntry(list);
}

/**
 * The apiVersion new documents get and the Migrate action targets: the default entry's version,
 * or, for a legacy single schema whose version the host did not name, what that schema declares.
 */
export function defaultOdcsVersion(versions, schemaData) {
  return defaultOdcsVersionEntry(versions).version ?? getSchemaApiVersion(schemaData);
}

/**
 * The apiVersion values a loaded schema accepts: the root `properties.apiVersion.enum`, narrowed
 * by every `allOf` branch that declares one (a host overlay pinning an organization to a subset).
 */
export function getSchemaAcceptedApiVersions(schema) {
  if (!schema || typeof schema !== 'object') return [];
  const candidates = [schema, ...(Array.isArray(schema.allOf) ? schema.allOf : [])];
  let versions = null;
  for (const candidate of candidates) {
    const prop = candidate?.properties?.apiVersion;
    const accepted = Array.isArray(prop?.enum) ? prop.enum : prop?.const ? [prop.const] : null;
    if (!accepted) continue;
    versions = versions ? versions.filter((v) => accepted.includes(v)) : accepted;
  }
  return versions || [];
}

// url -> Promise<schema>. A failed load is evicted so the next call retries.
const schemaPromises = new Map();
// base schema object -> Map<customization hash, merged schema>
const mergedSchemas = new WeakMap();

/** The URL to load: the given one when set, otherwise the default. */
export function resolveSchemaUrl(url) {
  return typeof url === 'string' && url.trim() ? url.trim() : DEFAULT_ODCS_SCHEMA_URL;
}

/**
 * The URL the current editor session validates against: the schema of the document's own ODCS
 * version when the host lists versions, otherwise the single configured (or default) schema.
 */
export function activeSchemaUrl() {
  const state = useEditorStore.getState();
  if (Array.isArray(state.odcsVersions) && state.odcsVersions.length > 0) {
    return odcsVersionEntryFor(state.odcsVersions, state.getValue?.('apiVersion')).schema;
  }
  return resolveSchemaUrl(state.schemaUrl);
}

/**
 * Load a schema by URL. Resolves to the parsed schema; rejects when the fetch fails. Concurrent
 * and repeated calls for the same URL share one request.
 */
export function loadSchema(url = activeSchemaUrl()) {
  const key = resolveSchemaUrl(url);
  let pending = schemaPromises.get(key);
  if (!pending) {
    pending = fetch(key)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}${response.statusText ? `: ${response.statusText}` : ''}`);
        }
        return response.json();
      })
      .catch((error) => {
        schemaPromises.delete(key);
        throw error;
      });
    schemaPromises.set(key, pending);
  }
  return pending;
}

/** Like [loadSchema] but resolves to null instead of rejecting, for callers that degrade gracefully. */
export async function loadSchemaOrNull(url) {
  try {
    return await loadSchema(url);
  } catch (error) {
    console.warn('Failed to fetch ODCS schema:', error.message);
    return null;
  }
}

/** Stable key for a customization set; null when there is none. */
export function hashCustomizations(customizations) {
  if (!customizations) return null;
  try {
    return JSON.stringify(customizations);
  } catch {
    return null;
  }
}

/**
 * The base schema with the host customizations merged in. Cached per base schema object and
 * customization set, so repeated renders and validators share one merged document.
 */
export function mergeSchema(baseSchema, customizations) {
  if (!baseSchema) return null;
  const hash = hashCustomizations(customizations);
  if (hash === null) return mergeCustomizationsIntoSchema(baseSchema, customizations);

  let perBase = mergedSchemas.get(baseSchema);
  if (!perBase) {
    perBase = new Map();
    mergedSchemas.set(baseSchema, perBase);
  }
  let merged = perBase.get(hash);
  if (!merged) {
    merged = mergeCustomizationsIntoSchema(baseSchema, customizations);
    perBase.set(hash, merged);
  }
  return merged;
}

/** Load the schema at [url] and merge [customizations] into it; null when loading fails. */
export async function loadMergedSchema(customizations, url) {
  const base = await loadSchemaOrNull(url);
  return base ? mergeSchema(base, customizations) : null;
}

/**
 * The apiVersion a schema declares as its default. Looks at the root `properties.apiVersion` and,
 * for a composed schema (a host overlay layered on via `allOf`), at each `allOf` branch.
 */
export function getSchemaApiVersion(schema) {
  if (!schema || typeof schema !== 'object') return null;
  const candidates = [schema, ...(Array.isArray(schema.allOf) ? schema.allOf : [])];
  for (const candidate of candidates) {
    const prop = candidate?.properties?.apiVersion;
    if (!prop) continue;
    if (prop.default) return prop.default;
    if (prop.const) return prop.const;
    if (Array.isArray(prop.enum) && prop.enum.length === 1) return prop.enum[0];
  }
  return null;
}

/** The file name part of a schema URL, for display. */
export function getSchemaFilename(url) {
  if (!url) return null;
  const withoutQuery = url.split(/[?#]/)[0];
  return withoutQuery.split('/').pop() || 'schema.json';
}

/** Drops every cached schema. For tests. */
export function clearSchemaCache() {
  schemaPromises.clear();
}
