import { createElement, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDraggable } from '@dnd-kit/core';
import { useEditorStore } from '../../store.js';
import { fetchCatalogAssets, fetchServerAssets } from '../../lib/serverAssetsApi.js';
import { EmptyState, LoadingSpinner } from './semanticTree.jsx';
import { collectExpandableIds, filterTree } from './semanticTreeUtils.js';
import { BrowseSearchInput, OpenDetailsButton, TableIcon, TreeChevron } from './browsePanelParts.jsx';
import { resolveDetailsUrl } from './detailsUrl.js';
import { Tooltip } from '../ui/index.js';
import { getLogicalTypeIcon } from '../features/schema/propertyIcons.js';
import serverIcons from '../../assets/server-icons/serverIcons.jsx';

// Server edits arrive per keystroke; wait for a pause before asking the host again.
const REFRESH_DELAY_MS = 400;
// Shorter searches match too much of the catalog to be worth a request.
const MIN_QUERY_LENGTH = 3;

function NodeIcon({ node }) {
  if (node.kind === 'server') {
    // The server icons render at w-5; shrink to the tree's icon size.
    return <span className="flex-shrink-0 flex [&_img]:size-4">{createElement(serverIcons[node.meta?.type])}</span>;
  }
  if (node.kind === 'asset') {
    return node.iconUrl
      ? <img src={node.iconUrl} alt="" className="size-4 flex-shrink-0" />
      : <TableIcon />;
  }
  if (node.kind !== 'property') return null;
  const icon = getLogicalTypeIcon(node.logicalType);
  return icon
    ? createElement(icon, { className: 'h-3.5 w-3.5 text-gray-500 flex-shrink-0' })
    : <div className="h-3.5 w-3.5 flex-shrink-0" />;
}

const infoNode = (id, name) => ({ externalId: id, name, kind: 'info' });

function propertyNode(prop, id, detailsUrl) {
  return {
    externalId: id,
    name: prop.name || 'unnamed',
    description: prop.description,
    logicalType: prop.logicalType,
    kind: 'property',
    property: prop,
    detailsUrl,
    children: [
      ...(prop.properties || []),
      ...(prop.items?.properties || []),
    ].map((child, i) => propertyNode(child, `${id}-p${i}`, detailsUrl)),
  };
}

/**
 * Normalize the host response into generic tree nodes (server > asset >
 * property), reusing the semanticTree field names so filterTree and
 * collectExpandableIds work unchanged.
 */
function buildServerNodes(entries, assetDetailsUrlTemplate, t) {
  return (entries || []).map((entry, si) => {
    const serverId = `server-${si}`;
    const assets = (entry.assets || []).map((asset, ai) => {
      const assetId = `${serverId}-a${ai}`;
      const detailsUrl = resolveDetailsUrl(assetDetailsUrlTemplate, asset.externalId);
      return {
        externalId: assetId,
        name: asset.name || asset.externalId || 'unnamed',
        description: asset.description,
        kind: 'asset',
        iconUrl: asset.iconUrl,
        meta: { externalId: asset.externalId, type: asset.type, qualifiedName: asset.qualifiedName, physicalName: asset.physicalName },
        detailsUrl,
        children: (asset.properties || []).map((prop, pi) => propertyNode(prop, `${assetId}-${pi}`, detailsUrl)),
      };
    });
    return {
      externalId: serverId,
      name: entry.server || entry.type || 'unnamed',
      kind: 'server',
      meta: { type: entry.type },
      children: assets.length > 0 ? assets : [infoNode(`${serverId}-empty`, t('browsePanel.assets.noAssets'))],
    };
  });
}

/**
 * Browse panel content for assets, with their columns to drag into the edited
 * schema (or onto a property to set its physical name and type). A contract
 * with servers sees the assets on those servers; a contract without servers
 * browses the whole catalog, when the host offers it.
 */
