import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { useDefinition } from '../../hooks/useDefinition';

const MAX_SEARCH_RESULTS = 15;

/**
 * Modal for selecting definitions — supports both:
 * - Semantic ontology tree browser (semantics config)
 * - Business definitions search (definitions config)
 * Shows a source selector when both are available.
 */
export function DefinitionSelectionModal({ isOpen, onClose, onSelect }) {
  const { getSemanticTree, findDefinitions, hasSemanticsConfig, hasDefinitionsConfig } = useDefinition();

  const hasBoth = hasSemanticsConfig && hasDefinitionsConfig;
  const defaultSource = hasSemanticsConfig ? 'semantics' : 'definitions';

  const [source, setSource] = useState(defaultSource);
  const [selectedDefinition, setSelectedDefinition] = useState(null);

  // Semantics state
  const [tree, setTree] = useState([]);
  const [isLoadingTree, setIsLoadingTree] = useState(false);
  const [treeLoaded, setTreeLoaded] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [treeFilter, setTreeFilter] = useState('');

  // Definitions state
  const [definitions, setDefinitions] = useState([]);
  const [isLoadingDefs, setIsLoadingDefs] = useState(false);
  const [defSearch, setDefSearch] = useState('');
  const [debouncedDefSearch, setDebouncedDefSearch] = useState('');
  const [defError, setDefError] = useState(null);

  // Debounce definition search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedDefSearch(defSearch), 300);
    return () => clearTimeout(timer);
  }, [defSearch]);

  // Reset on open
  useEffect(() => {
    if (!isOpen) return;
    setSelectedDefinition(null);
    setSelectedExternalId(null);
    setSource(defaultSource);
    setExpandedNodes(new Set());
    setTreeFilter('');
    setTree([]);
    setTreeLoaded(false);
    setDefinitions([]);
    setDefSearch('');
    setDebouncedDefSearch('');
    setDefError(null);
  }, [isOpen, defaultSource]);

  // Load semantic tree
  useEffect(() => {
    if (!isOpen || source !== 'semantics' || treeLoaded) return;

    let cancelled = false;
    const load = async () => {
      setIsLoadingTree(true);
      try {
        const data = await getSemanticTree();
        if (!cancelled) {
          setTree(data);
          // Auto-switch to definitions if semantics tree is empty and definitions are available
          if (data.length === 0 && hasDefinitionsConfig) {
            setSource('definitions');
          }
        }
      } catch {
        if (!cancelled) {
          setTree([]);
          if (hasDefinitionsConfig) setSource('definitions');
        }
      } finally {
        if (!cancelled) { setIsLoadingTree(false); setTreeLoaded(true); }
      }
    };
    load();
    return () => { cancelled = true; };
  }, [isOpen, source, treeLoaded, getSemanticTree, hasDefinitionsConfig]);

  // Search definitions
  useEffect(() => {
    if (!isOpen || source !== 'definitions') return;
    if (!debouncedDefSearch) { setDefinitions([]); return; }

    let cancelled = false;
    const search = async () => {
      setIsLoadingDefs(true);
      setDefError(null);
      try {
        const results = await findDefinitions(debouncedDefSearch, MAX_SEARCH_RESULTS);
        if (!cancelled) setDefinitions(results);
      } catch (err) {
        if (!cancelled) { setDefError(err.message || 'Search failed'); setDefinitions([]); }
      } finally {
        if (!cancelled) setIsLoadingDefs(false);
      }
    };
    search();
    return () => { cancelled = true; };
  }, [isOpen, source, debouncedDefSearch, findDefinitions]);

  const handleSelect = () => {
    if (selectedDefinition) { onSelect(selectedDefinition); onClose(); }
  };

  // Tree helpers
  const toggleNode = useCallback((id) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const nodeToDefinition = useCallback((node) => ({
    name: node.externalId,
    url: node.url,
    businessName: node.businessName || node.name,
    logicalType: node.logicalType,
    description: node.description,
    tags: node.tags,
    customProperties: [
      { property: 'elementType', value: node.elementType },
      ...(node.owner ? [{ property: 'owner', value: node.owner }] : []),
    ],
  }), []);

  // Track selected externalId separately for tree highlighting (URLs may not be unique across elements)
  const [selectedExternalId, setSelectedExternalId] = useState(null);

  const selectTreeNode = useCallback((node) => {
    if (node.elementType === 'namespace' || node.elementType === 'group') return;
    setSelectedDefinition(nodeToDefinition(node));
    setSelectedExternalId(node.externalId);
  }, [nodeToDefinition]);

  // Filter tree
  const filterTree = useCallback((nodes, q) => {
    if (!q) return nodes;
    const lower = q.toLowerCase();
    return nodes.reduce((acc, node) => {
      const match = node.name?.toLowerCase().includes(lower)
        || node.externalId?.toLowerCase().includes(lower)
        || node.description?.toLowerCase().includes(lower);
      const filteredChildren = node.children ? filterTree(node.children, q) : [];
      if (match || filteredChildren.length > 0) {
        acc.push({ ...node, children: filteredChildren.length > 0 ? filteredChildren : node.children });
      }
      return acc;
    }, []);
  }, []);

  const filteredTree = treeFilter ? filterTree(tree, treeFilter) : tree;

  // Auto-expand on filter
  useEffect(() => {
    if (!treeFilter) return;
    const toExpand = new Set();
    const collect = (nodes) => nodes.forEach(n => {
      if (n.children?.length) { toExpand.add(n.externalId); collect(n.children); }
    });
    collect(filteredTree);
    setExpandedNodes(toExpand);
  }, [treeFilter, filteredTree]);

  const countElements = (nodes) => {
    let concepts = 0, properties = 0;
    const walk = (n) => n.forEach(node => {
      if (node.elementType === 'entity') concepts++;
      else if (node.elementType !== 'namespace') properties++;
      if (node.children) walk(node.children);
    });
    walk(nodes);
    return { concepts, properties };
  };
  const stats = countElements(tree);

  return (
    <Dialog open={isOpen} onClose={() => {}} className="relative z-50">
      <DialogBackdrop transition className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in" />
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
          <DialogPanel transition className="relative w-full max-w-2xl h-[600px] flex flex-col transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in data-closed:sm:translate-y-0 data-closed:sm:scale-95">

            {/* Header */}
            <div className="flex-shrink-0 border-b border-gray-200 bg-white px-6 py-4 relative">
              <DialogTitle as="h3" className="text-lg font-semibold text-gray-900 pr-8">Find Definition</DialogTitle>
              <p className="mt-1 text-sm text-gray-500 pr-8">
                {source === 'semantics' ? 'Browse semantic definitions' : 'Search business definitions'}
              </p>
              <button type="button" onClick={onClose} className="absolute right-4 top-4 rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Source selector — only when both configs are available */}
            {hasBoth && (
              <div className="flex-shrink-0 border-b border-gray-200 bg-white px-6">
                <nav className="-mb-px flex gap-6" aria-label="Source">
                  <button type="button" onClick={() => { setSource('semantics'); setSelectedDefinition(null); setSelectedExternalId(null); }}
                    className={`whitespace-nowrap border-b-2 py-3 text-sm font-medium ${source === 'semantics' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}>
                    Semantics
                  </button>
                  <button type="button" onClick={() => { setSource('definitions'); setSelectedDefinition(null); setSelectedExternalId(null); }}
                    className={`whitespace-nowrap border-b-2 py-3 text-sm font-medium ${source === 'definitions' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}>
                    Definitions
                  </button>
                </nav>
              </div>
            )}

            {/* ── Semantics: tree browser ── */}
            {source === 'semantics' && (
              <>
                <div className="flex-shrink-0 border-b border-gray-200 bg-white px-6 py-3">
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <input type="text" placeholder="Search..." value={treeFilter} onChange={(e) => setTreeFilter(e.target.value)} autoFocus
                      className="block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
                  </div>
                  {!isLoadingTree && tree.length > 0 && (
                    <div className="mt-2 text-xs text-gray-500">
                      {stats.concepts} concept{stats.concepts !== 1 ? 's' : ''}, {stats.properties} propert{stats.properties !== 1 ? 'ies' : 'y'}
                    </div>
                  )}
                </div>
                <div className="flex-1 overflow-y-auto bg-white">
                  {isLoadingTree && <LoadingSpinner text="Loading ontology..." />}
                  {!isLoadingTree && filteredTree.length === 0 && (
                    <EmptyState text={treeFilter ? 'No matching elements' : 'No semantic elements yet'} />
                  )}
                  {!isLoadingTree && filteredTree.length > 0 && (
                    <div className="px-4 py-2">
                      {filteredTree.map((node) => (
                        <TreeNode key={node.externalId} node={node} expandedNodes={expandedNodes} toggleNode={toggleNode}
                          selectedExternalId={selectedExternalId} onSelect={selectTreeNode} depth={0} />
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ── Definitions: search ── */}
            {source === 'definitions' && (
              <>
                <div className="flex-shrink-0 border-b border-gray-200 bg-white px-6 py-3">
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <input type="text" placeholder="Search definitions..." value={defSearch}
                      onChange={(e) => setDefSearch(e.target.value)} autoFocus
                      className="block w-full rounded-md border-0 py-2 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
                  </div>
                  {!isLoadingDefs && definitions.length > 0 && (
                    <div className="mt-2 text-xs text-gray-500">
                      Found {definitions.length} definition{definitions.length !== 1 ? 's' : ''} matching &quot;{debouncedDefSearch}&quot;
                      {definitions.length >= MAX_SEARCH_RESULTS && ` (limited to ${MAX_SEARCH_RESULTS} results)`}
                    </div>
                  )}
                  {!isLoadingDefs && !defError && !debouncedDefSearch && (
                    <div className="mt-2 text-xs text-gray-500">Enter a search term to find definitions</div>
                  )}
                </div>
                <div className="flex-1 overflow-y-auto bg-white px-6 py-4">
                  {isLoadingDefs && <LoadingSpinner text="Searching definitions..." />}
                  {defError && <ErrorMessage message={defError} />}
                  {!isLoadingDefs && !defError && !debouncedDefSearch && (
                    <EmptyState text="Enter a search term to find definitions" />
                  )}
                  {!isLoadingDefs && !defError && debouncedDefSearch && definitions.length === 0 && (
                    <EmptyState text={`No definitions found matching "${debouncedDefSearch}"`} />
                  )}
                  {!isLoadingDefs && !defError && definitions.length > 0 && (
                    <div className="space-y-2 pr-2">
                      {definitions.map((definition, index) => (
                        <DefinitionCard key={definition.url || definition.name || index} definition={definition}
                          isSelected={selectedDefinition?.url === definition.url}
                          onClick={() => setSelectedDefinition(definition)} />
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Footer */}
            <div className="flex-shrink-0 bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
              <button type="button" onClick={onClose}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
                Cancel
              </button>
              <button type="button" onClick={handleSelect} disabled={!selectedDefinition}
                className="rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed">
                Select
              </button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}

/* ── Sub-components ── */

function ElementIcon({ elementType }) {
  switch (elementType) {
    case 'namespace':
      return (<svg className="size-5 text-gray-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path d="M3.75 3A1.75 1.75 0 0 0 2 4.75v3.26a3.235 3.235 0 0 1 1.75-.51h12.5c.644 0 1.245.188 1.75.51V6.75A1.75 1.75 0 0 0 16.25 5h-4.836a.25.25 0 0 1-.177-.073L9.823 3.513A1.75 1.75 0 0 0 8.586 3H3.75ZM3.75 9A1.75 1.75 0 0 0 2 10.75v4.5c0 .966.784 1.75 1.75 1.75h12.5A1.75 1.75 0 0 0 18 15.25v-4.5A1.75 1.75 0 0 0 16.25 9H3.75Z"/></svg>);
    case 'group':
      return (<svg className="size-5 text-amber-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.25 2A2.25 2.25 0 0 0 2 4.25v2.5A2.25 2.25 0 0 0 4.25 9h2.5A2.25 2.25 0 0 0 9 6.75v-2.5A2.25 2.25 0 0 0 6.75 2h-2.5Zm0 9A2.25 2.25 0 0 0 2 13.25v2.5A2.25 2.25 0 0 0 4.25 18h2.5A2.25 2.25 0 0 0 9 15.75v-2.5A2.25 2.25 0 0 0 6.75 11h-2.5Zm9-9A2.25 2.25 0 0 0 11 4.25v2.5A2.25 2.25 0 0 0 13.25 9h2.5A2.25 2.25 0 0 0 18 6.75v-2.5A2.25 2.25 0 0 0 15.75 2h-2.5Zm0 9A2.25 2.25 0 0 0 11 13.25v2.5A2.25 2.25 0 0 0 13.25 18h2.5A2.25 2.25 0 0 0 18 15.75v-2.5A2.25 2.25 0 0 0 15.75 11h-2.5Z" clipRule="evenodd"/></svg>);
    case 'entity':
      return (<svg className="size-5 text-blue-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path d="M10.362 1.093a.75.75 0 0 0-.724 0L2.523 5.018 10 9.143l7.477-4.125-7.115-3.925ZM18 6.443l-7.25 4v8.25l6.888-3.8A.75.75 0 0 0 18 14.25V6.443ZM9.25 18.693v-8.25l-7.25-4v7.807a.75.75 0 0 0 .362.643l6.888 3.8Z"/></svg>);
    case 'property':
    case 'shared_property':
      return (<svg className="size-5 text-green-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.5 2A2.5 2.5 0 0 0 2 4.5v3.879a2.5 2.5 0 0 0 .732 1.767l7.5 7.5a2.5 2.5 0 0 0 3.536 0l3.878-3.878a2.5 2.5 0 0 0 0-3.536l-7.5-7.5A2.5 2.5 0 0 0 8.38 2H4.5ZM5 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd"/></svg>);
    case 'metric':
      return (<svg className="size-5 text-red-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path d="M15.5 2A1.5 1.5 0 0 0 14 3.5v13a1.5 1.5 0 0 0 1.5 1.5h1a1.5 1.5 0 0 0 1.5-1.5v-13A1.5 1.5 0 0 0 16.5 2h-1ZM9.5 6A1.5 1.5 0 0 0 8 7.5v9A1.5 1.5 0 0 0 9.5 18h1a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 10.5 6h-1ZM3.5 10A1.5 1.5 0 0 0 2 11.5v5A1.5 1.5 0 0 0 3.5 18h1A1.5 1.5 0 0 0 6 16.5v-5A1.5 1.5 0 0 0 4.5 10h-1Z"/></svg>);
    default:
      return (<svg className="size-5 text-amber-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.25 2A2.25 2.25 0 0 0 2 4.25v2.5A2.25 2.25 0 0 0 4.25 9h2.5A2.25 2.25 0 0 0 9 6.75v-2.5A2.25 2.25 0 0 0 6.75 2h-2.5Zm0 9A2.25 2.25 0 0 0 2 13.25v2.5A2.25 2.25 0 0 0 4.25 18h2.5A2.25 2.25 0 0 0 9 15.75v-2.5A2.25 2.25 0 0 0 6.75 11h-2.5Zm9-9A2.25 2.25 0 0 0 11 4.25v2.5A2.25 2.25 0 0 0 13.25 9h2.5A2.25 2.25 0 0 0 18 6.75v-2.5A2.25 2.25 0 0 0 15.75 2h-2.5Zm0 9A2.25 2.25 0 0 0 11 13.25v2.5A2.25 2.25 0 0 0 13.25 18h2.5A2.25 2.25 0 0 0 18 15.75v-2.5A2.25 2.25 0 0 0 15.75 11h-2.5Z" clipRule="evenodd"/></svg>);
  }
}

function TreeNode({ node, expandedNodes, toggleNode, selectedExternalId, onSelect, depth }) {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedNodes.has(node.externalId);
  const isSelectable = node.elementType !== 'namespace' && node.elementType !== 'group';
  const isSelected = isSelectable && selectedExternalId === node.externalId;
  const isParent = node.elementType === 'entity' || node.elementType === 'namespace' || node.elementType === 'group';

  return (
    <div>
      <div
        className={`flex items-center w-full py-2 rounded-md min-w-0 ${isSelected ? 'bg-indigo-50 ring-2 ring-indigo-600' : isSelectable ? 'hover:bg-gray-50 cursor-pointer' : 'hover:bg-gray-50'}`}
        style={{ paddingLeft: `${depth * 24 + 4}px` }}
        onClick={() => { if (isParent && hasChildren) toggleNode(node.externalId); if (isSelectable) onSelect(node); }}>
        {isParent && hasChildren ? (
          <button type="button" onClick={(e) => { e.stopPropagation(); toggleNode(node.externalId); }} className="w-5 flex-shrink-0 flex items-center justify-center">
            <svg className={`size-4 text-gray-400 transition-transform ${isExpanded ? '' : '-rotate-90'}`} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd"/>
            </svg>
          </button>
        ) : (<span className="w-5 flex-shrink-0" />)}
        <span className="ml-1.5"><ElementIcon elementType={node.elementType} /></span>
        <span className={`ml-2 text-sm whitespace-nowrap flex-shrink-0 ${isParent ? 'font-semibold text-gray-900' : 'font-medium text-gray-900'}`}>{node.name}</span>
        {isParent && hasChildren && <span className="ml-1.5 text-sm text-gray-400 flex-shrink-0">{node.children.length}</span>}
        {node.description && <span className="ml-3 text-xs text-gray-400 truncate min-w-0">{node.description}</span>}
        <span className="flex-1" />
        {node.logicalType && <span className="ml-3 text-xs text-gray-500 font-mono flex-shrink-0 whitespace-nowrap">{node.logicalType}</span>}
        {node.owner && (
          <span className="ml-3 inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 whitespace-nowrap flex-shrink-0">
            <svg className="size-3" viewBox="0 0 20 20" fill="currentColor"><path d="M7 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM14.5 9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM1.615 16.428a1.224 1.224 0 0 1-.569-1.175 6.002 6.002 0 0 1 11.908 0c.058.467-.172.92-.57 1.174A9.953 9.953 0 0 1 7 18a9.953 9.953 0 0 1-5.385-1.572ZM14.5 16h-.106c.07-.297.088-.611.048-.933a7.47 7.47 0 0 0-1.588-3.755 4.502 4.502 0 0 1 5.874 2.636.818.818 0 0 1-.36.98A7.465 7.465 0 0 1 14.5 16Z"/></svg>
            {node.owner}
          </span>
        )}
      </div>
      {isParent && isExpanded && hasChildren && (
        <div>{node.children.map((child) => (
          <TreeNode key={child.externalId} node={child} expandedNodes={expandedNodes} toggleNode={toggleNode}
            selectedExternalId={selectedExternalId} onSelect={onSelect} depth={depth + 1} />
        ))}</div>
      )}
    </div>
  );
}

function DefinitionCard({ definition, isSelected, onClick }) {
  const getCP = (key) => definition.customProperties?.find(p => p.property === key)?.value;
  const owner = getCP('owner');
  const elementType = getCP('elementType');
  const parentConcept = getCP('parentConcept');

  return (
    <button type="button" onClick={onClick}
      className={`w-full rounded-md px-4 py-3 text-left transition-colors ${isSelected ? 'bg-indigo-50 ring-2 ring-indigo-600' : 'bg-gray-50 hover:bg-gray-100'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-medium text-gray-900 text-sm truncate">{definition.businessName || definition.name}</span>
          {elementType && (
            <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset flex-shrink-0 ${
              elementType === 'entity' ? 'bg-indigo-50 text-indigo-700 ring-indigo-600/20'
                : elementType === 'shared_property' ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
                  : 'bg-amber-50 text-amber-700 ring-amber-600/20'
            }`}>{elementType === 'shared_property' ? 'shared property' : elementType}</span>
          )}
        </div>
        {definition.logicalType && <span className="text-xs text-gray-500 font-mono flex-shrink-0 ml-2">{definition.logicalType}</span>}
      </div>
      {(definition.name || parentConcept || owner) && (
        <div className="flex items-center justify-between mt-0.5">
          <div className="flex items-center gap-2 min-w-0">
            {definition.businessName && definition.name && <span className="text-xs text-gray-500 font-mono">{definition.name}</span>}
            {parentConcept && <span className="text-xs text-gray-400"><span className="text-gray-300 mx-0.5">&middot;</span>{parentConcept}</span>}
          </div>
          {owner && <span className="text-xs text-gray-500 flex-shrink-0">Owner: {owner}</span>}
        </div>
      )}
      {definition.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{definition.description}</p>}
      {definition.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {definition.tags.map((tag, i) => (
            <span key={i} className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">{tag}</span>
          ))}
        </div>
      )}
    </button>
  );
}

function LoadingSpinner({ text }) {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-indigo-600" />
      <span className="ml-3 text-sm text-gray-600">{text}</span>
    </div>
  );
}

function ErrorMessage({ message }) {
  return (
    <div className="rounded-md bg-red-50 p-4">
      <div className="flex">
        <svg className="h-5 w-5 text-red-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
        <p className="ml-3 text-sm text-red-700">{message}</p>
      </div>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="py-12 text-center">
      <svg className="mx-auto size-12 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
      </svg>
      <p className="mt-2 text-sm text-gray-500">{text}</p>
    </div>
  );
}
