import { useEffect, useMemo, useState } from 'react';
import { useDefinition } from './useDefinition.js';
import { isSemanticAuthDef } from '../utils/authDefTypes.js';
import { toAbsoluteUrl } from '../lib/urlUtils.js';

/**
 * Resolve the semantic (or fallback `definition`) entry from an
 * `authoritativeDefinitions` array and fetch its values, returning the
 * inherited fields plus a small helper for the inheritance-styling pattern
 * already used in PropertyDetailsPanel.
 *
 * Wraps the same fetch logic so multiple surfaces (PropertyDetailsPanel,
 * SchemaEditor schema-level, PropertyRow row-level) can share a single
 * implementation and the blue "inherited from definition" affordance.
 *
 * @param {Array} authoritativeDefinitions - typically `entity.authoritativeDefinitions`
 * @returns {{
 *   definitionData: object | null,   // the fetched definition's fields, or null
 *   isFetching: boolean,
 *   isInherited: (entity: object, field: string) => boolean
 * }}
 */
export function useInheritedDefinition(authoritativeDefinitions) {
  const { getDefinition } = useDefinition();
  const [definitionData, setDefinitionData] = useState(null);
  const [isFetching, setIsFetching] = useState(false);

  const semanticDefinition = useMemo(() => {
    return (
      authoritativeDefinitions?.find((d) => isSemanticAuthDef(d)) ||
      authoritativeDefinitions?.find((d) => d.type === 'definition')
    );
  }, [authoritativeDefinitions]);

  const absoluteUrl = useMemo(
    () => (semanticDefinition?.url ? toAbsoluteUrl(semanticDefinition.url) : null),
    [semanticDefinition?.url]
  );

  useEffect(() => {
    if (!absoluteUrl) {
      setDefinitionData(null);
      return;
    }
    // getDefinition resolves external/IRI references via the backend when configured,
    // and returns null for references it cannot resolve — no need to gate on host here.
    let cancelled = false;
    setIsFetching(true);
    getDefinition(absoluteUrl)
      .then((data) => {
        if (!cancelled) setDefinitionData(data || null);
      })
      .catch(() => {
        if (!cancelled) setDefinitionData(null);
      })
      .finally(() => {
        if (!cancelled) setIsFetching(false);
      });
    return () => {
      cancelled = true;
    };
  }, [absoluteUrl, getDefinition]);

  // A field is "inherited" when the definition has it but the entity doesn't.
  const isInherited = (entity, field) =>
    !!definitionData?.[field] && !entity?.[field];

  return { definitionData, isFetching, isInherited };
}
