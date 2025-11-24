import { useCallback, useEffect, useState, useMemo, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  ControlButton,
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
  const setSelectedDiagramSchemaIndex = useEditorStore((state) => state.setSelectedDiagramSchemaIndex);

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
            logicalType: 'string',
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
          padding: 0.5,
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
          openPropertyDetails: openPropertyDetails?.nodeId === `schema-${index}` ? openPropertyDetails : null,
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

        // Update the selected schema in the store
        setSelectedDiagramSchemaIndex(focusSchemaIndex);

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
  }, [location.state?.focusSchemaIndex, reactFlowInstance, nodes, setNodes, setSelectedDiagramSchemaIndex]);

  // Clear selected schema when leaving diagram view
  useEffect(() => {
    return () => {
      // Cleanup: clear selected schema when component unmounts (leaving diagram view)
      setSelectedDiagramSchemaIndex(null);
    };
  }, [setSelectedDiagramSchemaIndex]);

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
        onPaneClick={() => {
          setOpenPropertyDetails(null);
          setIsPanelPinned(false);
        }}
        fitView
        fitViewOptions={{
          padding: 0.5,
          minZoom: 0.1,
          maxZoom: 1.0
        }}
        attributionPosition="bottom-right"
        edgesReconnectable={false}
        edgesFocusable={true}
        deleteKeyCode={['Delete', 'Backspace']}
        multiSelectionKeyCode={null}
        elementsSelectable={true}
      >
        <Background />
        <Controls showZoom={false} showFitView={false} showInteractive={false}>
					<ControlButton onClick={handleAddSchema} title="Add Schema">
						<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
						</svg>
					</ControlButton>
          <ControlButton onClick={() => reactFlowInstance?.zoomIn()} title="Zoom In">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4">
              <path d="M8.424 0.47212800000000005C7.210464 0.516528 6.059064 0.8152320000000001 4.968648 1.368504C4.183608 1.766856 3.56184 2.2213920000000003 2.90208 2.879232C2.226216 3.5531520000000003 1.7667599999999999 4.181544 1.357296 4.992C0.8284320000000001 6.0388079999999995 0.5420400000000001 7.117896 0.483624 8.284128C0.409488 9.763416000000001 0.70452 11.160216 1.3673039999999999 12.468C2.2933920000000003 14.295312000000001 3.9517680000000004 15.765336000000001 5.874624000000001 16.463376C6.4847280000000005 16.684872 7.057272 16.824432 7.716 16.912224000000002C8.155296 16.970784 9.295512 16.970448 9.72 16.911624C11.284583999999999 16.694856 12.52992 16.183608 13.74768 15.258168L13.99884 15.067295999999999 18.177408000000003 19.242C22.794984000000003 23.855304 22.438992 23.522688 22.760664000000002 23.524416C23.036928 23.525904 23.223888000000002 23.433552000000002 23.392656 23.212296C23.487047999999998 23.088528 23.525472 22.956864 23.524416 22.760664000000002C23.522688 22.438872 23.855688 22.795272 19.241471999999998 18.176904L15.06612 13.997784 15.257280000000002 13.748904C16.164888 12.56724 16.713768 11.23356 16.9104 9.732C16.959576000000002 9.356424 16.979208 8.500608 16.947648 8.107368000000001C16.858344000000002 6.994536000000001 16.585008000000002 6.001584 16.102488 5.037336000000001C14.87796 2.590272 12.533904 0.90744 9.84 0.541416C9.585216 0.506784 8.762784 0.451296 8.652000000000001 0.46123200000000003C8.6256 0.463608 8.523 0.46850400000000003 8.424 0.47212800000000005M8.158968 1.991976C7.07964 2.089632 6.011184 2.447208 5.124 3.0076799999999997C4.516776 3.391272 3.7454880000000004 4.10112 3.333 4.656C2.612496 5.625264 2.192112 6.658488 2.024568 7.872C1.9728 8.246903999999999 1.966512 9.115488000000001 2.0129520000000003 9.48C2.196168 10.918656 2.7660240000000003 12.181296 3.703296 13.225416C4.758144 14.400456 6.150072 15.146736 7.752 15.396168C8.089464 15.448704000000001 8.956176 15.469920000000002 9.324 15.434664C10.192704 15.351336 10.915656 15.146184 11.7012 14.760024C13.026048 14.108784 14.086344 13.056072000000002 14.742384 11.740536C15.084552 11.054400000000001 15.279623999999998 10.441104 15.400319999999999 9.672C15.462096 9.278304 15.462288 8.171712 15.400632 7.776C15.236616000000001 6.723264 14.869079999999999 5.767896 14.309616000000002 4.9400640000000005C14.087832000000002 4.611888 13.798728 4.266624 13.478040000000002 3.946968C12.922272 3.3930000000000002 12.415728 3.0294719999999997 11.724 2.688144C10.977744 2.319912 10.372176 2.132712 9.58704 2.027568C9.246264 1.98192 8.480903999999999 1.96284 8.158968 1.991976M8.518824 4.711272C8.287608 4.776624 8.10144 4.949136 8.016192 5.176992C7.970064000000001 5.30028 7.968 5.3628 7.968 6.636912000000001L7.968 7.968 6.636912000000001 7.968C5.35728 7.968 5.30076 7.969896 5.1753599999999995 8.016792C4.666224 8.207304 4.5252479999999995 8.863824000000001 4.910712 9.249288C4.962024 9.3006 5.0634 9.3708 5.136 9.405288L5.268 9.468 6.617256 9.475272L7.966488 9.482568 7.973256 10.843272L7.98 12.204 8.03808 12.317664C8.37156 12.970224000000002 9.321912000000001 12.84636 9.453768 12.133152C9.470616 12.042 9.48 11.541648 9.48 10.735584L9.48 9.48 10.722 9.479808C11.465184 9.479712000000001 12.025704000000001 9.469631999999999 12.117624000000001 9.454704000000001C12.592416 9.377664 12.8664 8.89692 12.695616000000001 8.440464C12.637680000000001 8.285616 12.478296 8.115096000000001 12.317496000000002 8.035896000000001L12.204 7.98 10.843272 7.9734240000000005L9.482568 7.966848 9.475272 6.617424L9.468 5.268 9.405288 5.136C9.246168 4.801032 8.858424 4.615248 8.518824 4.711272" stroke="none" fill="currentColor" fillRule="evenodd" strokeWidth={0.024} />
            </svg>
          </ControlButton>
          <ControlButton onClick={() => reactFlowInstance?.zoomOut()} title="Zoom Out">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4">
              <path d="M8.424 0.47212800000000005C7.210464 0.516528 6.059064 0.8152320000000001 4.968648 1.368504C4.183608 1.766856 3.56184 2.2213920000000003 2.90208 2.879232C2.226216 3.5531520000000003 1.7667599999999999 4.181544 1.357296 4.992C0.8284320000000001 6.0388079999999995 0.5420400000000001 7.117896 0.483624 8.284128C0.409488 9.763416000000001 0.70452 11.160216 1.3673039999999999 12.468C2.2933920000000003 14.295312000000001 3.9517680000000004 15.765336000000001 5.874624000000001 16.463376C6.4847280000000005 16.684872 7.057272 16.824432 7.716 16.912224000000002C8.155296 16.970784 9.295512 16.970448 9.72 16.911624C11.284583999999999 16.694856 12.52992 16.183608 13.74768 15.258168L13.99884 15.067295999999999 18.177408000000003 19.242C22.794984000000003 23.855304 22.438992 23.522688 22.760664000000002 23.524416C23.036928 23.525904 23.223888000000002 23.433552000000002 23.392656 23.212296C23.487047999999998 23.088528 23.525472 22.956864 23.524416 22.760664000000002C23.522688 22.438872 23.855688 22.795272 19.241471999999998 18.176904L15.06612 13.997784 15.257280000000002 13.748904C16.164888 12.56724 16.713768 11.23356 16.9104 9.732C16.959576000000002 9.356424 16.979208 8.500608 16.947648 8.107368000000001C16.858344000000002 6.994536000000001 16.585008000000002 6.001584 16.102488 5.037336000000001C14.87796 2.590272 12.533904 0.90744 9.84 0.541416C9.585216 0.506784 8.762784 0.451296 8.652000000000001 0.46123200000000003C8.6256 0.463608 8.523 0.46850400000000003 8.424 0.47212800000000005M8.158968 1.991976C7.07964 2.089632 6.011184 2.447208 5.124 3.0076799999999997C4.516776 3.391272 3.7454880000000004 4.10112 3.333 4.656C2.612496 5.625264 2.192112 6.658488 2.024568 7.872C1.9728 8.246903999999999 1.966512 9.115488000000001 2.0129520000000003 9.48C2.196168 10.918656 2.7660240000000003 12.181296 3.703296 13.225416C4.758144 14.400456 6.150072 15.146736 7.752 15.396168C8.089464 15.448704000000001 8.956176 15.469920000000002 9.324 15.434664C10.192848 15.351336 10.915632 15.146184 11.701584 14.759832000000001C12.385032 14.42388 12.85596 14.090592 13.412808 13.548792C13.990752 12.986424 14.395704 12.435696 14.742384 11.740536C15.084552 11.054400000000001 15.279623999999998 10.441104 15.400319999999999 9.672C15.462096 9.278304 15.462288 8.171712 15.400632 7.776C15.236616000000001 6.723264 14.869079999999999 5.767896 14.309616000000002 4.9400640000000005C14.087832000000002 4.611888 13.798728 4.266624 13.478040000000002 3.946968C12.922272 3.3930000000000002 12.415728 3.0294719999999997 11.724 2.688144C10.977744 2.319912 10.372176 2.132712 9.58704 2.027568C9.246264 1.98192 8.480903999999999 1.96284 8.158968 1.991976M5.1685680000000005 8.017848C5.000856 8.082504 4.84032 8.229840000000001 4.7610719999999995 8.391816C4.668816 8.580384 4.666584 8.834472 4.755504 9.024000000000001C4.834056 9.191448 4.9676160000000005 9.325296 5.136 9.405288L5.268 9.468 8.604000000000001 9.474744000000001C10.863936 9.479304 11.993184000000001 9.47328 12.104856000000002 9.456072C12.838536 9.343032000000001 12.985008 8.364647999999999 12.317496000000002 8.035896000000001L12.204 7.98 8.748 7.975128000000001C5.353104 7.970327999999999 5.289816 7.971096 5.1685680000000005 8.017848" stroke="none" fill="currentColor" fillRule="evenodd" strokeWidth={0.024} />
            </svg>
          </ControlButton>
          <ControlButton onClick={() => reactFlowInstance?.fitView()} title="Fit View">
						<svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" ><path d="M5.22 3.758688C5.1936 3.7640640000000003 5.1126000000000005 3.780096 5.04 3.79428C4.9674 3.8084880000000005 4.8216 3.8616240000000004 4.716 3.9123599999999996C4.359096 4.083888 4.083096 4.360056 3.9127680000000002 4.716C3.7496400000000003 5.056968 3.7560000000000002 4.953168 3.7560000000000002 7.272C3.7560000000000002 9.366384 3.756144 9.372288000000001 3.8072880000000002 9.482928000000001C3.877704 9.635208 4.01736 9.783312 4.162488000000001 9.859632C4.267944 9.91512 4.31256 9.923568000000001 4.5 9.923615999999999C4.679016 9.92364 4.73364 9.914256 4.81908 9.8688C4.977768 9.784320000000001 5.10396 9.657168 5.17728 9.507864L5.244 9.372 5.256 7.362840000000001C5.26728 5.475504 5.270592000000001 5.351088 5.31084 5.31084C5.351088 5.270592000000001 5.475024 5.26728 7.350840000000001 5.256L9.348 5.244 9.47448 5.186832C9.633312 5.115048000000001 9.820992 4.914528 9.873456000000001 4.760568C9.922776 4.615848 9.922776 4.384152 9.873456000000001 4.239432C9.820992 4.085472 9.633312 3.8849519999999997 9.47448 3.813168L9.348 3.7560000000000002 7.308 3.7524480000000002C6.186 3.750504 5.2464 3.753312 5.22 3.758688M14.657616 3.769656C14.42928 3.824592 14.198136000000002 4.02936 14.126208 4.240416C14.0772 4.3842479999999995 14.077344000000002 4.6161840000000005 14.126544 4.760568C14.179008000000001 4.914528 14.366688 5.115048000000001 14.52552 5.186832L14.652000000000001 5.244 16.649160000000002 5.256C18.524976000000002 5.26728 18.648912 5.270592000000001 18.68916 5.31084C18.729408000000003 5.351088 18.73272 5.475504 18.744 7.362840000000001C18.75588 9.351768 18.756528000000003 9.373128000000001 18.807288 9.482928000000001C18.877704 9.635208 19.01736 9.783312 19.162488 9.859632C19.267944 9.91512 19.31256 9.923568000000001 19.5 9.923615999999999C19.679016 9.92364 19.73364 9.914256 19.81908 9.8688C19.977768 9.784320000000001 20.10396 9.657168 20.17728 9.507864L20.244 9.372 20.244 7.272C20.244 4.953168 20.25036 5.056968 20.087232 4.716C19.922088 4.3708800000000005 19.646016 4.089576 19.308 3.922008C18.958752 3.7488960000000002 19.102176 3.758592 16.812 3.753C15.64188 3.75012 14.708856 3.7573440000000002 14.657616 3.769656M4.296 14.085023999999999C4.080744 14.155800000000001 3.9007680000000002 14.31492 3.8072880000000002 14.517072C3.756144 14.627712000000002 3.7560000000000002 14.633616000000002 3.7560000000000002 16.728C3.7560000000000002 19.046832000000002 3.7496400000000003 18.943032000000002 3.9127680000000002 19.284C4.08324 19.640256 4.359744 19.91676 4.716 20.087232C5.056872 20.250312 4.954368 20.244 7.26 20.244L9.348 20.244 9.47448 20.186832000000003C9.633312 20.115047999999998 9.820992 19.914528 9.873456000000001 19.760568C9.922776 19.615848 9.922776 19.384152 9.873456000000001 19.239432C9.820992 19.085472 9.633312 18.884952000000002 9.47448 18.813167999999997L9.348 18.756 7.350840000000001 18.744C5.475024 18.73272 5.351088 18.729408000000003 5.31084 18.68916C5.270592000000001 18.648912 5.26728 18.524496000000003 5.256 16.63716C5.24412 14.648232 5.243472000000001 14.626872 5.192712 14.517072C5.0662080000000005 14.24352 4.831824 14.084904 4.5360000000000005 14.072712000000001C4.437 14.068655999999999 4.329 14.074176 4.296 14.085023999999999M19.296 14.085023999999999C19.080744 14.155800000000001 18.900768000000003 14.31492 18.807288 14.517072C18.756528000000003 14.626872 18.75588 14.648232 18.744 16.63716C18.73272 18.524496000000003 18.729408000000003 18.648912 18.68916 18.68916C18.648912 18.729408000000003 18.524976000000002 18.73272 16.649160000000002 18.744L14.652000000000001 18.756 14.52552 18.813167999999997C14.366688 18.884952000000002 14.179008000000001 19.085472 14.126544 19.239432C14.077224000000001 19.384152 14.077224000000001 19.615848 14.126544 19.760568C14.179008000000001 19.914528 14.366688 20.115047999999998 14.52552 20.186832000000003L14.652000000000001 20.244 16.740000000000002 20.244C19.045632 20.244 18.943128 20.250312 19.284 20.087232C19.640256 19.91676 19.91676 19.640256 20.087232 19.284C20.25036 18.943032000000002 20.244 19.046832000000002 20.244 16.728C20.244 14.633616000000002 20.243856 14.627712000000002 20.192712 14.517072C20.066208 14.24352 19.831824 14.084904 19.536 14.072712000000001C19.437 14.068655999999999 19.329 14.074176 19.296 14.085023999999999" stroke="none" fill="currentColor" fillRule="evenodd" strokeWidth={0.024} /></svg>
          </ControlButton>
          <ControlButton onClick={() => setShowHelp(!showHelp)} title={showHelp ? 'Hide Help' : 'Show Help'}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4">
              <path d="M11.508000000000001 0.48132C8.570016 0.599736 5.785272 1.846632 3.732 3.9631440000000002C1.7414640000000001 6.014976 0.596232 8.676552000000001 0.483 11.514000000000001C0.414936 13.220016 0.687624 14.794560000000002 1.3224 16.360704000000002C2.076576 18.22152 3.3201840000000002 19.85436 4.95816 21.134448C5.440632000000001 21.511512 6.243816 22.020984000000002 6.78 22.290096000000002C8.569872 23.188416 10.505856000000001 23.604576 12.493368 23.518224C15.147792 23.402928 17.533824 22.45116 19.58184 20.690712C19.894248 20.422176 20.491224000000003 19.821456 20.754696 19.510464000000002C21.846696 18.22164 22.621176 16.786152 23.08464 15.192C23.630376000000002 13.31484 23.6736 11.191872 23.205288 9.267719999999999C22.433976 6.098736000000001 20.346192000000002 3.4013520000000006 17.454072 1.837272C15.992688 1.0469760000000001 14.232000000000001 0.554064 12.648 0.491808C12.469800000000001 0.4848 12.2376 0.47565599999999997 12.132 0.47148C12.0264 0.467328 11.7456 0.471744 11.508000000000001 0.48132M11.376 1.9944C10.370928000000001 2.054472 9.377952 2.268888 8.424 2.63184C7.950264000000001 2.812104 7.09332 3.2388239999999997 6.677544 3.501528C5.306592 4.367736 4.13916 5.573448 3.328848 6.96C3.136584 7.288992 2.819616 7.948320000000001 2.666232 8.338272C2.261568 9.367152 2.0568239999999998 10.325736 1.9890960000000002 11.508168C1.9101119999999998 12.887784 2.1471839999999998 14.341992 2.666232 15.661728C3.1923120000000003 16.999248 3.9481680000000003 18.138047999999998 4.984128 19.153896C5.809488 19.9632 6.540960000000001 20.4828 7.570272 20.990928C9.514752 21.950832000000002 11.66952 22.250952 13.824 21.86196C15.203327999999999 21.612912 16.658208 20.997168 17.808 20.175864C18.823872 19.4502 19.7796 18.44976 20.436936 17.424C20.883024 16.727856000000003 21.320328 15.7956 21.562728 15.024000000000001C22.25076 12.833808 22.1682 10.460664 21.329784 8.328C20.844 7.09236 20.118216 5.972856 19.176696 5.006856C18.328704000000002 4.136832 17.446128 3.50088 16.356 2.974344C14.783904 2.215008 13.130088 1.889568 11.376 1.9944M11.508000000000001 5.632536C10.221288 5.79948 9.123096 6.482304 8.423615999999999 7.550304000000001C8.050368 8.120184 7.828104 8.761175999999999 7.750344 9.492C7.69908 9.973848 7.760544 10.237728 7.96764 10.424808C8.1414 10.581816 8.241744 10.619664 8.484 10.619616C8.67144 10.619568000000001 8.716056 10.61112 8.821512 10.555632C8.888352000000001 10.520496 8.984088 10.446311999999999 9.034224 10.3908C9.179952 10.22952 9.217008 10.117320000000001 9.242256 9.761016C9.296352 8.998152000000001 9.55392 8.420016 10.067568000000001 7.908576C10.632528 7.3460160000000005 11.46036 7.050960000000001 12.250200000000001 7.130616C12.935664 7.199736 13.477488000000001 7.454256 13.956192000000001 7.932C15.133632 9.107064000000001 14.999784 11.073672 13.674312 12.073272C13.336319999999999 12.328152000000001 13.091784 12.442272 12.592944000000001 12.57792C12.447168 12.617544 12.25848 12.684528000000002 12.173615999999999 12.726768000000002C11.756904 12.934152000000001 11.420808000000001 13.35528 11.302368000000001 13.818384C11.261568 13.97796 11.256024 14.086224000000001 11.25624 14.72184C11.256456 15.430008 11.25756 15.446352 11.313072 15.565560000000001C11.467584 15.89736 11.773368000000001 16.060272 12.135144 16.003536C12.365687999999999 15.967392 12.554064 15.825000000000001 12.677856 15.593328C12.729312000000002 15.497040000000002 12.7326 15.459024 12.744 14.828472C12.757728 14.069832000000002 12.752232 14.089176 12.967991999999999 14.038968C14.554968 13.669656 15.810888 12.404088 16.16028 10.822104C16.193592 10.67136 16.233912 10.440840000000001 16.249896 10.309848C16.28472 10.024536000000001 16.266528 9.464400000000001 16.212744 9.16536C15.963888 7.782336000000001 15.103776 6.638304000000001 13.86 6.036048C13.248336 5.739864 12.675552000000001 5.6141760000000005 11.964 5.620032C11.7528 5.62176 11.5476 5.6274 11.508000000000001 5.632536M11.724 16.904544C11.554248000000001 16.96032 11.429568000000002 17.036712 11.304984000000001 17.161296C11.152728 17.313576 11.0724 17.470056 11.0352 17.686992C10.921464 18.35028 11.496816 18.93048 12.159408 18.820680000000003C12.440807999999999 18.774048 12.685056 18.610344 12.843312000000001 18.362280000000002C13.008456 18.103416 13.030008 17.731920000000002 12.896424 17.446488000000002C12.799199999999999 17.238696 12.620304 17.058456 12.4146 16.96104C12.274008 16.89444 12.222768 16.883280000000003 12.036 16.878504C11.907143999999999 16.87524 11.781264 16.885728 11.724 16.904544" stroke="none" fill="currentColor" fillRule="evenodd" strokeWidth={0.024} />
            </svg>
          </ControlButton>
        </Controls>

        {/* Help Panel */}
        {showHelp && (
          <Panel position="top-right" className="bg-white rounded-lg shadow-lg p-3 max-w-xs">
            <div className="bg-blue-50 border border-blue-200 rounded text-xs space-y-2 p-3">
              <div className="font-semibold text-blue-900">Quick Tips:</div>
              <ul className="text-blue-800 space-y-1 list-disc list-inside">
                <li>Click on schema or property names to edit</li>
                <li>Hover over properties to see connection handles</li>
                <li>Drag from right handle to left handle to link properties</li>
                <li>Drag nodes to reposition</li>
                <li>Use mouse wheel to zoom</li>
              </ul>
            </div>
          </Panel>
        )}

        {/* Empty State - No Schemas */}
        {(!parsedData?.schema || parsedData.schema.length === 0) && (
          <Panel position="center" className="pointer-events-auto">
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-3 text-sm font-semibold text-gray-900">No schemas</h3>
              <p className="mt-2 text-sm text-gray-500">Get started by creating your first schema.</p>
              <div className="mt-6">
                <button
                  onClick={handleAddSchema}
                  className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors"
                >
                  <svg className="-ml-0.5 mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                  </svg>
                  Add Schema
                </button>
              </div>
            </div>
          </Panel>
        )}

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
