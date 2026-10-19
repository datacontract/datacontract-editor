import { resolveAuthDefType, isSemanticAuthDef } from '../../utils/authDefTypes.js';
import { nodeToDefinition } from './semanticTreeUtils.js';

/**
 * Build an ODCS schema property from a semantic tree node.
 *
 * Semantic elements are LINKED, not copied: only the name and the
 * authoritativeDefinitions entry are written; every other field is inherited
 * at render time from the resolved definition. Dropping an entity with
 * properties yields an object property with one linked sub-property per
 * concept property.
 */
export function buildPropertyFromSemanticNode(node) {
  const definition = nodeToDefinition(node);
  const base = {
    name: definition.businessName || definition.name?.split('/').pop() || '',
    authoritativeDefinitions: [{ type: resolveAuthDefType(definition), url: definition.url }],
  };

  if (node.elementType === 'entity') {
    const childProps = (node.children || [])
      .filter((c) => c.elementType === 'property' || c.elementType === 'shared_property')
      .map((c) => buildPropertyFromSemanticNode(c));
    if (childProps.length > 0) {
      return { ...base, logicalType: 'object', properties: childProps };
    }
  }

  return base;
}

// Fields copied verbatim from an upstream contract property. Everything
// port-specific (quality, transforms, criticalDataElement, ...) stays behind.
const COPIED_PROPERTY_FIELDS = [
  'name', 'businessName', 'logicalType', 'logicalTypeOptions', 'physicalType',
  'description', 'required', 'classification', 'examples',
];

/**
 * Build an ODCS schema property from an upstream data product's contract
 * property.
 *
 * Upstream properties are COPIED (there is no definition URL to inherit
 * from), but their semantic authoritativeDefinitions are carried over so
 * concept links survive the hop downstream. Nested properties and array
 * items are copied recursively.
 *
 * When `origin` describes where the property came from
 * ({dataProductName, contractExternalId, contractTitle, schemaName,
 * schemaPhysicalName, propertyName}), the copied top-level property records
 * its lineage in the ODCS transform fields: transformSourceObjects points at
 * the upstream table, transformDescription names the exact source.
 */
export function buildPropertyFromContractProperty(prop, origin = null) {
  if (!prop || typeof prop !== 'object') return { name: '' };

  const copy = {};
  for (const field of COPIED_PROPERTY_FIELDS) {
    if (prop[field] !== undefined && prop[field] !== null) {
      copy[field] = prop[field];
    }
  }

  const semanticDefs = (prop.authoritativeDefinitions || []).filter(isSemanticAuthDef);
  if (semanticDefs.length > 0) {
    copy.authoritativeDefinitions = semanticDefs.map((d) => ({ type: d.type, url: d.url }));
  }

  if (Array.isArray(prop.properties) && prop.properties.length > 0) {
    copy.properties = prop.properties.map((child) => buildPropertyFromContractProperty(child));
  }
  if (prop.items && typeof prop.items === 'object') {
    copy.items = buildPropertyFromContractProperty(prop.items);
    delete copy.items.name;
  }

  if (origin) {
    applyTransformLineage(copy, origin, prop.name);
  }

  return copy;
}

/**
 * Record where a property came from in the ODCS transform fields.
 * transformSourceObjects holds a resolvable URI of the source property:
 *   {productDetailsUrl}?outputPortId={portExternalId}#{schemaName}.{propertyName}
 * plus a human-readable transformDescription. Without a configured details
 * URL template it falls back to the previous convention (source object =
 * data product id, transformLogic = schema.property).
 */
function applyTransformLineage(target, origin, propertyName) {
  const uri = buildSourcePropertyUri(origin, propertyName);
  if (uri) {
    target.transformSourceObjects = [uri];
  } else {
    const sourceObject = origin.dataProductExternalId || origin.contractExternalId;
    if (sourceObject) {
      target.transformSourceObjects = [sourceObject];
    }
    const qualifiedProperty = [origin.schemaName, propertyName].filter(Boolean).join('.');
    if (qualifiedProperty) {
      target.transformLogic = qualifiedProperty;
    }
  }
  target.transformDescription = buildTransformDescription(origin, propertyName);
}

/**
 * The source-property URI written into transformSourceObjects. Absolute
 * (resolved against the embedding page's origin) so it stays resolvable
 * outside the editor.
 */
export function buildSourcePropertyUri(origin, propertyName) {
  if (!origin?.productUrl) return null;
  let base = origin.productUrl;
  try {
    if (typeof window !== 'undefined' && window.location?.origin) {
      base = new URL(base, window.location.origin).toString();
    }
  } catch {
    // keep the configured value as-is
  }
  const query = origin.outputPortExternalId ? `?outputPortId=${encodeURIComponent(origin.outputPortExternalId)}` : '';
  const fragment = [origin.schemaName, propertyName].filter(Boolean).join('.');
  return `${base}${query}${fragment ? `#${fragment}` : ''}`;
}

