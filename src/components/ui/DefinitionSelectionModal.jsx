import { useState, useEffect } from 'react';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { useDefinition } from '../../hooks/useDefinition';

/**
 * Modal component for selecting definitions with server-side search
 * Uses findDefinitions from the useDefinition hook for on-demand searching
 */
export function DefinitionSelectionModal({ isOpen, onClose, onSelect }) {
  const { findDefinitions } = useDefinition();

  const [definitions, setDefinitions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDefinition, setSelectedDefinition] = useState(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const MAX_RESULTS = 50;

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedDefinition(null);
      setSearch('');
      setDebouncedSearch('');
      setDefinitions([]);
      setError(null);
    }
  }, [isOpen]);

  // Fetch definitions based on search term
  useEffect(() => {
    if (!isOpen || !debouncedSearch) {
      setDefinitions([]);
      return;
    }

    let cancelled = false;

    const performSearch = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const results = await findDefinitions(debouncedSearch, MAX_RESULTS);
        if (!cancelled) {
          setDefinitions(results);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to search definitions');
          setDefinitions([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    performSearch();

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, isOpen, findDefinitions]);

  const handleSelect = () => {
    if (selectedDefinition) {
      onSelect(selectedDefinition);
      onClose();
    }
  };

  const handleCancel = () => {
    setSelectedDefinition(null);
    onClose();
  };

  // Extract owner from customProperties array
  const getOwner = (definition) => {
    if (!definition.customProperties) return null;
    const ownerProp = definition.customProperties.find(p => p.property === 'owner');
    return ownerProp?.value;
  };

  // Truncate description
  const truncateDescription = (text, maxLength = 80) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  return (
    <Dialog open={isOpen} onClose={() => {}} className="relative z-50">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
          <DialogPanel
            transition
            className="relative w-full max-w-2xl h-[600px] flex flex-col transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in data-closed:sm:translate-y-0 data-closed:sm:scale-95"
          >
            {/* Header */}
            <div className="flex-shrink-0 border-b border-gray-200 bg-white px-6 py-4 relative">
              <DialogTitle as="h3" className="text-lg font-semibold text-gray-900 pr-8">
                Find Definition
              </DialogTitle>
              <p className="mt-1 text-sm text-gray-500 pr-8">Select a semantic definition for this property</p>
              {/* Close button */}
              <button
                type="button"
                onClick={handleCancel}
                className="absolute right-4 top-4 rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

          {/* Search */}
          <div className="flex-shrink-0 border-b border-gray-200 bg-white px-6 py-3">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search definitions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
                className="block w-full rounded-md border-0 py-2 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
            {/* Results count */}
            {!isLoading && definitions.length > 0 && (
              <div className="mt-2 text-xs text-gray-500">
                Found {definitions.length} definition{definitions.length !== 1 ? 's' : ''} matching "{debouncedSearch}"
                {definitions.length >= MAX_RESULTS && ` (limited to ${MAX_RESULTS} results)`}
              </div>
            )}
            {/* Search prompt */}
            {!isLoading && !error && !debouncedSearch && (
              <div className="mt-2 text-xs text-gray-500">
                Enter a search term to find definitions
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto bg-white px-6 py-4">
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-indigo-600"></div>
                <span className="ml-3 text-sm text-gray-600">Searching definitions...</span>
              </div>
            )}

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {!isLoading && !error && !debouncedSearch && (
              <div className="py-8 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <p className="mt-2 text-sm text-gray-500">
                  Enter a search term to find definitions
                </p>
              </div>
            )}

            {!isLoading && !error && debouncedSearch && definitions.length === 0 && (
              <div className="py-8 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                </svg>
                <p className="mt-2 text-sm text-gray-500">
                  No definitions found matching "{debouncedSearch}"
                </p>
              </div>
            )}

            {!isLoading && !error && definitions.length > 0 && (
              <div className="space-y-2 pr-2">
                  {definitions.map((definition, index) => {
                    const owner = getOwner(definition);
                    const isSelected = selectedDefinition?.url === definition.url;
                    return (
                      <button
                        type="button"
                        key={definition.url || definition.name || index}
                        onClick={() => setSelectedDefinition(definition)}
                        className={`w-full rounded-md px-4 py-3 text-left transition-colors ${
                          isSelected
                            ? 'bg-indigo-50 ring-2 ring-indigo-600'
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        {/* Row 1: name and logicalType */}
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900 text-sm">{definition.name}</span>
                          {definition.logicalType && (
                            <span className="text-xs text-gray-500 font-mono">{definition.logicalType}</span>
                          )}
                        </div>

                        {/* Row 2: businessName and owner */}
                        <div className="flex items-center justify-between mt-0.5">
                          {definition.businessName && (
                            <span className="text-sm text-gray-700">{definition.businessName}</span>
                          )}
                          {owner && (
                            <span className="text-xs text-gray-500">Owner: {owner}</span>
                          )}
                        </div>

                        {/* Row 3: description */}
                        {definition.description && (
                          <p className="text-xs text-gray-500 mt-1">
                            {truncateDescription(definition.description)}
                          </p>
                        )}

                        {/* Row 4: tags */}
                        {definition.tags && definition.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {definition.tags.map((tag, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </button>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSelect}
              disabled={!selectedDefinition}
              className="rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Select
            </button>
          </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
