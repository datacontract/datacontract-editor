import dagre from 'dagre';
import { resolveReference } from '../../lib/relationshipReferences.js';

/**
 * Build a map of { schemaName: Set<propertyName> } of properties that are
 * the target of at least one inbound `relationships.to` reference. Used by
 * the keys-only collapse mode so referenced rows stay visible (their
 * handles are required for edges), and by the layout so collapsed nodes
 * are sized based on the rows that will actually render.
 */
export const buildReferencedByName = (schemas) => {
  const result = {};
  if (!Array.isArray(schemas)) return result;

  schemas.forEach((s) => {
    if (s?.name && typeof s.name === 'string') result[s.name] = new Set();
  });
  const schemaNames = Object.keys(result);

  schemas.forEach((s) => {
    s?.properties?.forEach((p) => {
      (p?.relationships || []).forEach((rel) => {
        if (typeof rel?.to !== 'string') return;
        const target = resolveReference(rel.to, schemas, schemaNames);
        if (!target || target.propertyIndex === -1) return;
        const targetSchema = schemas[target.schemaIndex];
        const targetProp = targetSchema.properties[target.propertyIndex];
        if (result[targetSchema.name] && targetProp?.name) {
          result[targetSchema.name].add(targetProp.name);
        }
      });
    });
  });

  return result;
};

/**
 * Determine whether a property row is rendered in keys-only collapse mode.
 * Mirrors the filter in SchemaNode.jsx: the row is kept when the property
 * is a primary key, owns at least one relationship (FK), or is referenced
 * by an inbound relationship.
 */
const isVisibleInKeysMode = (prop, referenced) => {
  if (!prop) return false;
  if (prop.primaryKey) return true;
  if (Array.isArray(prop.relationships) && prop.relationships.length > 0) return true;
  if (referenced && referenced.has(prop.name)) return true;
  return false;
};

/**
 * Estimate the rendered width of a text string at ~14px font size.
 * Uses approximate character widths for proportional fonts.
 */
const estimateTextWidth = (text) => {
  if (!text) return 0;
  const str = String(text);
  // Average ~7px per character at text-sm (14px) for proportional fonts
  return str.length * 7;
};

/**
 * Estimate the rendered width of a schema node based on its content.
 * Accounts for property names, type labels (physical or logical), and padding.
 * In keys-only mode, only visible rows contribute to maxPropertyWidth.
 */
const estimateNodeWidth = (schema, mode = 'full', referenced = new Set()) => {
  const minWidth = 250;
  const padding = 70; // left pad + icon + gaps + right pad + handles
  const typeGap = 16; // gap between name and type

  // Header width: icon + schema name
  const headerWidth = 30 + estimateTextWidth(schema.name);

  // Find widest property row (only visible rows count in keys mode)
  const properties = schema.properties || [];
  const rows = mode === 'keys'
    ? properties.filter((p) => isVisibleInKeysMode(p, referenced))
    : properties;

  let maxPropertyWidth = 0;
  for (const prop of rows) {
    const displayType = prop.physicalType || prop.logicalType || '';
    const rowWidth = estimateTextWidth(prop.name) + typeGap + estimateTextWidth(displayType);
    if (rowWidth > maxPropertyWidth) maxPropertyWidth = rowWidth;
  }

  return Math.max(minWidth, headerWidth + padding, maxPropertyWidth + padding);
};

/**
 * Estimate the rendered height of a schema node.
 * Accounts for top-level properties, nested object properties, and array items.
 * In keys-only mode, only visible rows contribute and a footer button is added
 * when any rows are hidden (matches the "+N hidden · Show all" button).
 */
