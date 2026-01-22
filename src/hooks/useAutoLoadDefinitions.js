import { useEffect, useRef } from 'react';
import { useEditorStore } from '../store';

/**
 * Hook to automatically load definitions when the editor initializes
 * and semantics is enabled. Reloads definitions on every page refresh.
 */
export const useAutoLoadDefinitions = () => {
  const editorConfig = useEditorStore((state) => state.editorConfig);
  const isLoadingDefinitions = useEditorStore((state) => state.isLoadingDefinitions);
  const fetchAllDefinitions = useEditorStore((state) => state.fetchAllDefinitions);

  // Track if we've loaded definitions in this session
  const hasLoadedInSession = useRef(false);

  useEffect(() => {
    const isSemanticsEnabled = editorConfig?.semantics?.enabled;
    const hasOrg = !!editorConfig?.semantics?.organizationVanityUrl;

    // Fetch if semantics is enabled, org is configured, not already loaded in this session, and not currently loading
    if (isSemanticsEnabled && hasOrg && !hasLoadedInSession.current && !isLoadingDefinitions) {
      console.log('Auto-loading definitions on editor initialization...');
      hasLoadedInSession.current = true;
      fetchAllDefinitions();
    }
  }, [editorConfig?.semantics?.enabled, editorConfig?.semantics?.organizationVanityUrl, isLoadingDefinitions, fetchAllDefinitions]);
};
