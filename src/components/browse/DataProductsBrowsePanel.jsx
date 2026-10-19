import { createElement, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDraggable } from '@dnd-kit/core';
import { useEditorStore } from '../../store.js';
import { fetchAllDataProducts, fetchDataProductContracts, fetchUpstreamDataProducts } from '../../lib/dataProductsApi.js';
import { EmptyState, LoadingSpinner } from './semanticTree.jsx';
import { collectExpandableIds, filterTree } from './semanticTreeUtils.js';
import { BrowseSearchInput, LinkIcon, LinkedBadge, OpenDetailsButton, TableIcon, TreeChevron } from './browsePanelParts.jsx';
import { resolveDetailsUrl } from './detailsUrl.js';
import { Tooltip } from '../ui/index.js';
import { nodeSourcedKeys, useSourcedContractProperties } from './useContractLinks.js';
import { getLogicalTypeIcon } from '../features/schema/propertyIcons.js';

// Fallback glyphs aligned with the host app's icon set: the data product
// cube (dataproduct.svg) and the output port symbol (outputport.svg). Nodes
// with a resolved iconUrl (product icon, output port server type) render the
// image instead. Schemas use TableIcon, the table glyph of the diagram node header.
const ProductCubeIcon = () => (
  <svg className="size-4 text-gray-500 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.712 0.729624C11.116512 1.03752 1.728432 6.1585920000000005 1.6836720000000003 6.199968C1.652688 6.228576 1.606776 6.29208 1.5816720000000002 6.34104C1.537176 6.427824000000001 1.536 6.571944 1.536 11.982336L1.536 17.534568 1.596792 17.656584000000002C1.632696 17.728632 1.6941119999999998 17.80356 1.7467920000000001 17.839584000000002C1.9423200000000003 17.973312 11.822184 23.330952 11.909400000000002 23.350535999999998C11.97012 23.364192000000003 12.040296 23.361816 12.109464 23.343768C12.26676 23.302752 22.212623999999998 17.886623999999998 22.314456 17.78652C22.475712 17.628024 22.463664 18.094248 22.464144 11.988744C22.464576 6.560136 22.463520000000003 6.429168000000001 22.41864 6.341615999999999C22.393344000000003 6.292344 22.347312000000002 6.228624 22.316328 6.200064C22.269888 6.157272 12.796560000000001 0.9906 12.285192 0.729168C12.068280000000001 0.6182880000000001 11.927136 0.6183839999999999 11.712 0.729624M7.546224 4.135584C5.11644 5.458008 3.1254960000000005 6.550056 3.121848 6.5623439999999995C3.1182239999999997 6.574631999999999 5.114784 7.67268 7.558631999999999 9.002424L12.002016000000001 11.42016 16.435008 9.008352C18.873144 7.681871999999999 20.876640000000002 6.5881680000000005 20.8872 6.577896C20.90724 6.558384 12.043752 1.726824 11.993016 1.729584C11.977056 1.7304480000000002 9.976008 2.813136 7.546224 4.135584M2.549952 12.280896L2.556 17.144232 7.0200000000000005 19.573248L11.484 22.002264 11.490048 17.152392C11.493384 14.48496 11.487984 12.295152 11.478048000000001 12.286176C11.468136 12.277175999999999 9.489 11.198304 7.08 9.888648C4.671 8.579016000000001 2.664864 7.487256 2.6219520000000003 7.462512L2.54388 7.41756 2.549952 12.280896M16.962 9.867288L12.504 12.293544 12.504 17.152272L12.504 22.011 12.627984000000001 21.943488000000002C12.696167999999998 21.906384 14.707656 20.81184 17.097984 19.511208L21.444 17.14644 21.450048 12.293208C21.453384 9.623952 21.447984 7.44024 21.438048 7.440528C21.428136000000002 7.440816 19.413912 8.532864 16.962 9.867288" fillRule="evenodd" />
  </svg>
);

