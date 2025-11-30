import { memo, useState, useEffect, useRef, Fragment } from 'react';
import { Handle, Position, NodeToolbar, useReactFlow } from '@xyflow/react';
import KeyIcon from '../ui/icons/KeyIcon.jsx';

const logicalTypeOptions = [
  'string',
  'date',
  'timestamp',
  'time',
  'number',
  'integer',
  'object',
  'array',
  'boolean'
];

const SchemaNode = ({ data, id }) => {
  const { getNode } = useReactFlow();
  const [isEditingSchemaName, setIsEditingSchemaName] = useState(false);
  const [editedSchemaName, setEditedSchemaName] = useState('');
  const [editingPropertyIndex, setEditingPropertyIndex] = useState(null);
  const [editedPropertyName, setEditedPropertyName] = useState('');
  const [editingPropertyType, setEditingPropertyType] = useState(null);
  const [editingNestedProperty, setEditingNestedProperty] = useState(null); // { parentIndex, nestedIndex, field: 'name' | 'type' }
  const [editedNestedValue, setEditedNestedValue] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const menuRef = useRef(null);
  const contextMenuRef = useRef(null);
  const shouldEditNextProperty = useRef(false);
  const previousPropertyCount = useRef(data.schema.properties?.length || 0);
  const isSavingRef = useRef(false);
  const hoverTimeoutRef = useRef(null);
  const propertyRowsRef = useRef([]);
  const propertyHoverTimeoutRef = useRef(null);
  const openPropertyDetails = data.openPropertyDetails;

  // Cleanup hover timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      if (propertyHoverTimeoutRef.current) {
        clearTimeout(propertyHoverTimeoutRef.current);
      }
    };
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target)) {
        setContextMenu(null);
      }
    };

    if (showMenu || contextMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showMenu, contextMenu]);

  // Auto-edit newly added property
  useEffect(() => {
    const currentPropertyCount = data.schema.properties?.length || 0;

    if (shouldEditNextProperty.current && currentPropertyCount > previousPropertyCount.current) {
      // A new property was added, start editing it
      const newPropertyIndex = currentPropertyCount - 1;
      const newPropertyName = data.schema.properties?.[newPropertyIndex]?.name || '';
      setEditingPropertyIndex(newPropertyIndex);
      setEditedPropertyName(newPropertyName);
      shouldEditNextProperty.current = false;
    }

    previousPropertyCount.current = currentPropertyCount;
  }, [data.schema.properties]);

  const handleAddProperty = () => {
    data.onAddProperty(id, {
      name: '',
      logicalType: 'string',
      required: false,
      primaryKey: false
    });
  };

  const handleDeleteProperty = (propertyIndex) => {
    data.onDeleteProperty(id, propertyIndex);
  };

  const handleAddNestedProperty = (propertyIndex) => {
    if (data.onAddNestedProperty) {
      data.onAddNestedProperty(id, propertyIndex);
    }
  };

  const handleUpdateProperty = (propertyIndex, updates) => {
    const updatedProperties = [...(data.schema.properties || [])];
    const updatedProperty = {
      ...updatedProperties[propertyIndex],
      ...updates
    };

    // Remove undefined values from the updated property
    Object.keys(updatedProperty).forEach(key => {
      if (updatedProperty[key] === undefined) {
        delete updatedProperty[key];
      }
    });

    updatedProperties[propertyIndex] = updatedProperty;
    data.onUpdateSchema(id, {
      ...data.schema,
      properties: updatedProperties
    });
  };

  const handleDeleteSchema = () => {
    data.onDeleteSchema(id);
  };

  const handleStartEditSchemaName = () => {
    setEditedSchemaName(data.schema.name || '');
    setIsEditingSchemaName(true);
  };

  const handleSaveSchemaName = () => {
    if (editedSchemaName.trim()) {
      data.onUpdateSchema(id, {
        ...data.schema,
        name: editedSchemaName.trim()
      });
    }
    setIsEditingSchemaName(false);
  };

  const handleStartEditPropertyName = (index, currentName) => {
    setEditingPropertyIndex(index);
    setEditedPropertyName(currentName || '');
  };

  const handleSavePropertyName = (index, shouldAddNext = false) => {
    // Prevent duplicate saves from blur event
    if (isSavingRef.current) {
      return;
    }

    isSavingRef.current = true;

    // Check if we should add a new property after saving
    const isLastProperty = index === (data.schema.properties?.length || 0) - 1;
    const trimmedName = editedPropertyName.trim();

    if (shouldAddNext && isLastProperty) {
      // Combined operation: save current property AND add new one in a single update
      const updatedProperties = [...(data.schema.properties || [])];

      // Update the current property with the new name (can be empty)
      updatedProperties[index] = {
        ...updatedProperties[index],
        name: trimmedName
      };

      // Add the new property
      updatedProperties.push({
        name: '',
        logicalType: 'string',
        required: false,
        primaryKey: false
      });

      // Single state update with both changes
      data.onUpdateSchema(id, {
        ...data.schema,
        properties: updatedProperties
      });

      // Set flag to auto-edit the next property
      shouldEditNextProperty.current = true;
    } else {
      // Normal case: always save (even if name is empty)
      handleUpdateProperty(index, {
        name: trimmedName
      });

      // Close the editor
      setEditingPropertyIndex(null);
      setEditedPropertyName('');
    }

    // Reset the saving flag after a short delay
    setTimeout(() => {
      isSavingRef.current = false;
    }, 100);
  };

  const handlePropertyContextMenu = (event, propertyIndex) => {
    event.preventDefault();
    event.stopPropagation();
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      propertyIndex
    });
  };

  const handleMouseEnter = () => {
    // Clear any pending timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    // Set a delay before hiding (800ms)
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 800);
  };

  const handlePropertyHover = (index) => {
    // Clear any existing timeout
    if (propertyHoverTimeoutRef.current) {
      clearTimeout(propertyHoverTimeoutRef.current);
    }

    // Show details after a short delay (300ms)
    propertyHoverTimeoutRef.current = setTimeout(() => {
      const node = getNode(id);
      if (!node) return;

      // Calculate the property offset within the node
      const headerHeight = 40;
      const propertyRowHeight = 42;
      const propertyOffset = headerHeight + (index * propertyRowHeight);

      data.onShowPropertyDetails?.(id, index, node.position, propertyOffset, 'hover');
    }, 300);
  };

  const handleUpdateNestedProperty = (parentIndex, nestedIndex, updates) => {
    const updatedProperties = [...(data.schema.properties || [])];
    const parentProperty = { ...updatedProperties[parentIndex] };
    const nestedProperties = [...(parentProperty.properties || [])];

    nestedProperties[nestedIndex] = {
      ...nestedProperties[nestedIndex],
      ...updates
    };

    parentProperty.properties = nestedProperties;
    updatedProperties[parentIndex] = parentProperty;

    data.onUpdateSchema(id, {
      ...data.schema,
      properties: updatedProperties
    });
  };

  const handleStartEditNestedProperty = (parentIndex, nestedIndex, field, currentValue) => {
    setEditingNestedProperty({ parentIndex, nestedIndex, field });
    setEditedNestedValue(currentValue || '');
  };

  const handleSaveNestedProperty = (parentIndex, nestedIndex, field) => {
    const trimmedValue = editedNestedValue.trim();
    handleUpdateNestedProperty(parentIndex, nestedIndex, {
      [field]: trimmedValue || undefined
    });
    setEditingNestedProperty(null);
    setEditedNestedValue('');
  };

  return (
    <div
      className="min-w-[250px]"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Node Toolbar */}
      <NodeToolbar isVisible={isHovered} position={Position.Bottom} offset={10}>
        <div className="flex items-center gap-1 bg-white rounded-md shadow-lg border border-gray-200 p-1">
          <button
            onClick={handleAddProperty}
            className="p-1.5 text-gray-700 hover:bg-gray-100 rounded transition-colors"
            title="Add property"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 text-gray-700 hover:bg-gray-100 rounded transition-colors"
              title="More options"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
            {showMenu && (
              <div className="absolute top-full right-0 mt-1 bg-white rounded-md shadow-lg py-1 z-50 min-w-[120px]">
                <button
                  onClick={() => {
                    handleDeleteSchema();
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </NodeToolbar>

      {/* Accent Bar */}
      <div className="h-1.5 rounded-t bg-fuchsia-700"></div>

      {/* Schema Container with Border */}
      <div className="border-[3px] rounded-b border-solid border-[#E9EEF4]">
        {/* Schema Header */}
        <div className="flex items-center bg-[#E9EEF4] px-2 py-1.5">
          {/* Table Icon */}
          <span className="mr-1.5 flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="#000">
              <path d="M1.930848 1.960304C1.164656 2.0890560000000002 0.5672480000000001 2.720784 0.481104 3.493344C0.45718400000000003 3.707872 0.45718400000000003 12.292128000000002 0.481104 12.506656000000001C0.556416 13.182064 1.023328 13.757952 1.67112 13.9744C1.955984 14.069584 1.5522719999999999 14.063872 8 14.063872C14.428111999999999 14.063872 14.025120000000001 14.069504 14.32 13.975567999999999C14.967136 13.769408 15.44312 13.186208 15.518896000000002 12.506656000000001C15.542816 12.292128000000002 15.542816 3.707872 15.518896000000002 3.493344C15.432112 2.714992 14.832336 2.0853919999999997 14.058 1.959808C13.930848000000001 1.939184 13.146432 1.936336 7.984 1.937712C3.166448 1.938992 2.03256 1.9432159999999998 1.930848 1.960304M1.981696 2.981056C1.74744 3.060912 1.557504 3.262384 1.4968320000000002 3.4953600000000002C1.475616 3.576832 1.472 3.742864 1.472 4.6353599999999995L1.472 5.68 8 5.68L14.528 5.68 14.528 4.6353599999999995C14.528 3.742864 14.524384 3.576832 14.503168 3.4953600000000002C14.441392 3.258128 14.239951999999999 3.0488000000000004 14.002992 2.975616C13.901808 2.944368 13.832176 2.944 7.99432 2.9444160000000004L2.088 2.944832 1.981696 2.981056M1.472 8.064L1.472 9.44 3.3120000000000003 9.44L5.152 9.44 5.152 8.064L5.152 6.688 3.3120000000000003 6.688L1.472 6.688 1.472 8.064M6.16 8.064L6.16 9.44 8 9.44L9.84 9.44 9.84 8.064L9.84 6.688 8 6.688L6.16 6.688 6.16 8.064M10.848 8.064L10.848 9.44 12.688 9.44L14.528 9.44 14.528 8.064L14.528 6.688 12.688 6.688L10.848 6.688 10.848 8.064M1.472 11.420639999999999C1.472 12.262528 1.47568 12.423440000000001 1.4968320000000002 12.50464C1.558608 12.741871999999999 1.760048 12.951200000000002 1.9970080000000001 13.024384C2.09592 13.054943999999999 2.1507359999999998 13.056000000000001 3.62568 13.056000000000001L5.152 13.056000000000001 5.152 11.744L5.152 10.432 3.3120000000000003 10.432L1.472 10.432 1.472 11.420639999999999M6.16 11.744L6.16 13.056000000000001 8 13.056000000000001L9.84 13.056000000000001 9.84 11.744L9.84 10.432 8 10.432L6.16 10.432 6.16 11.744M10.848 11.744L10.848 13.056000000000001 12.374319999999999 13.056000000000001C13.849264 13.056000000000001 13.90408 13.054943999999999 14.002992 13.024384C14.239951999999999 12.951200000000002 14.441392 12.741871999999999 14.503168 12.50464C14.52432 12.423440000000001 14.528 12.262528 14.528 11.420639999999999L14.528 10.432 12.688 10.432L10.848 10.432 10.848 11.744" fillRule="evenodd"/>
            </svg>
          </span>
          {isEditingSchemaName ? (
            <input
              type="text"
              value={editedSchemaName}
              onChange={(e) => setEditedSchemaName(e.target.value)}
              onBlur={handleSaveSchemaName}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSaveSchemaName();
                } else if (e.key === 'Escape') {
                  setIsEditingSchemaName(false);
                }
              }}
              className="flex-1 px-2 py-1 text-sm bg-white text-gray-900 rounded border-2 border-indigo-300 focus:outline-none focus:border-indigo-400"
              autoFocus
            />
          ) : (
            <div
              className="cursor-pointer hover:opacity-80 flex-1 min-w-0"
              onClick={handleStartEditSchemaName}
              title="Click to edit"
            >
              <span className="font-bold text-md truncate">{data.schema.name || 'Unnamed Schema'}</span>
            </div>
          )}
        </div>

        {/* Properties List */}
        <div className="bg-white rounded-b divide-y divide-[#E9EEF4]">
        {data.schema.properties && data.schema.properties.length > 0 ? (
          data.schema.properties.map((prop, index) => {
            const isPropertyDetailsOpen = openPropertyDetails?.propertyIndex === index &&
                                          openPropertyDetails?.nestedIndex == null;
            return (
            <Fragment key={index}>
              <div
                className={`px-3 py-2 group relative cursor-pointer ${
                  isPropertyDetailsOpen ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50'
                }`}
                onContextMenu={(e) => handlePropertyContextMenu(e, index)}
                onClick={() => {
                // Cancel any pending hover timeout when clicking
                if (propertyHoverTimeoutRef.current) {
                  clearTimeout(propertyHoverTimeoutRef.current);
                  propertyHoverTimeoutRef.current = null;
                }

                const node = getNode(id);
                if (!node) return;
                const headerHeight = 40;
                const propertyRowHeight = 42;
                const propertyOffset = headerHeight + (index * propertyRowHeight);
                data.onShowPropertyDetails?.(id, index, node.position, propertyOffset, 'click');
              }}
            >
              {/* Property handles for connections */}
              <Handle
                type="source"
                position={Position.Left}
                id={`${id}-prop-${index}-source`}
                className="w-6 h-6 !bg-indigo-500 !border-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ left: -1 }}
              />
              <Handle
                type="target"
                position={Position.Right}
                id={`${id}-prop-${index}-target`}
                className="w-6 h-6 !bg-gray-400 !border-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ right: -1 }}
              />
              <div className="flex justify-between items-center">
                {/* Left side: Name and icons */}
                <div className="flex items-center flex-1 min-w-0">
                  {editingPropertyIndex === index ? (
                    <input
                      type="text"
                      value={editedPropertyName}
                      onChange={(e) => setEditedPropertyName(e.target.value)}
                      onBlur={() => handleSavePropertyName(index)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          e.stopPropagation();
                          handleSavePropertyName(index, true);
                        } else if (e.key === 'Escape') {
                          e.preventDefault();
                          e.stopPropagation();
                          setEditingPropertyIndex(null);
                          setEditedPropertyName('');
                        }
                      }}
                      className="flex-1 px-2 py-1 text-sm bg-white text-gray-900 rounded border border-indigo-300 focus:outline-none focus:border-indigo-500"
                      placeholder="property name"
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      <span
                        className={`text-sm font-medium truncate cursor-pointer hover:text-indigo-600 ${
                          !prop.name || prop.name.trim() === '' ? 'text-gray-400 italic' : 'text-gray-900'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartEditPropertyName(index, prop.name);
                        }}
                        title="Click to edit"
                      >
                        {!prop.name || prop.name.trim() === '' ? 'unnamed property' : prop.name}
                      </span>
                      {/* Always render button like Handles - just change opacity based on type */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (prop.logicalType === 'object') {
                            handleAddNestedProperty(index);
                          }
                        }}
                        className={`p-0.5 text-indigo-600 rounded transition-opacity flex-shrink-0 ${
                          prop.logicalType === 'object'
                            ? 'opacity-0 group-hover:opacity-100 hover:opacity-100 hover:bg-indigo-50'
                            : 'invisible pointer-events-none'
                        }`}
                        title={prop.logicalType === 'object' ? "Add nested property" : ""}
                        aria-hidden={prop.logicalType !== 'object'}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>

                {/* Right side: Type with Key Icon */}
                <div className="flex items-center gap-1.5 ml-2">
                  {editingPropertyIndex !== index && (
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      {/* Key Icon for Primary Key */}
                      {prop.primaryKey && (
                        <KeyIcon className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                      )}
                      {editingPropertyType === index ? (
                        <select
                          value={prop.logicalType || ''}
                          onChange={(e) => {
                            const newValue = e.target.value || undefined;
                            handleUpdateProperty(index, { logicalType: newValue });
                            setEditingPropertyType(null);
                          }}
                          onBlur={() => setEditingPropertyType(null)}
                          className="px-1 py-0 text-xs border border-indigo-300 rounded focus:outline-none focus:border-indigo-500"
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        >
                          <option value="">Select...</option>
                          {logicalTypeOptions.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span
                          className={`cursor-pointer hover:text-indigo-600 ${!prop.logicalType ? 'text-gray-400 italic' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingPropertyType(index);
                          }}
                          title="Click to edit type"
                        >
                          {prop.logicalType || 'Select...'}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Render array items if they exist */}
            {prop.logicalType === 'array' && prop.items && (
              <>
                <div
                  className="pl-8 pr-3 py-1.5 hover:bg-gray-50 relative cursor-pointer bg-gray-50/50"
                  onClick={(e) => {
                    e.stopPropagation();
                    const node = getNode(id);
                    if (!node) return;
                    const headerHeight = 40;
                    const propertyRowHeight = 42;
                    const itemsRowHeight = 30;
                    const propertyOffset = headerHeight + (index * propertyRowHeight) + itemsRowHeight;
                    data.onShowPropertyDetails?.(id, index, node.position, propertyOffset, 'click');
                  }}
                >
                  <div className="flex justify-between items-center text-xs">
                    {/* Left side: Name with [] */}
                    <div className="flex items-center gap-1 flex-1 min-w-0">
                      <span className="text-gray-600 font-medium">
                        {prop.name}[]
                      </span>
                    </div>

                    {/* Right side: Items Type */}
                    <div className="flex items-center gap-2 ml-2">
                      {editingPropertyType === `${index}-items` ? (
                        <select
                          value={prop.items.logicalType || ''}
                          onChange={(e) => {
                            const newValue = e.target.value || undefined;
                            handleUpdateProperty(index, {
                              items: { ...prop.items, logicalType: newValue }
                            });
                            setEditingPropertyType(null);
                          }}
                          onBlur={() => setEditingPropertyType(null)}
                          className="px-1 py-0 text-xs border border-indigo-300 rounded focus:outline-none focus:border-indigo-500"
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        >
                          <option value="">Select...</option>
                          {logicalTypeOptions.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span
                          className={`text-gray-500 cursor-pointer hover:text-blue-600 ${
                            !prop.items.logicalType ? 'italic text-gray-400' : ''
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingPropertyType(`${index}-items`);
                          }}
                          title="Click to edit item type"
                        >
                          {prop.items.logicalType || 'no type'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Render nested properties within array items if items is an object */}
                {prop.items.properties && prop.items.properties.length > 0 && (
                  prop.items.properties.map((itemProp, itemPropIndex) => {
                    const isItemPropertyDetailsOpen = openPropertyDetails?.propertyIndex === index &&
                                                       openPropertyDetails?.nestedIndex === `items-${itemPropIndex}`;
                    return (
                    <div
                      key={`${index}-items-${itemPropIndex}`}
                      className={`pl-12 pr-3 py-1.5 relative cursor-pointer ${
                        isItemPropertyDetailsOpen ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        const node = getNode(id);
                        if (!node) return;
                        const headerHeight = 40;
                        const propertyRowHeight = 42;
                        const itemsRowHeight = 30;
                        const nestedPropertyRowHeight = 30;
                        const propertyOffset = headerHeight + (index * propertyRowHeight) + itemsRowHeight + ((itemPropIndex + 1) * nestedPropertyRowHeight);
                        data.onShowPropertyDetails?.(id, index, node.position, propertyOffset, 'click', `items-${itemPropIndex}`);
                      }}
                    >
                      <div className="flex justify-between items-center text-xs">
                        {/* Left side: Name */}
                        <div className="flex items-center gap-1 flex-1 min-w-0">
                          {editingNestedProperty?.parentIndex === index &&
                           editingNestedProperty?.nestedIndex === `items-${itemPropIndex}` &&
                           editingNestedProperty?.field === 'name' ? (
                            <input
                              type="text"
                              value={editedNestedValue}
                              onChange={(e) => setEditedNestedValue(e.target.value)}
                              onBlur={() => {
                                const trimmedValue = editedNestedValue.trim();
                                const updatedItems = { ...prop.items };
                                const updatedItemProperties = [...(updatedItems.properties || [])];
                                updatedItemProperties[itemPropIndex] = {
                                  ...updatedItemProperties[itemPropIndex],
                                  name: trimmedValue || undefined
                                };
                                updatedItems.properties = updatedItemProperties;
                                handleUpdateProperty(index, { items: updatedItems });
                                setEditingNestedProperty(null);
                                setEditedNestedValue('');
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  const trimmedValue = editedNestedValue.trim();
                                  const updatedItems = { ...prop.items };
                                  const updatedItemProperties = [...(updatedItems.properties || [])];
                                  updatedItemProperties[itemPropIndex] = {
                                    ...updatedItemProperties[itemPropIndex],
                                    name: trimmedValue || undefined
                                  };
                                  updatedItems.properties = updatedItemProperties;
                                  handleUpdateProperty(index, { items: updatedItems });
                                  setEditingNestedProperty(null);
                                  setEditedNestedValue('');
                                } else if (e.key === 'Escape') {
                                  e.preventDefault();
                                  setEditingNestedProperty(null);
                                  setEditedNestedValue('');
                                }
                              }}
                              className="flex-1 px-1 py-0.5 text-xs bg-white text-gray-900 rounded border border-indigo-300 focus:outline-none focus:border-indigo-500"
                              placeholder="property name"
                              autoFocus
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            <span
                              className={`text-gray-600 truncate cursor-pointer hover:text-indigo-600 ${
                                !itemProp.name || itemProp.name.trim() === '' ? 'italic text-gray-400' : ''
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingNestedProperty({ parentIndex: index, nestedIndex: `items-${itemPropIndex}`, field: 'name' });
                                setEditedNestedValue(itemProp.name || '');
                              }}
                              title="Click to edit"
                            >
                              {itemProp.name || 'unnamed'}
                            </span>
                          )}
                        </div>

                        {/* Right side: Type */}
                        <div className="flex items-center gap-2 ml-2">
                          {editingNestedProperty?.parentIndex === index &&
                           editingNestedProperty?.nestedIndex === `items-${itemPropIndex}` &&
                           editingNestedProperty?.field === 'logicalType' ? (
                            <select
                              value={editedNestedValue || ''}
                              onChange={(e) => {
                                setEditedNestedValue(e.target.value);
                                const updatedItems = { ...prop.items };
                                const updatedItemProperties = [...(updatedItems.properties || [])];
                                updatedItemProperties[itemPropIndex] = {
                                  ...updatedItemProperties[itemPropIndex],
                                  logicalType: e.target.value || undefined
                                };
                                updatedItems.properties = updatedItemProperties;
                                handleUpdateProperty(index, { items: updatedItems });
                                setEditingNestedProperty(null);
                              }}
                              onBlur={() => setEditingNestedProperty(null)}
                              className="px-1 py-0 text-xs border border-indigo-300 rounded focus:outline-none focus:border-indigo-500"
                              autoFocus
                              onClick={(e) => e.stopPropagation()}
                            >
                              <option value="">Select...</option>
                              {logicalTypeOptions.map((type) => (
                                <option key={type} value={type}>
                                  {type}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span
                              className={`text-gray-500 cursor-pointer hover:text-blue-600 ${
                                !itemProp.logicalType ? 'italic text-gray-400' : ''
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingNestedProperty({ parentIndex: index, nestedIndex: `items-${itemPropIndex}`, field: 'logicalType' });
                                setEditedNestedValue(itemProp.logicalType || '');
                              }}
                              title="Click to edit type"
                            >
                              {itemProp.logicalType || 'no type'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    );
                  })
                )}

                {/* Render nested array items if items is also an array (e.g., array of arrays) */}
                {prop.items.logicalType === 'array' && prop.items.items && (
                  <div
                    className="pl-12 pr-3 py-1.5 hover:bg-gray-50 relative cursor-pointer bg-gray-50/50"
                    onClick={(e) => {
                      e.stopPropagation();
                      const node = getNode(id);
                      if (!node) return;
                      const headerHeight = 40;
                      const propertyRowHeight = 42;
                      const itemsRowHeight = 30;
                      const nestedItemsRowHeight = 30;
                      const propertyOffset = headerHeight + (index * propertyRowHeight) + itemsRowHeight + nestedItemsRowHeight;
                      data.onShowPropertyDetails?.(id, index, node.position, propertyOffset, 'click');
                    }}
                  >
                    <div className="flex justify-between items-center text-xs">
                      {/* Left side: Name with [][] */}
                      <div className="flex items-center gap-1 flex-1 min-w-0">
                        <span className="text-gray-600 font-medium">
                          {prop.name}[][]
                        </span>
                      </div>

                      {/* Right side: Nested Items Type */}
                      <div className="flex items-center gap-2 ml-2">
                        {editingPropertyType === `${index}-items-items` ? (
                          <select
                            value={prop.items.items.logicalType || ''}
                            onChange={(e) => {
                              const newValue = e.target.value || undefined;
                              handleUpdateProperty(index, {
                                items: {
                                  ...prop.items,
                                  items: { ...prop.items.items, logicalType: newValue }
                                }
                              });
                              setEditingPropertyType(null);
                            }}
                            onBlur={() => setEditingPropertyType(null)}
                            className="px-1 py-0 text-xs border border-indigo-300 rounded focus:outline-none focus:border-indigo-500"
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                          >
                            <option value="">Select...</option>
                            {logicalTypeOptions.map((type) => (
                              <option key={type} value={type}>
                                {type}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span
                            className={`text-gray-500 cursor-pointer hover:text-blue-600 ${
                              !prop.items.items.logicalType ? 'italic text-gray-400' : ''
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingPropertyType(`${index}-items-items`);
                            }}
                            title="Click to edit nested item type"
                          >
                            {prop.items.items.logicalType || 'no type'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Render nested properties if they exist */}
            {prop.properties && prop.properties.length > 0 && (
              prop.properties.map((nestedProp, nestedIndex) => {
                const isNestedPropertyDetailsOpen = openPropertyDetails?.propertyIndex === index &&
                                                     openPropertyDetails?.nestedIndex === nestedIndex;
                return (
                <div
                  key={`${index}-${nestedIndex}`}
                  className={`pl-8 pr-3 py-1.5 relative cursor-pointer ${
                    isNestedPropertyDetailsOpen ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    const node = getNode(id);
                    if (!node) return;
                    const headerHeight = 40;
                    const propertyRowHeight = 42;
                    const nestedPropertyRowHeight = 30; // Nested rows are smaller
                    const propertyOffset = headerHeight + (index * propertyRowHeight) + ((nestedIndex + 1) * nestedPropertyRowHeight);
                    data.onShowPropertyDetails?.(id, index, node.position, propertyOffset, 'click', nestedIndex);
                  }}
                >
                  <div className="flex justify-between items-center text-xs">
                    {/* Left side: Name */}
                    <div className="flex items-center gap-1 flex-1 min-w-0">
                      {editingNestedProperty?.parentIndex === index &&
                       editingNestedProperty?.nestedIndex === nestedIndex &&
                       editingNestedProperty?.field === 'name' ? (
                        <input
                          type="text"
                          value={editedNestedValue}
                          onChange={(e) => setEditedNestedValue(e.target.value)}
                          onBlur={() => handleSaveNestedProperty(index, nestedIndex, 'name')}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleSaveNestedProperty(index, nestedIndex, 'name');
                            } else if (e.key === 'Escape') {
                              e.preventDefault();
                              setEditingNestedProperty(null);
                              setEditedNestedValue('');
                            }
                          }}
                          className="flex-1 px-1 py-0.5 text-xs bg-white text-gray-900 rounded border border-indigo-300 focus:outline-none focus:border-indigo-500"
                          placeholder="property name"
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <span
                          className={`text-gray-600 truncate cursor-pointer hover:text-indigo-600 ${
                            !nestedProp.name || nestedProp.name.trim() === '' ? 'italic text-gray-400' : ''
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartEditNestedProperty(index, nestedIndex, 'name', nestedProp.name);
                          }}
                          title="Click to edit"
                        >
                          {nestedProp.name || 'unnamed'}
                        </span>
                      )}
                    </div>

                    {/* Right side: Type */}
                    <div className="flex items-center gap-2 ml-2">
                      {editingNestedProperty?.parentIndex === index &&
                       editingNestedProperty?.nestedIndex === nestedIndex &&
                       editingNestedProperty?.field === 'logicalType' ? (
                        <select
                          value={editedNestedValue || ''}
                          onChange={(e) => {
                            setEditedNestedValue(e.target.value);
                            handleSaveNestedProperty(index, nestedIndex, 'logicalType');
                          }}
                          onBlur={() => setEditingNestedProperty(null)}
                          className="px-1 py-0 text-xs border border-indigo-300 rounded focus:outline-none focus:border-indigo-500"
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        >
                          <option value="">Select...</option>
                          {logicalTypeOptions.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span
                          className={`text-gray-500 cursor-pointer hover:text-blue-600 ${
                            !nestedProp.logicalType ? 'italic text-gray-400' : ''
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartEditNestedProperty(index, nestedIndex, 'logicalType', nestedProp.logicalType);
                          }}
                          title="Click to edit type"
                        >
                          {nestedProp.logicalType || 'no type'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                );
              })
            )}
          </Fragment>
          );
          })
        ) : (
          <div
            className="px-4 py-3 text-xs text-gray-400 italic cursor-pointer hover:bg-gray-50"
            onClick={handleAddProperty}
          >
            No properties defined
          </div>
        )}
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          ref={contextMenuRef}
          className="fixed bg-white rounded-md shadow-lg py-1 z-50 min-w-[120px] border border-gray-200"
          style={{
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`
          }}
        >
          <button
            onClick={() => {
              handleDeleteProperty(contextMenu.propertyIndex);
              setContextMenu(null);
            }}
            className="w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50 flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>
      )}

    </div>
  );
};

export default memo(SchemaNode);
