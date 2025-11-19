import { useCallback, useEffect, useState, useMemo, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  Panel,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import './DiagramStyles.css';
import * as YAML from 'yaml';
import { useEditorStore } from '../../store.js';
import SchemaNode from './SchemaNode.jsx';
import { useLocation } from 'react-router-dom';
import { getLayoutedElements, getGridPosition } from './layoutUtils.js';
import PropertyDetailsNode from './PropertyDetailsNode.jsx';

const defaultEdgeOptions = {
  style: { strokeWidth: 2, stroke: '#6366f1' },
};

const DiagramViewInner = () => {
  const yaml = useEditorStore((state) => state.yaml);
  const setYaml = useEditorStore((state) => state.setYaml);
  const currentView = useEditorStore((state) => state.currentView);

  // Memoize nodeTypes to prevent recreation on each render
  const nodeTypes = useMemo(() => ({
    schemaNode: SchemaNode,
    propertyDetails: PropertyDetailsNode,
  }), []);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [showHelp, setShowHelp] = useState(false);
  const location = useLocation();
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const lastFocusedIndexRef = useRef(null);

  // Track open property details panel
  const [openPropertyDetails, setOpenPropertyDetails] = useState(null);
  const [propertyDetailsOpenMethod, setPropertyDetailsOpenMethod] = useState('hover'); // 'hover' or 'click'
  const [isPanelPinned, setIsPanelPinned] = useState(false);

  // Parse schemas from YAML
  const parsedData = useMemo(() => {
    if (!yaml?.trim()) {
      return null;
    }
    try {
      return YAML.parse(yaml);
    } catch {
      return null;
    }
  }, [yaml]);

  // Update YAML with modified schemas
  const updateSchemas = useCallback((updatedSchemas) => {
    if (!parsedData) return;

    const newData = { ...parsedData, schema: updatedSchemas };
    const newYaml = YAML.stringify(newData);
    setYaml(newYaml);
  }, [parsedData, setYaml]);

  // Handle node changes (but don't save positions to YAML)
  const handleNodesChange = useCallback((changes) => {
    onNodesChange(changes);
  }, [onNodesChange]);

  // Handle adding a new property to a schema
  const handleAddProperty = useCallback((nodeId, newProperty) => {
    if (!parsedData?.schema) return;

    const schemaIndex = parseInt(nodeId.replace('schema-', ''));
    const updatedSchemas = [...parsedData.schema];

    if (updatedSchemas[schemaIndex]) {
      const schema = updatedSchemas[schemaIndex];
      const properties = schema.properties || [];
      updatedSchemas[schemaIndex] = {
        ...schema,
        properties: [...properties, newProperty],
      };
      updateSchemas(updatedSchemas);
    }
  }, [parsedData, updateSchemas]);

  // Handle adding a nested property to an object-type property
  const handleAddNestedProperty = useCallback((nodeId, propertyIndex) => {
    if (!parsedData?.schema) return;

    const schemaIndex = parseInt(nodeId.replace('schema-', ''));
    const updatedSchemas = [...parsedData.schema];

    if (updatedSchemas[schemaIndex]) {
      const schema = updatedSchemas[schemaIndex];
      const properties = [...(schema.properties || [])];

      if (properties[propertyIndex]) {
        const property = { ...properties[propertyIndex] };

        // Initialize properties array if it doesn't exist
        if (!property.properties) {
          property.properties = [];
        }

        // Add new nested property
        property.properties = [
          ...property.properties,
          {
            name: '',
            logicalType: '',
            description: ''
          }
        ];

        properties[propertyIndex] = property;
        updatedSchemas[schemaIndex] = {
          ...schema,
          properties
        };

        updateSchemas(updatedSchemas);
      }
    }
  }, [parsedData, updateSchemas]);

  // Handle deleting a property from a schema
  const handleDeleteProperty = useCallback((nodeId, propertyIndex) => {
    if (!parsedData?.schema) return;

    const schemaIndex = parseInt(nodeId.replace('schema-', ''));
    const updatedSchemas = [...parsedData.schema];

    if (updatedSchemas[schemaIndex]) {
      const schema = updatedSchemas[schemaIndex];
      const properties = [...(schema.properties || [])];
      properties.splice(propertyIndex, 1);
      updatedSchemas[schemaIndex] = {
        ...schema,
        properties,
      };
      updateSchemas(updatedSchemas);
    }
  }, [parsedData, updateSchemas]);

  // Handle updating a schema
  const handleUpdateSchema = useCallback((nodeId, updatedSchema) => {
    if (!parsedData?.schema) return;

    const schemaIndex = parseInt(nodeId.replace('schema-', ''));
    const updatedSchemas = [...parsedData.schema];

    if (updatedSchemas[schemaIndex]) {
      updatedSchemas[schemaIndex] = updatedSchema;
      updateSchemas(updatedSchemas);
    }
  }, [parsedData, updateSchemas]);

  // Handle deleting a schema
  const handleDeleteSchema = useCallback((nodeId) => {
    if (!parsedData?.schema) return;

    const schemaIndex = parseInt(nodeId.replace('schema-', ''));
    const updatedSchemas = [...parsedData.schema];
    updatedSchemas.splice(schemaIndex, 1);
    updateSchemas(updatedSchemas);
  }, [parsedData, updateSchemas]);

  // Handle adding a new schema
  const handleAddSchema = useCallback(() => {
    const updatedSchemas = [...(parsedData?.schema || [])];
    const schemaCount = updatedSchemas.length + 1;
    const newSchema = {
      name: `schema_${schemaCount}`,
      businessName: `Schema ${schemaCount}`,
      physicalType: 'table',
      properties: [],
    };

    updatedSchemas.push(newSchema);
    updateSchemas(updatedSchemas);
  }, [parsedData, updateSchemas]);

  // Handle showing property details with position
  const handleShowPropertyDetails = useCallback((nodeId, propertyIndex, nodePosition, propertyOffset, openMethod = 'hover', nestedIndex = null) => {
    if (!parsedData?.schema) return;

    // If a panel is pinned and this is a hover event, don't open a new panel
    if (isPanelPinned && openMethod === 'hover') {
      return;
    }

    // If clicking on the same property that's already open, toggle pin state
    if (openMethod === 'click' &&
        openPropertyDetails?.nodeId === nodeId &&
        openPropertyDetails?.propertyIndex === propertyIndex &&
        openPropertyDetails?.nestedIndex === nestedIndex) {
      setIsPanelPinned(!isPanelPinned);
      return;
    }

    const schemaIndex = parseInt(nodeId.replace('schema-', ''));
    const schema = parsedData.schema[schemaIndex];
    let property;

    // Get the property (either top-level or nested)
    if (nestedIndex !== null && nestedIndex !== undefined) {
      const parentProperty = schema?.properties?.[propertyIndex];
      property = parentProperty?.properties?.[nestedIndex];
    } else {
      property = schema?.properties?.[propertyIndex];
    }

    if (!property) return;

    // If opening via click, pin the panel by default (set this FIRST)
    if (openMethod === 'click') {
      setIsPanelPinned(true);
    } else {
      setIsPanelPinned(false);
    }

    // Calculate panel position (to the right of the node)
    const nodeWidth = 250;
    const panelX = nodePosition.x + nodeWidth + 20;
    const panelY = nodePosition.y + propertyOffset;

    // Store the open property details info
    setOpenPropertyDetails({
      nodeId,
      propertyIndex,
      nestedIndex,
      position: { x: panelX, y: panelY },
    });
    setPropertyDetailsOpenMethod(openMethod);
  }, [parsedData, isPanelPinned, openPropertyDetails]);


  // Validate connections: only allow left (source) to right (target)
  const isValidConnection = useCallback((connection) => {
    // Ensure source handle is a source type and target handle is a target type
    const isSourceValid = connection.sourceHandle?.endsWith('-source');
    const isTargetValid = connection.targetHandle?.endsWith('-target');

    return isSourceValid && isTargetValid;
  }, []);

  // Handle property connections
  const onConnect = useCallback((connection) => {
    if (!parsedData?.schema) return;

    // Parse source and target
    // Format: schema-{schemaIndex}-prop-{propIndex}-source/target
    const sourceMatch = connection.sourceHandle?.match(/schema-(\d+)-prop-(\d+)-source/);
    const targetMatch = connection.targetHandle?.match(/schema-(\d+)-prop-(\d+)-target/);

    if (!sourceMatch || !targetMatch) return;

    const sourceSchemaIndex = parseInt(sourceMatch[1]);
    const sourcePropIndex = parseInt(sourceMatch[2]);
    const targetSchemaIndex = parseInt(targetMatch[1]);
    const targetPropIndex = parseInt(targetMatch[2]);

    const updatedSchemas = [...parsedData.schema];
    const targetSchema = updatedSchemas[targetSchemaIndex];
    const targetProperty = targetSchema?.properties?.[targetPropIndex];

    if (!targetSchema || !targetProperty) return;

    // Build reference string using ODCS shorthand: schemaName.propertyName
    const reference = `${targetSchema.name}.${targetProperty.name}`;

    // Update source property with ODCS relationship
    const sourceSchema = updatedSchemas[sourceSchemaIndex];
    if (sourceSchema?.properties?.[sourcePropIndex]) {
      updatedSchemas[sourceSchemaIndex] = {
        ...sourceSchema,
        properties: sourceSchema.properties.map((prop, idx) => {
          if (idx === sourcePropIndex) {
            // Get existing relationships or create new array
            const existingRelationships = prop.relationships || [];

            // Check if this relationship already exists
            const relationshipExists = existingRelationships.some(
              rel => rel.to === reference
            );

            // Only add if it doesn't already exist
            const newRelationships = relationshipExists
              ? existingRelationships
              : [...existingRelationships, { type: 'foreignKey', to: reference }];

            return {
              ...prop,
              relationships: newRelationships
            };
          }
          return prop;
        })
      };

      updateSchemas(updatedSchemas);
    }
  }, [parsedData, updateSchemas]);

  // Handle edge deletion
  const onEdgesDelete = useCallback((edgesToDelete) => {
    if (!parsedData?.schema) return;

    const updatedSchemas = [...parsedData.schema];
    let hasChanges = false;

    edgesToDelete.forEach(edge => {
      // Parse edge ID: edge-{sourceSchemaIndex}-{sourcePropIndex}-{targetSchemaIndex}-{targetPropIndex}
      const match = edge.id.match(/edge-(\d+)-(\d+)-(\d+)-(\d+)/);
      if (match) {
        const sourceSchemaIndex = parseInt(match[1]);
        const sourcePropIndex = parseInt(match[2]);
        const targetSchemaIndex = parseInt(match[3]);
        const targetPropIndex = parseInt(match[4]);

        const sourceSchema = updatedSchemas[sourceSchemaIndex];
        const targetSchema = updatedSchemas[targetSchemaIndex];
        const targetProperty = targetSchema?.properties?.[targetPropIndex];

        if (sourceSchema?.properties?.[sourcePropIndex] && targetSchema && targetProperty) {
          // Build the reference string that we need to remove
          const reference = `${targetSchema.name}.${targetProperty.name}`;

          updatedSchemas[sourceSchemaIndex] = {
            ...sourceSchema,
            properties: sourceSchema.properties.map((prop, idx) => {
              if (idx === sourcePropIndex) {
                const updatedProp = { ...prop };

                // Remove the relationship entry that matches this reference
                if (updatedProp.relationships && Array.isArray(updatedProp.relationships)) {
                  updatedProp.relationships = updatedProp.relationships.filter(
                    rel => rel.to !== reference
                  );

                  // Remove the relationships array if it's now empty
                  if (updatedProp.relationships.length === 0) {
                    delete updatedProp.relationships;
                  }
                }

                return updatedProp;
              }
              return prop;
            })
          };
          hasChanges = true;
        }
      }
    });

    if (hasChanges) {
      updateSchemas(updatedSchemas);
    }
  }, [parsedData, updateSchemas]);

  // Auto-layout function (updates node positions without saving to YAML)
  const handleAutoLayout = useCallback(() => {
    if (!parsedData?.schema || !nodes.length) return;

    const layoutedSchemas = getLayoutedElements(parsedData.schema);

    // Update node positions in ReactFlow state only, don't save to YAML
    setNodes(currentNodes =>
      currentNodes.map((node, index) => ({
        ...node,
        position: layoutedSchemas[index]?.position || node.position
      }))
    );

    // Automatically fit view after layout with a small delay
    if (reactFlowInstance) {
      setTimeout(() => {
        reactFlowInstance.fitView({
          padding: 0.2,
          duration: 800,
        });
      }, 50);
    }
  }, [parsedData, nodes, setNodes, reactFlowInstance]);

  // Convert schemas to nodes and edges
  useEffect(() => {
    if (!parsedData?.schema || !Array.isArray(parsedData.schema)) {
      setNodes([]);
      setEdges([]);
      return;
    }

    const schemaNodes = parsedData.schema
      .filter(schema => schema != null)
      .map((schema, index) => ({
        id: `schema-${index}`,
        type: 'schemaNode',
        position: getGridPosition(index),
        data: {
          schema,
          onAddProperty: handleAddProperty,
          onAddNestedProperty: handleAddNestedProperty,
          onDeleteProperty: handleDeleteProperty,
          onUpdateSchema: handleUpdateSchema,
          onDeleteSchema: handleDeleteSchema,
          onShowPropertyDetails: handleShowPropertyDetails,
        },
      }));

    // Build edges from property relationships
    const propertyEdges = [];
    parsedData.schema
      .filter(schema => schema != null)
      .forEach((sourceSchema, sourceSchemaIndex) => {
        sourceSchema.properties?.forEach((sourceProp, sourcePropIndex) => {
          // Check for ODCS relationships first
          const relationships = sourceProp.relationships || [];

          relationships.forEach(relationship => {
            const reference = relationship.to;
            if (reference && typeof reference === 'string') {
              // Parse reference: schemaName.propertyName
              const [targetSchemaName, targetPropertyName] = reference.split('.');

              // Find target schema and property
              const targetSchemaIndex = parsedData.schema.findIndex(
                s => s != null && s.name === targetSchemaName
              );

              if (targetSchemaIndex !== -1) {
                const targetSchema = parsedData.schema[targetSchemaIndex];
                const targetPropIndex = targetSchema.properties?.findIndex(
                  p => p != null && p.name === targetPropertyName
                );

                if (targetPropIndex !== -1) {
                  // The property with the relationship is the source (left handle)
                  // The referenced property is the target (right handle)
                  propertyEdges.push({
                    id: `edge-${sourceSchemaIndex}-${sourcePropIndex}-${targetSchemaIndex}-${targetPropIndex}`,
                    source: `schema-${sourceSchemaIndex}`,
                    sourceHandle: `schema-${sourceSchemaIndex}-prop-${sourcePropIndex}-source`,
                    target: `schema-${targetSchemaIndex}`,
                    targetHandle: `schema-${targetSchemaIndex}-prop-${targetPropIndex}-target`,
                    type: 'default',
                    selectable: true,
                    deletable: true,
                    focusable: true,
                    interactionWidth: 20,
                    style: { stroke: '#6366f1', strokeWidth: 2 },
                  });
                }
              }
            }
          });

          // Backward compatibility: also check customProperties.references
          const legacyReference = sourceProp.customProperties?.references;
          if (legacyReference && typeof legacyReference === 'string') {
            // Parse reference: schemaName.propertyName
            const [targetSchemaName, targetPropertyName] = legacyReference.split('.');

            // Find target schema and property
            const targetSchemaIndex = parsedData.schema.findIndex(
              s => s != null && s.name === targetSchemaName
            );

            if (targetSchemaIndex !== -1) {
              const targetSchema = parsedData.schema[targetSchemaIndex];
              const targetPropIndex = targetSchema.properties?.findIndex(
                p => p != null && p.name === targetPropertyName
              );

              if (targetPropIndex !== -1) {
                // Check if this edge already exists (to avoid duplicates)
                const edgeId = `edge-${sourceSchemaIndex}-${sourcePropIndex}-${targetSchemaIndex}-${targetPropIndex}`;
                const edgeExists = propertyEdges.some(edge => edge.id === edgeId);

                if (!edgeExists) {
                  propertyEdges.push({
                    id: edgeId,
                    source: `schema-${sourceSchemaIndex}`,
                    sourceHandle: `schema-${sourceSchemaIndex}-prop-${sourcePropIndex}-source`,
                    target: `schema-${targetSchemaIndex}`,
                    targetHandle: `schema-${targetSchemaIndex}-prop-${targetPropIndex}-target`,
                    type: 'default',
                    selectable: true,
                    deletable: true,
                    focusable: true,
                    interactionWidth: 20,
                    style: { stroke: '#6366f1', strokeWidth: 2 },
                  });
                }
              }
            }
          }
        });
      });

    // Add property details node if one is open
    let finalNodes = schemaNodes;
    if (openPropertyDetails) {
      const schemaIndex = parseInt(openPropertyDetails.nodeId.replace('schema-', ''));
      const schema = parsedData.schema[schemaIndex];
      const isNested = openPropertyDetails.nestedIndex !== null && openPropertyDetails.nestedIndex !== undefined;

      let property;
      if (isNested) {
        const parentProperty = schema?.properties?.[openPropertyDetails.propertyIndex];
        property = parentProperty?.properties?.[openPropertyDetails.nestedIndex];
      } else {
        property = schema?.properties?.[openPropertyDetails.propertyIndex];
      }

      if (property) {
        // Determine if panel should be pinned based on current state and open method
        const shouldBePinned = propertyDetailsOpenMethod === 'click' ? isPanelPinned : false;

        const detailsNode = {
          id: 'property-details',
          type: 'propertyDetails',
          position: openPropertyDetails.position,
          data: {
            property,
            openMethod: propertyDetailsOpenMethod,
            initialPinned: shouldBePinned,
            onUpdate: (updatedProperty) => {
              const updatedSchemas = [...parsedData.schema];

              if (isNested) {
                // Update nested property
                const properties = [...(schema.properties || [])];
                const parentProperty = { ...properties[openPropertyDetails.propertyIndex] };
                const nestedProperties = [...(parentProperty.properties || [])];
                nestedProperties[openPropertyDetails.nestedIndex] = updatedProperty;
                parentProperty.properties = nestedProperties;
                properties[openPropertyDetails.propertyIndex] = parentProperty;
                updatedSchemas[schemaIndex] = {
                  ...schema,
                  properties,
                };
              } else {
                // Update top-level property
                const properties = [...(schema.properties || [])];
                properties[openPropertyDetails.propertyIndex] = updatedProperty;
                updatedSchemas[schemaIndex] = {
                  ...schema,
                  properties,
                };
              }

              updateSchemas(updatedSchemas);
            },
            onDelete: () => {
              const updatedSchemas = [...parsedData.schema];

              if (isNested) {
                // Delete nested property
                const properties = [...(schema.properties || [])];
                const parentProperty = { ...properties[openPropertyDetails.propertyIndex] };
                const nestedProperties = [...(parentProperty.properties || [])];
                nestedProperties.splice(openPropertyDetails.nestedIndex, 1);
                parentProperty.properties = nestedProperties;
                properties[openPropertyDetails.propertyIndex] = parentProperty;
                updatedSchemas[schemaIndex] = {
                  ...schema,
                  properties,
                };
              } else {
                // Delete top-level property
                const properties = [...(schema.properties || [])];
                properties.splice(openPropertyDetails.propertyIndex, 1);
                updatedSchemas[schemaIndex] = {
                  ...schema,
                  properties,
                };
              }

              updateSchemas(updatedSchemas);
              setOpenPropertyDetails(null);
              setIsPanelPinned(false);
            },
            onClose: () => {
              setOpenPropertyDetails(null);
              setIsPanelPinned(false);
            },
            onPinnedChange: (pinned) => {
              setIsPanelPinned(pinned);
            },
          },
          draggable: false,
          selectable: false,
          focusable: true,
        };
        finalNodes = [...schemaNodes, detailsNode];
      }
    }

    setNodes(finalNodes);
    setEdges(propertyEdges);
  }, [parsedData, handleAddProperty, handleDeleteProperty, handleUpdateSchema, handleDeleteSchema, handleShowPropertyDetails, openPropertyDetails, propertyDetailsOpenMethod, isPanelPinned, updateSchemas, setNodes, setEdges]);

  // Focus on selected schema when coming from sidebar
  useEffect(() => {
    const focusSchemaIndex = location.state?.focusSchemaIndex;

    // Only focus if we have a valid index and haven't already focused on this index
    if (focusSchemaIndex != null &&
        reactFlowInstance &&
        nodes.length > 0 &&
        lastFocusedIndexRef.current !== focusSchemaIndex) {

      const nodeId = `schema-${focusSchemaIndex}`;
      const node = nodes.find(n => n.id === nodeId);

      if (node) {
        lastFocusedIndexRef.current = focusSchemaIndex;

        // Small delay to ensure ReactFlow is fully rendered
        setTimeout(() => {
          // Focus on the node
          reactFlowInstance.fitView({
            padding: 0.5,
            nodes: [node],
            duration: 800,
          });

          // Update node to show selected state
          setNodes(prevNodes =>
            prevNodes.map(n => ({
              ...n,
              selected: n.id === nodeId,
            }))
          );
        }, 100);
      }
    }
  }, [location.state?.focusSchemaIndex, reactFlowInstance, nodes, setNodes]);

  if (!parsedData) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <div className="text-center">
          <p className="text-sm font-medium">Invalid YAML</p>
          <p className="text-xs">Fix YAML errors to see the diagram</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onEdgesDelete={onEdgesDelete}
        onConnect={onConnect}
        isValidConnection={isValidConnection}
        connectionMode="loose"
        onInit={setReactFlowInstance}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        fitViewOptions={{
          padding: 0.2,
          minZoom: 0.1,
          maxZoom: 1.5
        }}
        attributionPosition="bottom-left"
        edgesReconnectable={false}
        edgesFocusable={true}
        deleteKeyCode={['Delete', 'Backspace']}
        multiSelectionKeyCode={null}
        elementsSelectable={true}
      >
        <Background />
        <Controls />

        {/* Control Panel */}
        <Panel position="top-right" className="bg-white rounded-lg shadow-lg p-4 space-y-3">
          <button
            onClick={handleAddSchema}
            className="w-full px-4 py-2 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Schema
          </button>

          <button
            onClick={handleAutoLayout}
            className="w-full px-4 py-2 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Auto Layout
          </button>

          <button
            onClick={() => setShowHelp(!showHelp)}
            className="w-full px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {showHelp ? 'Hide Help' : 'Show Help'}
          </button>

          {showHelp && (
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded text-xs space-y-2">
              <div className="font-semibold text-blue-900">Quick Tips:</div>
              <ul className="text-blue-800 space-y-1 list-disc list-inside">
                <li>Double-click schema/property names to edit</li>
                <li>Hover over properties to see connection handles</li>
                <li>Drag from right handle to left handle to link properties</li>
                <li>Select a connection and press Delete/Backspace to remove it</li>
                <li>Click PK/* buttons to toggle flags</li>
                <li>Drag nodes to reposition</li>
                <li>Use mouse wheel to zoom</li>
                <li>Click "Auto Layout" for organized view</li>
              </ul>
            </div>
          )}
        </Panel>

      </ReactFlow>
    </div>
  );
};

// Wrapper component with ReactFlowProvider
const DiagramView = () => {
  return (
    <ReactFlowProvider>
      <DiagramViewInner />
    </ReactFlowProvider>
  );
};

export default DiagramView;