const OutputPortIcon = () => (
  <svg className="size-4 text-gray-500 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
    <path d="M10.668000000000001 1.033464C6.389735999999999 1.303728 3.1193520000000006 2.647656 2.23116 4.500432C2.1212400000000002 4.729728000000001 2.050776 4.977936 2.016864 5.255376C1.982736 5.534448 1.982736 18.454848000000002 2.016864 18.756C2.2242480000000002 20.586336 4.699152 22.101288 8.508000000000001 22.729344C8.961768 22.804176 9.741048000000001 22.896096 10.368 22.948752C10.875192 22.991352 13.124808 22.991352 13.632 22.948752C14.258952 22.896096 15.038231999999999 22.804176 15.492 22.729344C19.303176 22.100904 21.775632 20.587464 21.983136000000002 18.756C22.017336 18.454104 22.01724 5.510112 21.983040000000003 5.231376C21.815568 3.86676 20.414328 2.678112 18.036 1.883112C16.825295999999998 1.478424 15.418104000000001 1.206936 13.8 1.0658640000000001C13.281528000000002 1.020648 11.209896 0.999216 10.668000000000001 1.033464M10.668000000000001 2.04144C8.369664 2.1969600000000002 6.39288 2.661384 4.94772 3.385392C3.7882080000000005 3.9663120000000003 3.121176 4.645608 3.01848 5.350104C2.929224 5.962464000000001 3.3681840000000003 6.627192 4.248 7.2120239999999995C5.2812 7.898808000000001 6.777096 8.418192 8.604000000000001 8.724456C9.745344 8.915784 10.625904 8.983344 11.988 8.984136C13.093032000000001 8.98476 13.598496 8.958456 14.496 8.853576C17.958503999999998 8.449008 20.61492 7.1871599999999995 20.961168 5.782464C21.012168 5.57556 21.010176 5.423472 20.953560000000003 5.2021440000000005C20.871672 4.881936 20.738496 4.661616 20.436744 4.34712C19.431456 3.2993280000000005 17.172888 2.461944 14.508000000000001 2.14896C13.670352 2.050584 13.358016 2.03436 12.168000000000001 2.027352C11.5146 2.023488 10.839599999999999 2.029824 10.668000000000001 2.04144M3 8.573088C3 9.728016 3.009 9.813024 3.163752 10.1196C3.4318079999999997 10.650599999999999 4.093224 11.198616 5.0040000000000004 11.644392C6.6294 12.439896 8.890320000000001 12.91548 11.358 12.980927999999999C13.998144 13.050984000000001 16.399704 12.694272 18.3 11.949864C19.723848 11.39208 20.67696 10.64604 20.934168 9.888C20.985216 9.737592000000001 20.987376 9.69252 20.994696 8.63076L21.002280000000003 7.529520000000001 20.911128 7.605048C20.494848 7.95 20.022816 8.256096000000001 19.5 8.52012C16.53264 10.01868 11.482752 10.43496 7.408632 9.516888C6.015456 9.202944 4.768992 8.730048 3.892104 8.182728000000001C3.676152 8.047944000000001 3.3292800000000002 7.7966880000000005 3.078 7.5930480000000005L3 7.5298560000000005 3 8.573088M3.0060960000000003 12.880344000000001C3.013416 14.079768000000001 3.019248 14.257968 3.054624 14.359895999999999C3.284592 15.022560000000002 3.9107760000000003 15.599424 4.97412 16.128263999999998C8.638200000000001 17.950488 15.3618 17.950488 19.02588 16.128263999999998C19.94376 15.671784 20.561016 15.157176 20.830344 14.623895999999998C20.991744 14.30436 20.984784 14.378544 20.993904 12.880344000000001L21.002232 11.516688 20.8152 11.676264000000002C19.561608 12.745895999999998 17.211384 13.562351999999999 14.532 13.859040000000002C13.534728000000001 13.969464 13.314312000000001 13.98 12 13.98C10.685688 13.98 10.465272 13.969464 9.468 13.859040000000002C7.543296 13.645920000000002 5.786184 13.168920000000002 4.46784 12.501648000000001C4.01184 12.270840000000002 3.4766160000000004 11.926776 3.184896 11.676936L2.9977679999999998 11.516688 3.0060960000000003 12.880344000000001M3 17.321832C3 18.522552 3.0033600000000003 18.629448 3.046368 18.797616C3.1338960000000005 19.139856 3.309552 19.41336 3.6523679999999996 19.741128C4.841016 20.877624 7.372944 21.705503999999998 10.368 21.937008000000002C11.22396 22.003176 12.776040000000002 22.003176 13.632 21.937008000000002C15.728856 21.774936 17.61444 21.320544 18.996 20.644392C20.030736 20.137944 20.721912 19.511664 20.934383999999998 18.888C20.986392 18.735336 20.987688 18.703056 20.99472 17.378904L21.001896 16.025832 20.91096 16.101384C20.355216000000002 16.563096 19.762368000000002 16.922112 19.032 17.239224C14.671248 19.13256 7.4028719999999995 18.858552 3.86496 16.667472C3.657264 16.538832000000003 3.315096 16.289232 3.09 16.102152L3 16.027344000000003 3 17.321832" fillRule="evenodd" />
  </svg>
);