export default function AssetsBrowsePanel() {
  const editorConfig = useEditorStore((state) => state.editorConfig);
  const servers = useEditorStore((state) => state.yamlParts?.servers);

  const url = editorConfig?.assets?.url;
  const catalogUrl = editorConfig?.assets?.catalogUrl;
  const assetDetailsUrlTemplate = editorConfig?.assets?.assetDetailsUrlTemplate;

  const serverList = Array.isArray(servers) ? servers.filter((s) => s && typeof s === 'object') : [];

  if (serverList.length === 0 && catalogUrl) {
    return <CatalogAssets url={catalogUrl} assetDetailsUrlTemplate={assetDetailsUrlTemplate} />;
  }
  return <ServerAssets url={url} assetDetailsUrlTemplate={assetDetailsUrlTemplate} serverList={serverList} />;
}

/**
 * The assets available on the servers of the edited contract: one section per
 * server, listing the tables the host finds at the server's location. The
 * servers of the current document are posted, so the list follows unsaved
 * server edits.
 */
function ServerAssets({ url, assetDetailsUrlTemplate, serverList }) {
  const { t } = useTranslation();
  // Stable key: yamlParts is re-parsed on every edit, also when the servers did not change.
  const serversKey = JSON.stringify(serverList);

  // key: the servers the entries belong to; null until the first response
  const [state, setState] = useState({ key: null, status: 'idle', entries: [] });
  const [expandedNodes, setExpandedNodes] = useState(() => new Set());
  const [treeFilter, setTreeFilter] = useState('');
  const generation = useRef(0);

  useEffect(() => {
    if (!url) return undefined;
    const gen = ++generation.current;
    const timer = setTimeout(async () => {
      const posted = JSON.parse(serversKey);
      if (posted.length === 0) {
        setState({ key: serversKey, status: 'ready', entries: [] });
        return;
      }
      try {
        const entries = await fetchServerAssets(url, posted);
        if (gen !== generation.current) return;
        setState({ key: serversKey, status: 'ready', entries });
        // Default expansion: every server section; the tables stay collapsed.
        setExpandedNodes((prev) => new Set([...prev, ...entries.map((_, si) => `server-${si}`)]));
      } catch (error) {
        console.error('Error fetching server assets:', error);
        if (gen !== generation.current) return;
        setState({ key: serversKey, status: 'error', entries: [] });
      }
    }, REFRESH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [url, serversKey]);

  const nodes = useMemo(
    () => buildServerNodes(state.entries, assetDetailsUrlTemplate, t),
    [state.entries, assetDetailsUrlTemplate, t]
  );

  const filteredNodes = useMemo(
    () => (treeFilter ? filterTree(nodes, treeFilter) : nodes),
    [nodes, treeFilter]
  );

  // While filtering, show everything expanded; manual expansion state applies otherwise
  const effectiveExpandedNodes = useMemo(
    () => (treeFilter ? collectExpandableIds(filteredNodes) : expandedNodes),
    [treeFilter, filteredNodes, expandedNodes]
  );

  const toggleNode = (node) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(node.externalId)) next.delete(node.externalId); else next.add(node.externalId);
      return next;
    });
  };

  const emptyText = () => {
    if (state.status === 'error') return t('browsePanel.assets.error');
    if (serverList.length === 0) return t('browsePanel.assets.noServers');
    return treeFilter ? t('browsePanel.noMatches') : t('browsePanel.assets.noAssets');
  };

  // Only the first load shows the spinner; a refresh keeps the previous list until it is replaced.
  const isLoading = state.key === null;

  return (
    <div className="h-full flex flex-col">
      <BrowseSearchInput value={treeFilter} onChange={setTreeFilter} placeholder={t('browsePanel.search')} />
      <div className="flex-1 overflow-y-auto px-2 py-1">
        {isLoading && <LoadingSpinner text={t('browsePanel.loading')} />}
        {!isLoading && filteredNodes.length === 0 && <EmptyState text={emptyText()} />}
        {!isLoading && filteredNodes.map((node) => (
          <AssetTreeNode
            key={node.externalId}
            node={node}
            depth={0}
            expandedNodes={effectiveExpandedNodes}
            toggleNode={toggleNode}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * The whole asset catalog, for a contract without servers. It never loads all
 * assets: without a search it shows the top level of the asset tree and loads
 * an asset's children when it is expanded; a search of at least
 * MIN_QUERY_LENGTH characters asks the host for the matching assets. The host
 * caps every slice and says when it left assets out.
 */
function CatalogAssets({ url, assetDetailsUrlTemplate }) {
  const { t } = useTranslation();
  const [treeFilter, setTreeFilter] = useState('');
  // Loaded slices of the catalog: 'top', 'parent:<externalId>' and 'query:<text>'.
  const [slices, setSlices] = useState({});
  const [expandedNodes, setExpandedNodes] = useState(() => new Set());
  const requested = useRef(new Set());

  const query = treeFilter.trim();
  const rootKey = !query ? 'top' : query.length >= MIN_QUERY_LENGTH ? `query:${query}` : null;

  const loadSlice = useCallback(async (key, params) => {
    if (requested.current.has(key)) return;
    requested.current.add(key);
    setSlices((prev) => ({ ...prev, [key]: { status: 'loading' } }));
    try {
      const result = await fetchCatalogAssets(url, params);
      setSlices((prev) => ({ ...prev, [key]: { status: 'ready', ...result } }));
    } catch (error) {
      console.error('Error fetching catalog assets:', error);
      // Forget the failed request, so collapsing and expanding again retries it.
      requested.current.delete(key);
      setSlices((prev) => ({ ...prev, [key]: { status: 'error' } }));
    }
  }, [url]);

  useEffect(() => {
    if (!rootKey) return undefined;
    const isTop = rootKey === 'top';
    // A search waits for a pause in typing; the top level loads right away.
    const timer = setTimeout(
      () => loadSlice(rootKey, isTop ? {} : { query }),
      isTop ? 0 : REFRESH_DELAY_MS,
    );
    return () => clearTimeout(timer);
  }, [rootKey, query, loadSlice]);

  const nodes = useMemo(() => {
    const sliceNodes = (slice, path) => {
      if (!slice || slice.status === 'loading') return [infoNode(`${path}-loading`, t('browsePanel.loading'))];
      if (slice.status === 'error') return [infoNode(`${path}-error`, t('browsePanel.assets.error'))];
      if (slice.assets.length === 0) return [infoNode(`${path}-empty`, t('browsePanel.assets.noCatalogAssets'))];
      return [
        ...slice.assets.map((asset) => assetNode(asset, path)),
        ...(slice.truncated ? [infoNode(`${path}-truncated`, t('browsePanel.assets.truncated'))] : []),
      ];
    };
    // Ids follow the path through the tree, so an asset found twice keeps two expansion states.
    const assetNode = (asset, path) => {
      const id = `${path}/${asset.externalId}`;
      const detailsUrl = resolveDetailsUrl(assetDetailsUrlTemplate, asset.externalId);
      return {
        externalId: id,
        name: asset.name || asset.externalId || 'unnamed',
        description: asset.description,
        kind: 'asset',
        iconUrl: asset.iconUrl,
        meta: { externalId: asset.externalId, type: asset.type, qualifiedName: asset.qualifiedName, physicalName: asset.physicalName },
        detailsUrl,
        lazyParent: asset.hasChildren ? asset.externalId : null,
        children: asset.hasChildren
          ? sliceNodes(slices[`parent:${asset.externalId}`], id)
          : (asset.properties || []).map((prop, pi) => propertyNode(prop, `${id}-${pi}`, detailsUrl)),
      };
    };
    const rootSlice = rootKey ? slices[rootKey] : null;
    if (rootSlice?.status !== 'ready') return [];
    return sliceNodes(rootSlice, rootKey);
  }, [slices, rootKey, assetDetailsUrlTemplate, t]);

  const toggleNode = (node) => {
    const expanding = !expandedNodes.has(node.externalId);
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(node.externalId)) next.delete(node.externalId); else next.add(node.externalId);
      return next;
    });
    if (expanding && node.lazyParent) {
      loadSlice(`parent:${node.lazyParent}`, { parent: node.lazyParent });
    }
  };

  const rootSlice = rootKey ? slices[rootKey] : null;
  let message = null;
  if (!rootKey) message = t('browsePanel.assets.minQuery');
  else if (rootSlice?.status === 'error') message = t('browsePanel.assets.error');
  const isLoading = rootKey && !message && rootSlice?.status !== 'ready';

  return (
    <div className="h-full flex flex-col">
      <BrowseSearchInput value={treeFilter} onChange={setTreeFilter} placeholder={t('browsePanel.search')} />
      <div className="flex-1 overflow-y-auto px-2 py-1">
        {message && <EmptyState text={message} />}
        {isLoading && <LoadingSpinner text={t('browsePanel.loading')} />}
        {!message && !isLoading && nodes.map((node) => (
          <AssetTreeNode
            key={node.externalId}
            node={node}
            depth={0}
            expandedNodes={expandedNodes}
            toggleNode={toggleNode}
          />
        ))}
      </div>
    </div>
  );
}

function AssetNodeTooltip({ node, t }) {
  const facts = [];
  const add = (label, value) => {
    if (value !== undefined && value !== null && value !== '') facts.push([label, String(value)]);
  };
  if (node.kind === 'server') {
    add(t('browsePanel.tooltip.type'), node.meta?.type);
  }
  if (node.kind === 'asset') {
    add(t('browsePanel.tooltip.id'), node.meta?.externalId);
    add(t('browsePanel.tooltip.type'), node.meta?.type);
    add(t('browsePanel.tooltip.qualifiedName'), node.meta?.qualifiedName);
  }
  if (node.kind === 'property') {
    const property = node.property || {};
    const type = [property.logicalType, property.physicalType].filter(Boolean).join(' / ');
    add(t('browsePanel.tooltip.type'), type);
    if (property.required) add(t('browsePanel.tooltip.required'), t('browsePanel.tooltip.yes'));
  }
  return (
    <div className="space-y-0.5 text-left">
      <div className="text-[10px] uppercase tracking-wide text-gray-400">{t(`browsePanel.kind.${node.kind}`)}</div>
      <div className="font-semibold">{node.name}</div>
      {node.description && <div className="text-gray-500">{node.description}</div>}
      {facts.map(([label, value]) => (
        <div key={label}><span className="text-gray-400">{label}: </span>{value}</div>
      ))}
    </div>
  );
}

function AssetTreeNode({ node, depth, expandedNodes, toggleNode }) {
  const { t } = useTranslation();
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedNodes.has(node.externalId);
  const isDraggable = node.kind === 'property';

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `browse-asset-${node.externalId}`,
    data: { source: 'browse', kind: 'asset', property: node.property },
    disabled: !isDraggable,
  });

  if (node.kind === 'info') {
    return (
      <div className="py-1 text-xs italic text-gray-400" style={{ paddingLeft: `${depth * 16 + 24}px` }}>
        {node.name}
      </div>
    );
  }

  const row = (
    <div
      ref={setNodeRef}
      {...(isDraggable ? { ...attributes, ...listeners } : {})}
      className={`group flex items-center gap-1 py-1 pr-1 rounded-md min-w-0 hover:bg-gray-50 ${isDraggable ? 'cursor-grab active:cursor-grabbing' : hasChildren ? 'cursor-pointer' : ''} ${isDragging ? 'opacity-40' : ''}`}
      style={{ paddingLeft: `${depth * 16 + 4}px` }}
      onClick={() => { if (hasChildren) toggleNode(node); }}
    >
      <TreeChevron hasChildren={hasChildren} isExpanded={isExpanded}
        onToggle={(e) => { e.stopPropagation(); toggleNode(node); }} />
      <NodeIcon node={node} />
      <span className={`text-sm truncate min-w-0 text-gray-900 ${node.kind !== 'property' ? 'font-medium' : ''}`}>{node.name}</span>
      <span className="flex-1" />
      {node.logicalType && (
        <span className="text-xs text-gray-500 font-mono flex-shrink-0">{node.logicalType}</span>
      )}
      <OpenDetailsButton url={node.detailsUrl} label={t('browsePanel.openDetails')} />
    </div>
  );

  return (
    <div>
      {isDragging
        ? row
        : <Tooltip placement="bottom-start" variant="light" delay={500} className="block" content={<AssetNodeTooltip node={node} t={t} />}>{row}</Tooltip>}
      {isExpanded && hasChildren && node.children.map((child) => (
        <AssetTreeNode
          key={child.externalId}
          node={child}
          depth={depth + 1}
          expandedNodes={expandedNodes}
          toggleNode={toggleNode}
        />
      ))}
    </div>
  );
}
