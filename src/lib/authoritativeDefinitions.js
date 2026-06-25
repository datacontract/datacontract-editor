import { isSemanticAuthDef } from '../utils/authDefTypes.js';
import { isInternalUrl, toAbsoluteUrl } from './urlUtils.js';

/**
 * Collect absolute URLs of authoritativeDefinitions entries that are resolvable
 * internal definitions, visiting only the locations where the ODCS v3.1.0
 * standard allows authoritativeDefinitions instead of walking the whole tree.
 *
 * ODCS locations covered (keep in sync with the standard):
 *   - contract root: `authoritativeDefinitions`
 *   - `description.authoritativeDefinitions`
 *   - `schema[]` (SchemaObject): own `authoritativeDefinitions`, each
 *     `quality[]` (DataQuality), and `properties[]`
 *   - schema property (SchemaProperty / SchemaItemProperty): own
 *     `authoritativeDefinitions`, `quality[]`, and — because object/array
 *     properties nest — recursively its `properties[]` and `items`
 *   - `team`: object form (`team.authoritativeDefinitions` + `team.members[]`)
 *     or the deprecated `team[]` array; both members are TeamMember-shaped
 *
 * An entry qualifies when it is a semantic/business definition
 * (type 'semantics' | 'semantic' | 'definition'), has a url, and the url is
 * internal (same host). Collected urls are normalized to absolute and de-duped.
 *
 * @param {*} yamlParts - parsed contract (null-safe)
 * @returns {string[]} de-duplicated absolute urls (stable order)
 */
export function collectAuthoritativeDefinitionUrls(yamlParts) {
  const urls = [];

  const addEntries = (entries) => {
    if (!Array.isArray(entries)) return;
    for (const entry of entries) {
      if (!entry || typeof entry !== 'object') continue;
      const qualifies = isSemanticAuthDef(entry) || entry.type === 'definition';
      if (!qualifies || !entry.url || !isInternalUrl(entry.url)) continue;
      const abs = toAbsoluteUrl(entry.url);
      if (abs) urls.push(abs);
    }
  };

  // DataQuality items each carry their own authoritativeDefinitions.
  const visitQuality = (quality) => {
    if (!Array.isArray(quality)) return;
    for (const check of quality) addEntries(check?.authoritativeDefinitions);
  };

  // SchemaProperty / SchemaItemProperty — recurses because object properties
  // nest via `properties[]` and array properties via `items`.
  const visitProperty = (property) => {
    if (!property || typeof property !== 'object') return;
    addEntries(property.authoritativeDefinitions);
    visitQuality(property.quality);
    if (Array.isArray(property.properties)) property.properties.forEach(visitProperty);
    visitProperty(property.items);
  };

  if (!yamlParts || typeof yamlParts !== 'object') return urls;

  // Contract root + description.
  addEntries(yamlParts.authoritativeDefinitions);
  addEntries(yamlParts.description?.authoritativeDefinitions);

  // Schema objects, their quality checks, and their (nested) properties.
  if (Array.isArray(yamlParts.schema)) {
    for (const object of yamlParts.schema) {
      if (!object || typeof object !== 'object') continue;
      addEntries(object.authoritativeDefinitions);
      visitQuality(object.quality);
      if (Array.isArray(object.properties)) object.properties.forEach(visitProperty);
    }
  }

  // Team: object form (with members) or the deprecated array-of-members form.
  const team = yamlParts.team;
  if (Array.isArray(team)) {
    for (const member of team) addEntries(member?.authoritativeDefinitions);
  } else if (team && typeof team === 'object') {
    addEntries(team.authoritativeDefinitions);
    if (Array.isArray(team.members)) {
      for (const member of team.members) addEntries(member?.authoritativeDefinitions);
    }
  }

  return [...new Set(urls)];
}

/**
 * Batch-fetch definitions. POST { urls } to batchResolveUrl, expecting a
 * url-keyed map { url: definitionData } in response.
 *
 * @param {string} batchResolveUrl
 * @param {string[]} urls - absolute urls
 * @param {string} [acceptHeader]
 * @returns {Promise<Object>} url-keyed map
 * @throws on network error or non-ok response
 */
export async function fetchAuthoritativeDefinitionsBatch(batchResolveUrl, urls, acceptHeader = 'application/json') {
  const response = await fetch(batchResolveUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: acceptHeader || 'application/json',
    },
    body: JSON.stringify({ urls }),
  });
  if (!response.ok) {
    throw new Error(`Batch definitions fetch failed: ${response.status} ${response.statusText}`);
  }
  return await response.json();
}
