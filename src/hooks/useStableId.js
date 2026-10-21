import { useMemo } from 'react';
import { useEditorStore } from '../store.js';
import { getSchemaPropertyInfo } from '../lib/schemaEnumExtractor.js';
import { useStandardPropertyOverride } from './useCustomization.js';

/**
 * The schema's description and pattern for the stable `id` of [definition], or null when the
 * loaded ODCS version has no such id (ids arrived in 3.1, more objects gained one in 3.2).
 * [definition] is an ODCS `$defs` name or an editor context ('schema', 'property', 'server').
 */
export function useStableIdInfo(definition, path = 'id') {
  const schemaData = useEditorStore((state) => state.schemaData);
  return useMemo(() => getSchemaPropertyInfo(schemaData, path, definition), [schemaData, path, definition]);
}

/** Whether the stable id field shows: the loaded schema defines it and no customization hides it. */
export function useIsStableIdShown(definition, customizationLevel, path = 'id') {
  const info = useStableIdInfo(definition, path);
  const override = useStandardPropertyOverride(customizationLevel, 'id');
  return !!info && override?.hidden !== true;
}
