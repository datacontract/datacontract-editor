import dagre from 'dagre';

/**
 * Layout nodes using the Dagre graph layout algorithm
 * @param {Array} schemas - Array of schema objects to layout
 * @returns {Array} - Schemas with calculated positions
 */
export const getLayoutedElements = (schemas) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  // Configure graph for better edge handling
  dagreGraph.setGraph({
    rankdir: 'LR',  // Left to right to match our left-to-right edges
    nodesep: 80,    // Horizontal spacing between nodes
    ranksep: 150,   // Vertical spacing between ranks
    edgesep: 50,    // Spacing between edges
    marginx: 50,
    marginy: 50
  });

  // Add nodes to the graph
  schemas.forEach((schema, index) => {
    // Estimate height based on number of properties
    const propertyCount = schema.properties?.length || 0;
    const nodeHeight = Math.max(150, 80 + propertyCount * 40);
    dagreGraph.setNode(`schema-${index}`, { width: 250, height: nodeHeight });
  });

  // Add edges to the graph based on property relationships
  schemas.forEach((schema, sourceIndex) => {
    if (!schema.properties) return;

    schema.properties.forEach((prop) => {
      // Check ODCS relationships first
      const relationships = prop?.relationships || [];

      relationships.forEach(relationship => {
        const reference = relationship.to;
        if (reference && typeof reference === 'string') {
          const [targetSchemaName] = reference.split('.');

          // Find the target schema index
          const targetIndex = schemas.findIndex(s => s?.name === targetSchemaName);

          if (targetIndex !== -1) {
            // Add edge to Dagre graph (reversed direction: target -> source)
            // The referenced schema should point to the schema with the reference
            dagreGraph.setEdge(`schema-${targetIndex}`, `schema-${sourceIndex}`);
          }
        }
      });

      // Backward compatibility: also check customProperties.references
      if (prop?.customProperties?.references) {
        const [targetSchemaName] = prop.customProperties.references.split('.');

        // Find the target schema index
        const targetIndex = schemas.findIndex(s => s?.name === targetSchemaName);

        if (targetIndex !== -1) {
          // Add edge to Dagre graph (reversed direction: target -> source)
          // The referenced schema should point to the schema with the reference
          dagreGraph.setEdge(`schema-${targetIndex}`, `schema-${sourceIndex}`);
        }
      }
    });
  });

  // Run the layout algorithm
  dagre.layout(dagreGraph);

  // Apply calculated positions to schemas
  return schemas.map((schema, index) => {
    const nodeWithPosition = dagreGraph.node(`schema-${index}`);
    return {
      ...schema,
      position: {
        x: nodeWithPosition.x - 125, // Center the node
        y: nodeWithPosition.y - (nodeWithPosition.height / 2),
      },
    };
  });
};

/**
 * Calculate grid-based position for a schema node
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