// Written into the contract YAML (not UI), so intentionally not translated.
function buildTransformDescription(origin, propertyName) {
  const from = [origin.schemaName, propertyName].filter(Boolean).join('.');
  const contractRef = origin.contractTitle || origin.contractExternalId;
  const parts = [`Sourced from ${from}`];
  if (contractRef) parts.push(`in data contract "${contractRef}"`);
  if (origin.dataProductName) parts.push(`(data product "${origin.dataProductName}")`);
  return parts.join(' ');
}

/**
 * Build the property object for a browse drag payload.
 * @param {Object} data - active.data.current of the drag ({source: 'browse', kind, node|property})
 */
export function buildPropertyFromBrowseDrag(data) {
  if (data?.kind === 'semantics') return buildPropertyFromSemanticNode(data.node);
  if (data?.kind === 'dataProduct') return buildPropertyFromContractProperty(data.property, data.origin);
  // A column of the contract's own server: the physical column itself, so no lineage
  if (data?.kind === 'asset') return buildPropertyFromContractProperty(data.property);
  return null;
}

/**
 * Link a browse drag onto an EXISTING property (drop on the row's middle):
 *  - semantics: write the authoritativeDefinitions link, replacing a previous
 *    semantic/definition link but keeping other kinds (same behavior as the
 *    property drawer's definition select),
 *  - upstream data product property: record the transform lineage fields and
 *    carry the upstream's semantic links only when the target has none,
 *  - asset column: map the property onto the column, i.e. set its
 *    physicalName, and its physicalType when it has none yet.
 * @returns {boolean} whether a link was applied
 */
export function linkPropertyFromBrowseDrag(getValue, setValue, schemaIndex, index, data) {
  const path = `schema[${schemaIndex}].properties[${index}]`;
  const property = getValue(path);
  if (!property || typeof property !== 'object') return false;

  if (data?.kind === 'semantics') {
    const definition = nodeToDefinition(data.node);
    if (!definition.url) return false;
    const others = (property.authoritativeDefinitions || [])
      .filter((d) => !isSemanticAuthDef(d) && d?.type !== 'definition');
    setValue(`${path}.authoritativeDefinitions`, [
      ...others,
      { type: resolveAuthDefType(definition), url: definition.url },
    ]);
    return true;
  }

  if (data?.kind === 'dataProduct') {
    const updated = { ...property };
    if (data.origin) {
      applyTransformLineage(updated, data.origin, data.property?.name);
    }
    const upstreamSemanticDefs = (data.property?.authoritativeDefinitions || []).filter(isSemanticAuthDef);
    const hasOwnSemanticDef = (property.authoritativeDefinitions || []).some(isSemanticAuthDef);
    if (upstreamSemanticDefs.length > 0 && !hasOwnSemanticDef) {
      updated.authoritativeDefinitions = [
        ...(property.authoritativeDefinitions || []),
        ...upstreamSemanticDefs.map((d) => ({ type: d.type, url: d.url })),
      ];
    }
    setValue(path, updated);
    return true;
  }

  if (data?.kind === 'asset') {
    const column = data.property;
    if (!column?.name) return false;
    const updated = { ...property, physicalName: column.name };
    if (!property.physicalType && column.physicalType) {
      updated.physicalType = column.physicalType;
    }
    setValue(path, updated);
    return true;
  }

  return false;
}

/**
 * Scroll an element to the vertical center of its nearest scrollable
 * ancestor. Unlike Element.scrollIntoView this never scrolls further
 * ancestors, in particular not the window of the page embedding the editor.
 */
export function scrollIntoNearestScrollParent(el) {
  if (!el) return;
  let parent = el.parentElement;
  while (parent) {
    const style = getComputedStyle(parent);
    if (/(auto|scroll)/.test(style.overflowY) && parent.scrollHeight > parent.clientHeight) break;
    parent = parent.parentElement;
  }
  if (!parent) return;
  const elRect = el.getBoundingClientRect();
  const parentRect = parent.getBoundingClientRect();
  const offset = elRect.top - parentRect.top - (parent.clientHeight - elRect.height) / 2;
  parent.scrollTo({ top: parent.scrollTop + offset, behavior: 'smooth' });
}

/**
 * Insert a property into a schema's top-level properties array at the given
 * index (appends when index is null or out of range).
 * @returns {number} the actual insertion index
 */
export function insertPropertyAt(getValue, setValue, schemaIndex, index, property) {
  const path = `schema[${schemaIndex}].properties`;
  const current = getValue(path) || [];
  const next = [...current];
  const insertIndex = index == null || index < 0 || index > next.length ? next.length : index;
  next.splice(insertIndex, 0, property);
  setValue(path, next);
  return insertIndex;
}