function NodeIcon({ node }) {
  if (node.kind === 'product') {
    return node.iconUrl
      ? <img src={node.iconUrl} alt="" className="size-4 flex-shrink-0" />
      : <ProductCubeIcon />;
  }
  if (node.kind === 'contract') {
    return node.iconUrl
      ? <img src={node.iconUrl} alt="" className="size-4 flex-shrink-0" />
      : <OutputPortIcon />;
  }
  if (node.kind === 'schema') return <TableIcon />;
  if (node.kind !== 'property') return null;
  const icon = getLogicalTypeIcon(node.logicalType);
  return icon
    ? createElement(icon, { className: 'h-3.5 w-3.5 text-gray-500 flex-shrink-0' })
    : <div className="h-3.5 w-3.5 flex-shrink-0" />;
}

const infoNode = (id, name) => ({ externalId: id, name, kind: 'info' });

/**
 * Normalize {dataProduct, contracts} entries into generic tree nodes. The
 * nodes reuse the semanticTree field names (externalId/name/description/
 * children) so filterTree and collectExpandableIds work unchanged.
 */
function buildProductEntryNodes(entries, idPrefix, urlTemplates = {}) {
  const propertyNode = (prop, id, origin, detailsUrl) => ({
    externalId: id,
    name: prop.name || 'unnamed',
    description: prop.description,
    logicalType: prop.logicalType,
    kind: 'property',
    property: prop,
    origin,
    detailsUrl,
    sourcedKeys: prop.name ? nodeSourcedKeys(origin, prop.name) : [],
    children: [
      ...(prop.properties || []),
      ...(prop.items?.properties || []),
    ].map((child, i) => propertyNode(child, `${id}-p${i}`, origin, detailsUrl)),
  });

  return (entries || []).map((entry, pi) => ({
    externalId: `${idPrefix}-${pi}`,
    name: entry.dataProduct?.name || entry.dataProduct?.externalId || 'unnamed',
    description: entry.dataProduct?.description,
    kind: 'product',
    iconUrl: entry.dataProduct?.iconUrl,
    meta: { externalId: entry.dataProduct?.externalId },
    detailsUrl: resolveDetailsUrl(urlTemplates.productDetailsUrlTemplate, entry.dataProduct?.externalId),
    children: (entry.contracts || []).map((contract, ci) => ({
      externalId: `${idPrefix}-${pi}-c${ci}`,
      // The level under a product is the output port; the data contract
      // title moves into the tooltip.
      name: contract.outputPortName || contract.title || contract.externalId || 'unnamed',
      description: contract.description,
      kind: 'contract',
      iconUrl: contract.iconUrl,
      meta: { externalId: contract.externalId, contractTitle: contract.title, version: contract.version, serverType: contract.serverType },
      detailsUrl: resolveDetailsUrl(urlTemplates.contractDetailsUrlTemplate, contract.externalId),
      children: (contract.schemas || []).map((schema, si) => {
        // Lineage context recorded on copied/linked properties (ODCS transform fields)
        const origin = {
          dataProductExternalId: entry.dataProduct?.externalId,
          dataProductName: entry.dataProduct?.name,
          contractExternalId: contract.externalId,
          contractTitle: contract.title,
          schemaName: schema.name,
          outputPortExternalId: contract.outputPortExternalId,
          // Canonical product URL for the lineage URI (falls back to the details URL)
          productUrl: resolveDetailsUrl(urlTemplates.productUriTemplate || urlTemplates.productDetailsUrlTemplate, entry.dataProduct?.externalId),
        };
        const contractDetailsUrl = resolveDetailsUrl(urlTemplates.contractDetailsUrlTemplate, contract.externalId);
        return {
          externalId: `${idPrefix}-${pi}-c${ci}-s${si}`,
          name: schema.name || 'unnamed',
          description: schema.description,
          kind: 'schema',
          meta: { physicalName: schema.physicalName },
          detailsUrl: contractDetailsUrl,
          children: (schema.properties || []).map((prop, qi) =>
            propertyNode(prop, `${idPrefix}-${pi}-c${ci}-s${si}-${qi}`, origin, contractDetailsUrl)),
        };
      }),
    })),
  }));
}

