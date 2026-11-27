import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { useDefinition } from '../../hooks/useDefinition';
import { ElementIcon, EmptyState, LoadingSpinner } from '../browse/semanticTree.jsx';
import {
  collectExpandableIds,
  filterTree,
  isSelectableNode,
  nodeSelectionKey,
  nodeToDefinition,
} from '../browse/semanticTreeUtils.js';

/**
 * Modal for browsing and selecting a definition from the semantic tree.
 *
 * The tree (served by the configured `semantics` source) contains the semantic
 * ontology and, when the backend merges them in, business definitions grouped
 * by domain. Each node carries its own `authDefType`, so callers tag the
 * selection correctly via resolveAuthDefType.
 */
export function DefinitionSelectionModal({ isOpen, onClose, onSelect }) {
  const { t } = useTranslation();
  const { getSemanticTree } = useDefinition();

  const [selectedDefinition, setSelectedDefinition] = useState(null);
  // The selected row for the highlight: a shared property is a row on its own and one under each concept that has it
  const [selectedKey, setSelectedKey] = useState(null);

  const [tree, setTree] = useState([]);
  const [isLoadingTree, setIsLoadingTree] = useState(false);
  const [treeLoaded, setTreeLoaded] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [treeFilter, setTreeFilter] = useState('');

  // Reset on open
  useEffect(() => {
    if (!isOpen) return;
    setSelectedDefinition(null);
    setSelectedKey(null);
    setExpandedNodes(new Set());
    setTreeFilter('');
    setTree([]);
    setTreeLoaded(false);
  }, [isOpen]);

  // Load semantic tree
  useEffect(() => {
    if (!isOpen || treeLoaded) return;

    let cancelled = false;
    const load = async () => {
      setIsLoadingTree(true);
      try {
        const data = await getSemanticTree();
        if (!cancelled) setTree(data);
      } catch {
        if (!cancelled) setTree([]);
      } finally {
        if (!cancelled) { setIsLoadingTree(false); setTreeLoaded(true); }
      }
    };
    load();
    return () => { cancelled = true; };
  }, [isOpen, treeLoaded, getSemanticTree]);

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

  const selectTreeNode = useCallback((node) => {
    if (!isSelectableNode(node)) return;
    setSelectedDefinition(nodeToDefinition(node));
    setSelectedKey(nodeSelectionKey(node));
  }, []);

  const filteredTree = treeFilter ? filterTree(tree, treeFilter) : tree;

  // Auto-expand on filter
  useEffect(() => {
    if (!treeFilter) return;
    setExpandedNodes(collectExpandableIds(filteredTree));
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
              <DialogTitle as="h3" className="text-lg font-semibold text-gray-900 pr-8">{t('definitionSelect.title')}</DialogTitle>
              <p className="mt-1 text-sm text-gray-500 pr-8">{t('definitionSelect.subtitle')}</p>
              <button type="button" onClick={onClose} className="absolute right-4 top-4 rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <span className="sr-only">{t('definitionSelect.close')}</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Tree filter */}
            <div className="flex-shrink-0 border-b border-gray-200 bg-white px-6 py-3">
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
                  </svg>
                </div>
                <input type="text" placeholder={t('definitionSelect.search')} value={treeFilter} onChange={(e) => setTreeFilter(e.target.value)} autoFocus
                  className="block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
              </div>
              {!isLoadingTree && tree.length > 0 && (
                <div className="mt-2 text-xs text-gray-500">
                  {t('definitionSelect.conceptCount', { count: stats.concepts })}, {t('definitionSelect.propertyCount', { count: stats.properties })}
                </div>
              )}
            </div>

            {/* Tree */}
            <div className="flex-1 overflow-y-auto bg-white">
              {isLoadingTree && <LoadingSpinner text={t('definitionSelect.loading')} />}
              {!isLoadingTree && filteredTree.length === 0 && (
                <EmptyState text={treeFilter ? t('definitionSelect.noMatches') : t('definitionSelect.empty')} />
              )}
              {!isLoadingTree && filteredTree.length > 0 && (
                <div className="px-4 py-2">
                  {filteredTree.map((node) => (
                    <TreeNode key={node.externalId} node={node} expandedNodes={expandedNodes} toggleNode={toggleNode}
                      selectedKey={selectedKey} onSelect={selectTreeNode} depth={0} />
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
              <button type="button" onClick={onClose}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
                {t('definitionSelect.cancel')}
              </button>
              <button type="button" onClick={handleSelect} disabled={!selectedDefinition}
                className="rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed">
                {t('definitionSelect.select')}
              </button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}

/* ── Sub-components ── */

function TreeNode({ node, expandedNodes, toggleNode, selectedKey, onSelect, depth }) {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedNodes.has(node.externalId);
  const isSelectable = isSelectableNode(node);
  const isSelected = isSelectable && selectedKey === nodeSelectionKey(node);
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
            selectedKey={selectedKey} onSelect={onSelect} depth={depth + 1} />
        ))}</div>
      )}
    </div>
  );
}
