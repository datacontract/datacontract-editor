import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchAssetServers } from '../../lib/serverAssetsApi.js';

// Keystrokes arrive faster than the host answers; wait for a pause before asking.
const SEARCH_DELAY_MS = 250;

/**
 * Typeahead over the servers available through the host's asset catalog: one
 * suggestion per schema, dataset or database, searched as the user types. It
 * searches all server types: it sits next to the server name, above the type
 * field, so picking a suggestion is how the type usually gets set. It is a
 * search overlay shown on demand (the button next to the server name),
 * positioned against the nearest relative ancestor: it focuses itself when
 * mounted, and calls `onClose` after a pick, on Escape and on a click outside
 * of it. Picking a suggestion hands its server (type, location fields) to
 * `onSelect`.
 */
export default function AssetServerTypeahead({ url, onSelect, onClose }) {
  const { t } = useTranslation();
  const containerRef = useRef(null);
  const [query, setQuery] = useState('');
  // key: the search the suggestions belong to, so stale responses are recognizable
  const [result, setResult] = useState({ key: null, status: 'idle', suggestions: [] });

  const searchKey = query.trim();

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const suggestions = await fetchAssetServers(url, { query: searchKey }, controller.signal);
        setResult({ key: searchKey, status: 'ready', suggestions });
      } catch (error) {
        if (error.name === 'AbortError') return;
        console.error('Error fetching asset servers:', error);
        setResult({ key: searchKey, status: 'error', suggestions: [] });
      }
    }, SEARCH_DELAY_MS);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [url, searchKey]);

  // A click outside the panel closes it.
  useEffect(() => {
    const handlePointerDown = (event) => {
      // The toggle button closes it by itself; closing here too would reopen it on the click.
      if (event.target.closest?.('[data-asset-typeahead-toggle]')) return;
      if (containerRef.current && !containerRef.current.contains(event.target)) onClose();
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [onClose]);

  const isLoading = result.key !== searchKey;

  const handleSelect = (suggestion) => {
    if (!suggestion) return;
    onSelect(suggestion);
    onClose();
  };

  return (
    // A floating panel under the server name: it covers the form instead of pushing fields down.
    <div
      ref={containerRef}
      className="absolute left-0 top-full z-30 mt-1 w-[28rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-lg bg-white shadow-xl ring-1 ring-black/10"
    >
      <Combobox value={null} onChange={handleSelect}>
        <div className="relative border-b border-gray-100">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <svg className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
            </svg>
          </div>
          <ComboboxInput
            autoFocus
            aria-label={t('server.fromAssets.label')}
            className="block w-full border-0 bg-transparent py-2.5 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0"
            placeholder={t('server.fromAssets.placeholder')}
            displayValue={() => query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => { if (event.key === 'Escape') onClose(); }}
            autoComplete="off"
          />
        </div>
        {/* static: the panel's own lifecycle opens and closes the list */}
        <ComboboxOptions static className="max-h-72 overflow-auto py-1 text-xs leading-4">
          {isLoading && <div className="px-3 py-2 text-gray-500">{t('server.fromAssets.loading')}</div>}
          {!isLoading && result.status === 'error' && <div className="px-3 py-2 text-gray-500">{t('server.fromAssets.error')}</div>}
          {!isLoading && result.status === 'ready' && result.suggestions.length === 0 && (
            <div className="px-3 py-2 text-gray-500">{t('server.fromAssets.empty')}</div>
          )}
          {!isLoading && result.suggestions.map((suggestion) => (
            <ComboboxOption
              key={suggestion.assetExternalId}
              value={suggestion}
              className="group flex cursor-default items-center gap-2 px-3 py-2 text-gray-900 select-none data-focus:bg-indigo-600 data-focus:text-white"
            >
              {suggestion.iconUrl && <img src={suggestion.iconUrl} alt="" className="size-4 flex-shrink-0" />}
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{suggestion.name}</span>
                <span className="block truncate text-gray-500 group-data-focus:text-indigo-100">
                  {describeLocation(suggestion.server)}
                </span>
              </span>
            </ComboboxOption>
          ))}
        </ComboboxOptions>
      </Combobox>
    </div>
  );
}

const LOCATION_FIELDS = ['account', 'host', 'project', 'catalog', 'database', 'dataset', 'schema'];

/** "snowflake · acme · SHOP · SALES": the type and the location fields the server sets. */
function describeLocation(server) {
  return [server?.type, ...LOCATION_FIELDS.map((field) => server?.[field])].filter(Boolean).join(' · ');
}