/**
 * Browse panel content for data products and their contract schemas, in two
 * sections: "Upstream" (dependencies of the edited contract's product, via
 * access agreements or declared input ports; schemas inlined) and "All data
 * products" (whole organization; the product list and each product's
 * contracts load lazily on expand). Property nodes are dragged into the
 * edited schema (or onto a property to link it).
 */
export default function DataProductsBrowsePanel() {
  const { t } = useTranslation();
  const editorConfig = useEditorStore((state) => state.editorConfig);
  const sourcedProperties = useSourcedContractProperties();
  const setHoveredContractLink = useEditorStore((state) => state.setHoveredContractLink);

  // Clear a stale cross-highlight when the panel/tab goes away mid-hover
  useEffect(() => () => setHoveredContractLink(null), [setHoveredContractLink]);

  const upstreamUrl = editorConfig?.dataProducts?.upstreamUrl;
  const productsUrl = editorConfig?.dataProducts?.productsUrl;
  const contractsBaseUrl = editorConfig?.dataProducts?.contractsBaseUrl;
  const urlTemplates = {
    productDetailsUrlTemplate: editorConfig?.dataProducts?.productDetailsUrlTemplate,
    contractDetailsUrlTemplate: editorConfig?.dataProducts?.contractDetailsUrlTemplate,
    productUriTemplate: editorConfig?.dataProducts?.productUriTemplate,
  };

  const [upstream, setUpstream] = useState({ status: upstreamUrl ? 'loading' : 'ready', entries: [] });
  const [all, setAll] = useState({ status: 'idle', products: [] });
  const [contractsByProduct, setContractsByProduct] = useState({}); // externalId -> {status, contracts}
  const [expandedNodes, setExpandedNodes] = useState(() => new Set(upstreamUrl ? [] : ['__all']));
  const [treeFilter, setTreeFilter] = useState('');

  // Load the upstream section eagerly (small, schemas inlined)
  useEffect(() => {
    if (!upstreamUrl) return;
    let cancelled = false;
    (async () => {
      const entries = await fetchUpstreamDataProducts(upstreamUrl);
      if (cancelled) return;
      setUpstream({ status: 'ready', entries });
      // Default expansion: the upstream tree down to schema level; when there
      // is no upstream, open the All section instead.
      const defaults = new Set(['__upstream']);
      buildProductEntryNodes(entries, 'up', {}).forEach((product) => {
        defaults.add(product.externalId);
        product.children.forEach((contract) => defaults.add(contract.externalId));
      });
      if (entries.length === 0) defaults.add('__all');
      setExpandedNodes(defaults);
    })();
    return () => { cancelled = true; };
  }, [upstreamUrl]);

  // Load the product list lazily, when the All section is first expanded.
  // Started-once via ref: setting the loading state re-runs this effect, so a
  // cleanup-based cancellation would abort its own fetch.
  const allLoadStarted = useRef(false);
  useEffect(() => {
    if (!productsUrl || allLoadStarted.current || !expandedNodes.has('__all')) return;
    allLoadStarted.current = true;
    setAll({ status: 'loading', products: [] });
    fetchAllDataProducts(productsUrl).then((products) => setAll({ status: 'ready', products }));
  }, [productsUrl, expandedNodes]);

  const loadContracts = (node) => {
    const productExternalId = node.productExternalId;
    setContractsByProduct((prev) => ({ ...prev, [productExternalId]: { status: 'loading', contracts: [] } }));
    fetchDataProductContracts(contractsBaseUrl, productExternalId).then((contracts) => {
      setContractsByProduct((prev) => ({ ...prev, [productExternalId]: { status: 'ready', contracts } }));
      // Auto-expand the loaded contracts down to schema level, mirroring the
      // upstream section's default expansion. The `-0-` segment is the entry
      // index buildProductEntryNodes assigns within the single-entry list.
      setExpandedNodes((prev) => {
        const next = new Set(prev);
        contracts.forEach((_, ci) => next.add(`${node.externalId}-0-c${ci}`));
        return next;
      });
    });
  };

  const toggleNode = (node) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(node.externalId)) next.delete(node.externalId); else next.add(node.externalId);
      return next;
    });
    if (node.lazyContracts && contractsBaseUrl && !contractsByProduct[node.productExternalId]) {
      loadContracts(node);
    }
  };

  const nodes = useMemo(() => {
    const roots = [];

    const upstreamNodes = buildProductEntryNodes(upstream.entries, 'up', urlTemplates);
    if (upstreamNodes.length > 0) {
      roots.push({
        externalId: '__upstream',
        name: t('browsePanel.dataProducts.upstream'),
        kind: 'section',
        children: upstreamNodes,
      });
    }

    if (productsUrl) {
      const allNodes = all.products.map((product, i) => {
        const contractsState = contractsByProduct[product.externalId];
        if (contractsState?.status === 'ready') {
          const node = buildProductEntryNodes([{ dataProduct: product, contracts: contractsState.contracts }], `alldp-${i}`, urlTemplates)[0];
          // Keep the id stable across the lazy load, so the expansion state
          // (keyed before the fetch) still applies to the loaded node.
          node.externalId = `alldp-${i}`;
          if (node.children.length === 0) {
            node.children = [infoNode(`alldp-${i}-empty`, t('browsePanel.dataProducts.noContracts'))];
          }
          return node;
        }
        return {
          externalId: `alldp-${i}`,
          name: product.name || product.externalId,
          description: product.description,
          kind: 'product',
          iconUrl: product.iconUrl,
          meta: { externalId: product.externalId },
          detailsUrl: resolveDetailsUrl(urlTemplates.productDetailsUrlTemplate, product.externalId),
          lazyContracts: true,
          productExternalId: product.externalId,
          expandable: true,
          children: contractsState?.status === 'loading'
            ? [infoNode(`alldp-${i}-loading`, t('browsePanel.loading'))]
            : [],
        };
      });
      roots.push({
        externalId: '__all',
        name: t('browsePanel.dataProducts.all'),
        kind: 'section',
        expandable: true,
        children: all.status === 'ready' && allNodes.length === 0
          ? [infoNode('__all-empty', t('browsePanel.dataProducts.empty'))]
          : all.status === 'loading'
            ? [infoNode('__all-loading', t('browsePanel.loading'))]
            : allNodes,
      });
    }

    return roots;
  }, [upstream.entries, all, contractsByProduct, productsUrl, urlTemplates.productDetailsUrlTemplate, urlTemplates.contractDetailsUrlTemplate, urlTemplates.productUriTemplate, t]);

  const filteredNodes = useMemo(
    () => (treeFilter ? filterTree(nodes, treeFilter) : nodes),
    [nodes, treeFilter]
  );

  // While filtering, show everything expanded; manual expansion state applies otherwise
  const effectiveExpandedNodes = useMemo(
    () => (treeFilter ? collectExpandableIds(filteredNodes) : expandedNodes),
    [treeFilter, filteredNodes, expandedNodes]
  );

  const isLoading = upstream.status === 'loading';

  return (
    <div className="h-full flex flex-col">
      <BrowseSearchInput value={treeFilter} onChange={setTreeFilter} placeholder={t('browsePanel.search')} />
      <div className="flex-1 overflow-y-auto px-2 py-1">
        {isLoading && <LoadingSpinner text={t('browsePanel.loading')} />}
        {!isLoading && filteredNodes.length === 0 && (
          <EmptyState text={treeFilter ? t('browsePanel.noMatches') : t('browsePanel.dataProducts.empty')} />
        )}
        {!isLoading && filteredNodes.map((node) => (
          <DataProductTreeNode
            key={node.externalId}
            node={node}
            depth={0}
            expandedNodes={effectiveExpandedNodes}
            toggleNode={toggleNode}
            sourcedProperties={sourcedProperties}
            setHoveredContractLink={setHoveredContractLink}
          />
        ))}
      </div>
    </div>
  );
}

