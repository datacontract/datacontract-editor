import { useMemo } from 'react';
import { useEditorStore } from '../store.js';
import { hasSchemaProperty } from '../lib/schemaEnumExtractor.js';
import {
  defaultOdcsVersion,
  getSchemaAcceptedApiVersions,
  getSchemaApiVersion,
  odcsVersionEntryFor,
} from '../services/schemaRegistry.js';
import { compareApiVersions } from '../lib/apiVersion.js';

/**
 * The ODCS versions on offer and the one new documents get: from the host's `odcsVersions` list,
 * or, for a legacy single schema, what that schema accepts and declares as its default.
 */
export function useOdcsVersions() {
  const odcsVersions = useEditorStore((state) => state.odcsVersions);
  const schemaData = useEditorStore((state) => state.schemaData);
  return useMemo(() => {
    const listed = (odcsVersions || []).map((entry) => entry.version).filter(Boolean);
    return {
      versions: listed.length > 0 ? listed : getSchemaAcceptedApiVersions(schemaData),
      defaultVersion: defaultOdcsVersion(odcsVersions, schemaData),
    };
  }, [odcsVersions, schemaData]);
}

/**
 * Whether the loaded schema describes what the document's own `apiVersion` offers.
 *
 * With the host listing versions, the schema loaded is the one of the document's version, so the
 * answer is yes whenever the version is listed. Otherwise (a version the host does not list, or a
 * legacy single schema) the document is checked against the loaded schema's version: fields the
 * newer standard added must not be offered to an older document, or it would silently use
 * constructs its declared version does not have. A document without an `apiVersion` counts as
 * current (new contracts get the default version from the template).
 */
export function useDocumentSupportsSchemaVersion() {
  const odcsVersions = useEditorStore((state) => state.odcsVersions);
  const schemaData = useEditorStore((state) => state.schemaData);
  const documentApiVersion = useEditorStore((state) => {
    const value = state.getValue('apiVersion');
    return typeof value === 'string' && value.trim() ? value.trim() : null;
  });
  return useMemo(() => {
    if (!documentApiVersion) return true;
    const own = odcsVersionEntryFor(odcsVersions, documentApiVersion);
    if (own.version && compareApiVersions(own.version, documentApiVersion) === 0) return true;
    const schemaApiVersion = getSchemaApiVersion(schemaData);
    if (!schemaApiVersion) return true;
    return compareApiVersions(documentApiVersion, schemaApiVersion) >= 0;
  }, [odcsVersions, schemaData, documentApiVersion]);
}

/**
 * Whether the active schema defines a property, regardless of the document's `apiVersion`.
 * Use this when the UI should acknowledge a field exists but lock it (e.g. a disabled sidebar
 * entry pointing at the upgrade badge); use [useSchemaProperty] to decide whether to offer it.
 */
export function useSchemaDefinesProperty(propertyPath, context = 'property') {
  const schemaData = useEditorStore((state) => state.schemaData);
  return useMemo(
    () => hasSchemaProperty(schemaData, propertyPath, context),
    [schemaData, propertyPath, context],
  );
}

/**
 * Whether the editor should offer a field: the active JSON schema defines it AND the document's
 * declared `apiVersion` supports the schema's version. A field introduced in ODCS 3.2.0
 * (e.g. `semanticType`) appears for a `v3.2.0` document under a 3.2.x schema, and stays hidden
 * both under a 3.1.0 schema and for a document that still declares `v3.1.0`. Host customizations
 * that hide fields are respected implicitly, because they operate on the same loaded schema.
 *
 * @param {string} propertyPath - Dot-notation path, e.g. 'semanticType' or 'context'
 * @param {string} [context='property'] - 'property', 'schema', 'server', 'root', or a $defs name
 * @returns {boolean}
 */
export function useSchemaProperty(propertyPath, context = 'property') {
  const schemaData = useEditorStore((state) => state.schemaData);
  const documentSupportsSchema = useDocumentSupportsSchemaVersion();
  return useMemo(
    () => documentSupportsSchema && hasSchemaProperty(schemaData, propertyPath, context),
    [schemaData, propertyPath, context, documentSupportsSchema],
  );
}
