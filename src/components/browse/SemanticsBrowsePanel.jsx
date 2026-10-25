import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDraggable } from '@dnd-kit/core';
import { useDefinition } from '../../hooks/useDefinition.js';
import { ElementIcon, EmptyState, LoadingSpinner } from './semanticTree.jsx';
import { collectExpandableIds, filterTree, isSelectableNode, nodeLinkUrls } from './semanticTreeUtils.js';
import { BrowseSearchInput, LinkIcon, LinkedBadge, TreeChevron } from './browsePanelParts.jsx';
import { Tooltip } from '../ui/index.js';
import { useLinkedAuthDefUrls } from './useContractLinks.js';
import { useEditorStore } from '../../store.js';
import { toAbsoluteUrl } from '../../lib/urlUtils.js';

/**
 * Browse panel content for the semantic ontology tree. Selectable nodes are
 * dragged into a schema's properties list (or onto a property to link it).
 */
export default function SemanticsBrowsePanel() {
  const { t } = useTranslation();
  const { getSemanticTree } = useDefinition();
  const linkedUrls = useLinkedAuthDefUrls();
  const setHoveredContractLink = useEditorStore((state) => state.setHoveredContractLink);

  // Clear a stale cross-highlight when the panel/tab goes away mid-hover
  useEffect(() => () => setHoveredContractLink(null), [setHoveredContractLink]);

  const [tree, setTree] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [treeFilter, setTreeFilter] = useState('');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await getSemanticTree();
        if (!cancelled) {
          setTree(data);
          // Expand the top level by default so entities are visible right away
          setExpandedNodes(new Set(data.map((n) => n.externalId)));
        }
      } catch {
        if (!cancelled) setTree([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [getSemanticTree]);

  const toggleNode = (id) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const filteredTree = useMemo(
    () => (treeFilter ? filterTree(tree, treeFilter) : tree),
    [tree, treeFilter]
  );

  // While filtering, show everything expanded; manual expansion state applies otherwise
  const effectiveExpandedNodes = useMemo(
    () => (treeFilter ? collectExpandableIds(filteredTree) : expandedNodes),
    [treeFilter, filteredTree, expandedNodes]
  );

  return (
    <div className="h-full flex flex-col">
      <BrowseSearchInput value={treeFilter} onChange={setTreeFilter} placeholder={t('browsePanel.search')} />
      <div className="flex-1 overflow-y-auto px-2 py-1">
        {isLoading && <LoadingSpinner text={t('browsePanel.loading')} />}
        {!isLoading && filteredTree.length === 0 && (
          <EmptyState text={treeFilter ? t('browsePanel.noMatches') : t('browsePanel.empty')} />
        )}
        {!isLoading && filteredTree.map((node, idx) => (
          <SemanticTreeNode
            key={node.externalId || idx}
            node={node}
            depth={0}
            idPath={`${idx}`}
            expandedNodes={effectiveExpandedNodes}
            toggleNode={toggleNode}
            linkedUrls={linkedUrls}
            setHoveredContractLink={setHoveredContractLink}
          />
        ))}
      </div>
    </div>
  );
}

function SemanticNodeTooltip({ node, t }) {
  const facts = [];
  const add = (label, value) => {
    if (value !== undefined && value !== null && value !== '') facts.push([label, String(value)]);
  };
  add(t('browsePanel.tooltip.id'), node.externalId);
  if (node.businessName && node.businessName !== node.name) {
    add(t('browsePanel.tooltip.businessName'), node.businessName);
  }
  return (
    <div className="space-y-0.5 text-left">
      <div className="text-[10px] uppercase tracking-wide text-gray-400">
        {t(`browsePanel.semanticKind.${node.elementType}`, { defaultValue: node.elementType })}
      </div>
      <div className="font-semibold">{node.name}</div>
      {node.description && <div className="text-gray-500">{node.description}</div>}
      {facts.map(([label, value]) => (
        <div key={label}><span className="text-gray-400">{label}: </span>{value}</div>
      ))}
    </div>
  );
}

function SemanticTreeNode({ node, depth, idPath, expandedNodes, toggleNode, linkedUrls, setHoveredContractLink }) {
  const { t } = useTranslation();
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedNodes.has(node.externalId);
  const selectable = isSelectableNode(node);
  const absUrls = selectable ? [...new Set(nodeLinkUrls(node).map(toAbsoluteUrl).filter(Boolean))] : [];
  const linkedProperties = absUrls.map((url) => linkedUrls.get(url)).find(Boolean) || null;

  // Reverse cross-highlight: a linked property row is hovered in the schema editor
  const hoveredSchemaProperty = useEditorStore((state) => state.hoveredSchemaProperty);
  const isReverseHighlighted = absUrls.some((url) => hoveredSchemaProperty?.urls?.includes(url));

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `browse-semantics-${idPath}`,
    data: { source: 'browse', kind: 'semantics', node },
    disabled: !selectable,
  });

  const row = (
      <div
        ref={setNodeRef}
        {...(selectable ? { ...attributes, ...listeners } : {})}
        className={`group flex items-center gap-1 py-1 pr-1 rounded-md min-w-0 ${selectable ? 'cursor-grab active:cursor-grabbing' : ''} ${isReverseHighlighted ? 'bg-blue-50 ring-1 ring-inset ring-blue-300' : linkedProperties ? 'hover:bg-blue-50' : 'hover:bg-gray-50'} ${isDragging ? 'opacity-40' : ''}`}
        style={{ paddingLeft: `${depth * 16 + 4}px` }}
        onClick={() => { if (hasChildren) toggleNode(node.externalId); }}
        onMouseEnter={linkedProperties ? () => setHoveredContractLink({ type: 'authDef', urls: absUrls }) : undefined}
        onMouseLeave={linkedProperties ? () => setHoveredContractLink(null) : undefined}
      >
        <TreeChevron hasChildren={hasChildren} isExpanded={isExpanded}
          onToggle={(e) => { e.stopPropagation(); toggleNode(node.externalId); }} />
        <ElementIcon elementType={node.elementType} />
        <span className={`text-sm text-gray-900 truncate min-w-0 ${linkedProperties ? 'font-medium' : ''}`}>{node.name}</span>
        {linkedProperties && (
          <LinkedBadge tooltip={t('browsePanel.linkedTo', { properties: linkedProperties.join(', ') })}>
            <LinkIcon className="h-3.5 w-3.5 text-blue-400" />
          </LinkedBadge>
        )}
        <span className="flex-1" />
        {/* Same mark as Entropy Data's concept page: a shared property sits under every concept
            that uses it, so a search hits it several times; the mark explains why. */}
        {node.elementType === 'shared_property' && (
          <span className="flex-shrink-0 flex items-center mr-2">
            <Tooltip content={t('browsePanel.sharedTooltip')}>
              <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                <LinkIcon className="size-3" />
                {t('browsePanel.shared')}
              </span>
            </Tooltip>
          </span>
        )}
        {node.logicalType && (
          <span className="text-xs text-gray-500 font-mono flex-shrink-0">{node.logicalType}</span>
        )}
      </div>
  );

  return (
    <div>
      {isDragging
        ? row
        : <Tooltip placement="bottom-start" variant="light" delay={500} className="block" content={<SemanticNodeTooltip node={node} t={t} />}>{row}</Tooltip>}
      {isExpanded && hasChildren && node.children.map((child, idx) => (
        <SemanticTreeNode
          key={child.externalId || idx}
          node={child}
          depth={depth + 1}
          idPath={`${idPath}-${idx}`}
          expandedNodes={expandedNodes}
          toggleNode={toggleNode}
          linkedUrls={linkedUrls}
          setHoveredContractLink={setHoveredContractLink}
        />
      ))}
    </div>
  );
}