function DataProductNodeTooltip({ node, t }) {
  const facts = [];
  const add = (label, value) => {
    if (value !== undefined && value !== null && value !== '') facts.push([label, String(value)]);
  };
  if (node.kind === 'product') {
    add(t('browsePanel.tooltip.id'), node.meta?.externalId);
  }
  if (node.kind === 'contract') {
    add(t('browsePanel.tooltip.dataContract'), node.meta?.contractTitle);
    add(t('browsePanel.tooltip.id'), node.meta?.externalId);
    add(t('browsePanel.tooltip.version'), node.meta?.version);
    add(t('browsePanel.tooltip.type'), node.meta?.serverType);
  }
  if (node.kind === 'schema') {
    add(t('browsePanel.tooltip.physicalName'), node.meta?.physicalName);
  }
  if (node.kind === 'property') {
    const property = node.property || {};
    const type = [property.logicalType, property.physicalType].filter(Boolean).join(' / ');
    add(t('browsePanel.tooltip.type'), type);
    if (property.required) add(t('browsePanel.tooltip.required'), t('browsePanel.tooltip.yes'));
    add(t('browsePanel.tooltip.classification'), property.classification);
    if (property.examples?.length) add(t('browsePanel.tooltip.examples'), property.examples.join(', '));
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

function DataProductTreeNode({ node, depth, expandedNodes, toggleNode, sourcedProperties, setHoveredContractLink }) {
  const { t } = useTranslation();
  const sourcedBy = (node.sourcedKeys || []).map((key) => sourcedProperties.get(key)).find(Boolean) || null;

  // Reverse cross-highlight: a sourced property row is hovered in the schema editor
  const hoveredSchemaProperty = useEditorStore((state) => state.hoveredSchemaProperty);
  const isReverseHighlighted = !!(node.sourcedKeys || []).some((key) => hoveredSchemaProperty?.sourcedKeys?.includes(key));
  const hasChildren = node.children && node.children.length > 0;
  const canExpand = hasChildren || node.expandable;
  const isExpanded = expandedNodes.has(node.externalId);
  const isDraggable = node.kind === 'property';

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `browse-dp-${node.externalId}`,
    data: { source: 'browse', kind: 'dataProduct', property: node.property, origin: node.origin },
    disabled: !isDraggable,
  });

  if (node.kind === 'info') {
    return (
      <div className="py-1 text-xs italic text-gray-400" style={{ paddingLeft: `${depth * 16 + 24}px` }}>
        {node.name}
      </div>
    );
  }

  const hasTooltip = node.kind !== 'section' && !isDragging;
  const row = (
      <div
        ref={setNodeRef}
        {...(isDraggable ? { ...attributes, ...listeners } : {})}
        className={`group flex items-center gap-1 py-1 pr-1 rounded-md min-w-0 ${isDraggable ? 'cursor-grab active:cursor-grabbing' : canExpand ? 'cursor-pointer' : ''} ${isReverseHighlighted ? 'bg-blue-50 ring-1 ring-inset ring-blue-300' : sourcedBy ? 'hover:bg-blue-50' : 'hover:bg-gray-50'} ${isDragging ? 'opacity-40' : ''}`}
        style={{ paddingLeft: `${depth * 16 + 4}px` }}
        onClick={() => { if (canExpand) toggleNode(node); }}
        onMouseEnter={sourcedBy ? () => setHoveredContractLink({ type: 'sourced', keys: node.sourcedKeys }) : undefined}
        onMouseLeave={sourcedBy ? () => setHoveredContractLink(null) : undefined}
      >
        <TreeChevron hasChildren={canExpand} isExpanded={isExpanded}
          onToggle={(e) => { e.stopPropagation(); toggleNode(node); }} />
        <NodeIcon node={node} />
        {node.kind === 'section' ? (
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 truncate min-w-0">{node.name}</span>
        ) : (
          <span className={`text-sm truncate min-w-0 text-gray-900 ${node.kind !== 'property' || sourcedBy ? 'font-medium' : ''}`}>{node.name}</span>
        )}
        {sourcedBy && (
          <LinkedBadge tooltip={t('browsePanel.linkedTo', { properties: sourcedBy.join(', ') })}>
            <LinkIcon className="h-3.5 w-3.5 text-blue-400" />
          </LinkedBadge>
        )}
        <span className="flex-1" />
        {node.logicalType && (
          <span className="text-xs text-gray-500 font-mono flex-shrink-0">{node.logicalType}</span>
        )}
        <OpenDetailsButton url={node.detailsUrl} label={t('browsePanel.openDetails')} />
      </div>
  );

  return (
    <div>
      {hasTooltip
        ? <Tooltip placement="bottom-start" variant="light" delay={500} className="block" content={<DataProductNodeTooltip node={node} t={t} />}>{row}</Tooltip>
        : row}
      {isExpanded && hasChildren && node.children.map((child) => (
        <DataProductTreeNode
          key={child.externalId}
          node={child}
          depth={depth + 1}
          expandedNodes={expandedNodes}
          toggleNode={toggleNode}
          sourcedProperties={sourcedProperties}
          setHoveredContractLink={setHoveredContractLink}
        />
      ))}
    </div>
  );
}
