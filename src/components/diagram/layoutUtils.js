import dagre from 'dagre';

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
 */
const estimateNodeWidth = (schema) => {
  const minWidth = 250;
  const padding = 70; // left pad + icon + gaps + right pad + handles
  const typeGap = 16; // gap between name and type

  // Header width: icon + schema name
  const headerWidth = 30 + estimateTextWidth(schema.name);

  // Find widest property row
  let maxPropertyWidth = 0;
  for (const prop of schema.properties || []) {
    const displayType = prop.physicalType || prop.logicalType || '';
    const rowWidth = estimateTextWidth(prop.name) + typeGap + estimateTextWidth(displayType);
    if (rowWidth > maxPropertyWidth) maxPropertyWidth = rowWidth;
  }

  return Math.max(minWidth, headerWidth + padding, maxPropertyWidth + padding);
};

/**
 * Estimate the rendered height of a schema node.
 * Accounts for top-level properties, nested object properties, and array items.
 */
const estimateNodeHeight = (schema) => {
  const headerHeight = 44; // schema name header + accent bar
  const propertyRowHeight = 40;
  const nestedRowHeight = 30;
  const emptyStateHeight = 40;
  const bottomPadding = 8;

  const properties = schema.properties || [];
  if (properties.length === 0) return headerHeight + emptyStateHeight + bottomPadding;

  let totalHeight = headerHeight;

  for (const prop of properties) {
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

  return totalHeight + bottomPadding;
};

/**
 * Layout nodes using the Dagre graph layout algorithm
 * @param {Array} schemas - Array of schema objects to layout
 * @returns {Array} - Schemas with calculated positions
 */
export const getLayoutedElements = (schemas) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({
    rankdir: 'LR',
    nodesep: 40,
    ranksep: 80,
    edgesep: 20,
    marginx: 40,
    marginy: 40
  });

  // Add nodes with content-aware size estimates
  const nodeSizes = {};
  schemas.forEach((schema, index) => {
    const nodeWidth = estimateNodeWidth(schema);
    const nodeHeight = estimateNodeHeight(schema);
    nodeSizes[index] = { width: nodeWidth, height: nodeHeight };
    dagreGraph.setNode(`schema-${index}`, { width: nodeWidth, height: nodeHeight });
  });

  // Add edges based on property relationships
  schemas.forEach((schema, sourceIndex) => {
    if (!schema.properties) return;

    schema.properties.forEach((prop) => {
      const relationships = prop?.relationships || [];

      relationships.forEach(relationship => {
        const reference = relationship.to;
        if (reference && typeof reference === 'string') {
          const [targetSchemaName] = reference.split('.');
          const targetIndex = schemas.findIndex(s => s?.name === targetSchemaName);
          if (targetIndex !== -1) {
            dagreGraph.setEdge(`schema-${targetIndex}`, `schema-${sourceIndex}`);
          }
        }
      });

      // Backward compatibility: customProperties.references
      if (prop?.customProperties?.references) {
        const [targetSchemaName] = prop.customProperties.references.split('.');
        const targetIndex = schemas.findIndex(s => s?.name === targetSchemaName);
        if (targetIndex !== -1) {
          dagreGraph.setEdge(`schema-${targetIndex}`, `schema-${sourceIndex}`);
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
