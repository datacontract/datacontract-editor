import { isBeforeApiVersion } from './apiVersion.js';
import { isFullyQualifiedReference, resolveReferencePath } from './relationshipReferences.js';

const SHORTHAND_PATTERN = /^[A-Za-z_][A-Za-z0-9_-]*(\.[A-Za-z_][A-Za-z0-9_-]*)+$/;

const isSamePath = (a, b) => a !== null && b !== null && a.join('.') === b.join('.');

/** The schema and the properties on the way to [path], or null when one is missing. */
const elementsAt = (schemas, path) => {
  const elements = [];
  let siblings = schemas;
  for (const index of path) {
    const element = siblings?.[index];
    if (element == null) return null;
    elements.push({ element, siblings });
    siblings = element.properties;
  }
  return elements;
};

const shorthandOf = (elements) => {
  const names = elements.map(({ element }) => String(element.name ?? ''));
  return names.every(Boolean) ? names.join('.') : null;
};

const isAmbiguous = (elements) =>
  elements.some(({ element, siblings }) => siblings.some((s) => s != null && s !== element && s.name === element.name));

/**
 * Returns [after], which is [before] with other names, with every reference kept on its target: by
 * shorthand if ODCS allows it and it is unambiguous, else by (generated) ids, which SLA elements lack.
 */
export const keepReferenceTargets = (before, after) => {
  if (!Array.isArray(before?.schema) || !Array.isArray(after?.schema)) return after;
  const result = JSON.parse(JSON.stringify(after));
  const { schema: schemas, apiVersion } = result;

  const pathsBefore = new Map();
  const changedTarget = (reference) => {
    if (typeof reference !== 'string') return null;
    if (!pathsBefore.has(reference)) pathsBefore.set(reference, resolveReferencePath(reference, before.schema));
    const path = pathsBefore.get(reference);
    if (path === null) return null;
    const elements = elementsAt(schemas, path);
    if (elements === null) return null;
    const becameAmbiguous = !isFullyQualifiedReference(reference)
      && isAmbiguous(elements) && !isAmbiguous(elementsAt(before.schema, path));
    if (!becameAmbiguous && isSamePath(path, resolveReferencePath(reference, schemas))) return null;
    return { path, elements };
  };

  const keepRelationshipTarget = (reference) => {
    const target = changedTarget(reference);
    if (!target) return reference;
    const shorthand = shorthandOf(target.elements);
    const isUnambiguous = shorthand !== null && !isAmbiguous(target.elements)
      && isSamePath(target.path, resolveReferencePath(shorthand, schemas));
    // ids arrived in 3.1.0
    if (isBeforeApiVersion(apiVersion, 'v3.1.0')) return isUnambiguous ? shorthand : reference;
    if (isUnambiguous && SHORTHAND_PATTERN.test(shorthand)) return shorthand;

    const elementsBefore = elementsAt(before.schema, target.path);
    const ids = target.elements.map(({ element, siblings }, depth) => {
      if (element.id) return element.id;
      const name = String(element.name || elementsBefore[depth].element.name || '');
      const base = name.replace(/[^A-Za-z0-9_-]+/g, '_').replace(/^_+|_+$/g, '') || 'element';
      // A name is taken too, as a fully qualified reference falls back to names.
      const taken = new Set(siblings.filter((s) => s != null && s !== element).flatMap((s) => [s.id, s.name]));
      element.id = base;
      for (let n = 2; taken.has(element.id); n++) element.id = `${base}_${n}`;
      return element.id;
    });
    const byId = ['schema', ids[0], ...ids.slice(1).flatMap((id) => ['properties', id])].join('/');
    // a contract's own ids can be duplicates or invalid
    return isSamePath(target.path, resolveReferencePath(byId, schemas)) ? byId : reference;
  };

  const visit = (element) => {
    if (element == null || typeof element !== 'object') return;
    if (Array.isArray(element.relationships)) {
      element.relationships.forEach((relationship) => {
        ['from', 'to'].forEach((end) => {
          const value = relationship?.[end];
          if (Array.isArray(value)) relationship[end] = value.map(keepRelationshipTarget);
          else if (typeof value === 'string') relationship[end] = keepRelationshipTarget(value);
        });
      });
    }
    if (Array.isArray(element.properties)) element.properties.forEach(visit);
    [element.items, element.map?.key, element.map?.value].forEach(visit);
  };
  schemas.forEach(visit);

  const keepSlaTargets = (elements) => elements.split(',').map((entry) => {
    const name = entry.trim();
    const target = isFullyQualifiedReference(name) ? null : changedTarget(name);
    const shorthand = target && shorthandOf(target.elements);
    return shorthand ? entry.replace(name, () => shorthand) : entry;
  }).join(',');
  if (typeof result.slaDefaultElement === 'string') result.slaDefaultElement = keepSlaTargets(result.slaDefaultElement);
  if (Array.isArray(result.slaProperties)) {
    result.slaProperties.forEach((sla) => {
      if (typeof sla?.element === 'string') sla.element = keepSlaTargets(sla.element);
    });
  }
  return result;
};
