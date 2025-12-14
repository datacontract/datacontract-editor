import { useEditorStore } from '../store';

/**
 * Hook to get the active server type from the first server in the data contract
 * @returns {string|null} The server type (e.g., 'postgres', 'snowflake') or null if no servers
 */
export function useActiveServerType() {
  const servers = useEditorStore((state) => state.getValue('servers'));
  return servers?.[0]?.type || null;
}