const estimateNodeHeight = (schema, mode = 'full', referenced = new Set()) => {
  const headerHeight = 44; // schema name header + accent bar
  const propertyRowHeight = 40;
  const nestedRowHeight = 30;
  const emptyStateHeight = 40;
  const bottomPadding = 8;
  const keysFooterHeight = 28; // "+N hidden · Show all" button in SchemaNode

  const properties = schema.properties || [];
  if (properties.length === 0) return headerHeight + emptyStateHeight + bottomPadding;

  const rows = mode === 'keys'
    ? properties.filter((p) => isVisibleInKeysMode(p, referenced))
    : properties;
  const hiddenCount = mode === 'keys' ? properties.length - rows.length : 0;

  // Empty keys-only node (no PK/FK/referenced rows): header + footer only.
  if (mode === 'keys' && rows.length === 0) {
    return headerHeight + (hiddenCount > 0 ? keysFooterHeight : 0) + bottomPadding;
  }

  let totalHeight = headerHeight;

  for (const prop of rows) {
    totalHeight += propertyRowHeight;

    // Nested object properties
    if (prop.properties?.length) {
      totalHeight += prop.properties.length * nestedRowHeight;
    }

    // Array items row + nested array item properties
    if (prop.logicalType === 'array' && prop.items) {
      totalHeight += nestedRowHeight; // items[] row
      if (prop.items.properties?.length) {
        totalHeight += prop.items.properties.length * nestedRowHeight;
      }
      // Nested array of arrays
      if (prop.items.logicalType === 'array' && prop.items.items) {
        totalHeight += nestedRowHeight;
      }
    }
  }

  if (mode === 'keys' && hiddenCount > 0) totalHeight += keysFooterHeight;

  return totalHeight + bottomPadding;
};

/**
 * Layout nodes using the Dagre graph layout algorithm.
 * @param {Array} schemas - Array of schema objects to layout
 * @param {Object} [options]
 * @param {Object} [options.collapseState] - Map of `{ schemaName: 'full' | 'keys' }`.
 *   Schemas in `'keys'` mode are sized based on only the rows that SchemaNode
 *   will actually render (PK, FK, referenced), plus the footer button.
 * @param {Object} [options.referencedByName] - Map of `{ schemaName: Set<propName> }`
 *   of properties targeted by inbound relationships. Use `buildReferencedByName`
 *   to construct it.
 * @returns {Array} - Schemas with calculated positions
 */
export const getLayoutedElements = (schemas, { collapseState = {}, referencedByName = {} } = {}) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({
    rankdir: 'LR',
    nodesep: 60,
    ranksep: 100,
    edgesep: 20,
    marginx: 40,
    marginy: 40,
    ranker: 'network-simplex'
  });

  // Add nodes with content-aware size estimates
  const nodeSizes = {};
  schemas.forEach((schema, index) => {
    const mode = collapseState[schema?.name] === 'keys' ? 'keys' : 'full';
    const referenced = referencedByName[schema?.name] || new Set();
    const nodeWidth = estimateNodeWidth(schema, mode, referenced);
    const nodeHeight = estimateNodeHeight(schema, mode, referenced);
    nodeSizes[index] = { width: nodeWidth, height: nodeHeight };
    dagreGraph.setNode(`schema-${index}`, { width: nodeWidth, height: nodeHeight });
  });

  // Add edges based on property relationships
  const schemaNames = schemas.map((s) => s?.name).filter((n) => typeof n === 'string');
  schemas.forEach((schema, sourceIndex) => {
    if (!schema.properties) return;

    schema.properties.forEach((prop) => {
      const relationships = prop?.relationships || [];

      relationships.forEach(relationship => {
        const target = resolveReference(relationship?.to, schemas, schemaNames);
        if (target) {
          dagreGraph.setEdge(`schema-${target.schemaIndex}`, `schema-${sourceIndex}`);
        }
      });

      // Backward compatibility: customProperties.references
      if (prop?.customProperties?.references) {
        const target = resolveReference(prop.customProperties.references, schemas, schemaNames);
        if (target) {
          dagreGraph.setEdge(`schema-${target.schemaIndex}`, `schema-${sourceIndex}`);
        }
      }
    });
  });

  dagre.layout(dagreGraph);

  return schemas.map((schema, index) => {
    const nodeWithPosition = dagreGraph.node(`schema-${index}`);
    const { width, height } = nodeSizes[index];
    return {
      ...schema,
      position: {
        x: nodeWithPosition.x - width / 2,
        y: nodeWithPosition.y - height / 2,
      },
    };
  });
};

/**
 * Calculate grid-based position for a schema node (fallback)
 * @param {number} index - Index of the schema in the array
 * @returns {Object} - Position object with x and y coordinates
 */
export const getGridPosition = (index) => {
  const cols = 3;
  const nodeWidth = 300;
  const nodeHeight = 400;
  const startX = 50;
  const startY = 50;

  return {
    x: startX + (index % cols) * nodeWidth,
    y: startY + Math.floor(index / cols) * nodeHeight
  };
};
