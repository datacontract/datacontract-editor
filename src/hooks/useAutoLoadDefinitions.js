import { useEffect } from 'react';
import { useEditorStore } from '../store';

/**
 * Hook to automatically load definitions when the editor initializes
 * and semantics is enabled
 */
export const useAutoLoadDefinitions = () => {
  const editorConfig = useEditorStore((state) => state.editorConfig);
  const definitionsMap = useEditorStore((state) => state.definitionsMap);
  const isLoadingDefinitions = useEditorStore((state) => state.isLoadingDefinitions);
  const fetchAllDefinitions = useEditorStore((state) => state.fetchAllDefinitions);

  useEffect(() => {
    const isSemanticsEnabled = editorConfig?.semantics?.enabled;
    const hasOrg = !!editorConfig?.semantics?.organizationVanityUrl;
    const alreadyLoaded = definitionsMap && definitionsMap.size > 0;

    // Only fetch if semantics is enabled, org is configured, not already loaded, and not currently loading
    if (isSemanticsEnabled && hasOrg && !alreadyLoaded && !isLoadingDefinitions) {
      console.log('Auto-loading definitions on editor initialization...');
      fetchAllDefinitions();
    }
  }, [editorConfig?.semantics?.enabled, editorConfig?.semantics?.organizationVanityUrl, definitionsMap, isLoadingDefinitions, fetchAllDefinitions]);
};
