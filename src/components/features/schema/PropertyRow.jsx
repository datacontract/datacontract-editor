import {memo, useEffect, useRef, useState} from 'react';
import {Tooltip} from '../../ui/index.js';
import ChevronRightIcon from "../../ui/icons/ChevronRightIcon.jsx";
import PropertyIndicators from './PropertyIndicators.jsx';
import ItemsRow from './ItemsRow.jsx';
import {getLogicalTypeIcon} from './propertyIcons.js';
import {TypeSelector} from '../../ui/TypeSelector';

/**
 * Recursive component to render a property and its sub-properties
 * Handles inline editing, type selection, and nested structures
 */
const PropertyRow = ({
                         property,
                         propIndex,
                         schemaIdx,
                         depth = 0,
                         propPath = [],
                         togglePropertyExpansion,
                         updateProperty,
                         addSubProperty,
                         removeProperty,
                         expandedProperties,
                         onSelectProperty,
                         selectedPropertyPath,
                         totalPropertiesCount = 0,
                         onSaveAndAddNext,
                         autoEditNewProperty = false,
                         onAutoEditComplete,
                         setValue // Pass setValue for ItemsRow updateItems callback
                     }) => {
    const [editingPropertyName, setEditingPropertyName] = useState(false);
    const [editedPropertyName, setEditedPropertyName] = useState('');
    const inputRef = useRef(null);

    // Auto-edit when this is a newly added property
    useEffect(() => {
        if (autoEditNewProperty && depth === 0) {
            setEditedPropertyName(property.name || '');
            setEditingPropertyName(true);
            // Also select this property to show details drawer
            const currentPath = [...propPath, propIndex];
            onSelectProperty(currentPath, property);
            onAutoEditComplete?.();
        }
    }, [autoEditNewProperty, depth, onAutoEditComplete, property.name, propPath, propIndex, onSelectProperty, property]);

    // Focus input when editing starts
    useEffect(() => {
        if (editingPropertyName && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [editingPropertyName]);

    const currentPath = [...propPath, propIndex];
    const pathKey = `${schemaIdx}-${currentPath.join('-')}`;
    const isExpanded = expandedProperties.has(pathKey);
    const isObject = property.logicalType === 'object';
    const isArray = property.logicalType === 'array';
    const hasSubProperties = property.properties && property.properties.length > 0;
    const hasItems = property.items;
    const isSelected = selectedPropertyPath === currentPath.join('-');

    const handleSelect = (e) => {
        e.stopPropagation();
        onSelectProperty(currentPath, property);
    };

    return (
        <>
            <div
                className={`border-t border-gray-100 group cursor-pointer ${isSelected ? 'bg-indigo-50 hover:bg-indigo-100 ring-1 ring-inset ring-indigo-200' : 'hover:bg-gray-50'}`}
                style={{paddingLeft: `${depth * 1.5}rem`}}
                onClick={handleSelect}
            >
                {/* Main row with name, type, description */}
                <div className="flex items-center justify-between px-2 pr-2 py-1.5">
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                        {/* Logical Type Icon */}
                        {(() => {
                            const IconComponent = getLogicalTypeIcon(property.logicalType);
                            return IconComponent ? (
                                <IconComponent className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" />
                            ) : (
                                <div className="h-3.5 w-3.5 flex-shrink-0" />
                            );
                        })()}

                        {/* Property Name - fixed width for alignment */}
                        {editingPropertyName ? (
                            <input
                                type="text"
                                value={editedPropertyName}
                                onChange={(e) => {
                                    const newName = e.target.value;
                                    setEditedPropertyName(newName);
                                    // Update YAML immediately so drawer syncs in real-time
                                    updateProperty(schemaIdx, currentPath, 'name', newName);
                                }}
                                onBlur={() => {
                                    setEditingPropertyName(false);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        // Check if this is the last property at top level (depth === 0)
                                        const isLastProperty = depth === 0 && propIndex === totalPropertiesCount - 1;
                                        if (isLastProperty && onSaveAndAddNext) {
                                            // Save and add next property
                                            onSaveAndAddNext(schemaIdx, currentPath, editedPropertyName);
                                        }
                                        setEditingPropertyName(false);
                                    } else if (e.key === 'Escape') {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        // Restore original value on escape
                                        updateProperty(schemaIdx, currentPath, 'name', property.name || '');
                                        setEditingPropertyName(false);
                                    }
                                }}
                                onClick={(e) => e.stopPropagation()}
                                ref={inputRef}
                                className="bg-white px-1.5 py-0.5 text-sm font-medium text-gray-900 rounded border border-indigo-300 focus:outline-none focus:border-indigo-500 min-w-32"
                                placeholder="property name"
                                autoFocus
                            />
                        ) : (
                            <span
                                className={`cursor-pointer text-sm font-medium hover:text-indigo-600 hover:bg-indigo-50 px-1.5 py-0.5 rounded transition-colors border border-transparent hover:border-indigo-200 min-w-32 flex-shrink-0 ${
                                    !property.name || property?.name?.toString().trim() === '' ? 'text-gray-400 italic' : 'text-gray-600'
                                }`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onSelectProperty(currentPath, property);
                                    setEditedPropertyName(property?.name || '');
                                    setEditingPropertyName(true);
                                }}
                                title={property.name || "Click to edit"}
                            >
                                {!property.name || property?.name?.toString().trim() === '' ? 'unnamed property' : property.name}
                            </span>
                        )}

                        {/* Property Type - min width for alignment */}
                        <div className="min-w-20 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                            <TypeSelector
                                logicalType={property.logicalType}
                                onLogicalTypeChange={(value) => updateProperty(schemaIdx, currentPath, 'logicalType', value || undefined)}
                                physicalType={property.physicalType}
                                onPhysicalTypeChange={(value) => updateProperty(schemaIdx, currentPath, 'physicalType', value || undefined)}
                            />
                        </div>

                        {/* Visual Indicators - fixed width for alignment */}
                        <div className="w-14 flex-shrink-0">
                            <PropertyIndicators property={property}/>
                        </div>

                        {/* Description preview */}
                        {property.description && (
                            <span className="text-xs text-gray-400 truncate flex-1" title={property.description}>
                                {property.description}
                            </span>
                        )}
                    </div>

                    {/* Action Icons */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {isObject && (
                            <Tooltip content="Add sub-property">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        addSubProperty(schemaIdx, currentPath);
                                    }}
                                    className="p-1.5 rounded-full hover:bg-indigo-50"
                                    title="Add sub-property"
                                >
                                    <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor"
                                         viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}

                                              d="M12 4v16m8-8H4"/>
                                    </svg>
                                </button>
                            </Tooltip>
                        )}
                        {/* Expand/Collapse Button for nested items */}
                        {(hasSubProperties || (isArray && hasItems)) && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    togglePropertyExpansion(pathKey);
                                }}
                                className="p-1 rounded hover:bg-gray-200 focus:outline-none flex-shrink-0"
                            >
                                <ChevronRightIcon
                                    className={`size-3 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                                />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Render sub-properties recursively if expanded */}
            {isExpanded && hasSubProperties && (
                <>
                    {property.properties.map((subProp, subPropIndex) => (
                        <PropertyRow
                            key={subPropIndex}
                            property={subProp}
                            propIndex={subPropIndex}
                            schemaIdx={schemaIdx}
                            depth={depth + 1}
                            propPath={currentPath}
                            togglePropertyExpansion={togglePropertyExpansion}
                            updateProperty={updateProperty}
                            addSubProperty={addSubProperty}
                            removeProperty={removeProperty}
                            expandedProperties={expandedProperties}
                            onSelectProperty={onSelectProperty}
                            selectedPropertyPath={selectedPropertyPath}
                            setValue={setValue}
                        />
                    ))}
                </>
            )}

            {/* Render items node for array properties if expanded */}
            {isExpanded && isArray && hasItems && (
                <ItemsRow
                    items={property.items}
                    parentPropertyName={property.name}
                    schemaIdx={schemaIdx}
                    depth={depth + 1}
                    propPath={currentPath}
                    updateItems={(field, value) => {
                        // Build path to items object
                        let pathStr = `schema[${schemaIdx}].properties`;
                        for (let i = 0; i < currentPath.length; i++) {
                            if (currentPath[i] === 'items') {
                                pathStr += '.items';
                                if (i < currentPath.length - 1) pathStr += '.properties';
                            } else {
                                pathStr += `[${currentPath[i]}]`;
                                if (i < currentPath.length - 1 && currentPath[i + 1] !== 'items') {
                                    pathStr += '.properties';
                                }
                            }
                        }
                        pathStr += `.items.${field}`;
                        setValue(pathStr, value);
                    }}
                    togglePropertyExpansion={togglePropertyExpansion}
                    updateProperty={updateProperty}
                    addSubProperty={addSubProperty}
                    removeProperty={removeProperty}
                    expandedProperties={expandedProperties}
                    onSelectProperty={onSelectProperty}
                    selectedPropertyPath={selectedPropertyPath}
                    setValue={setValue}
                    PropertyRow={PropertyRow}
                />
            )}
        </>
    );
};

// Custom comparison function using JSON.stringify
const arePropsEqual = (prevProps, nextProps) => {
    try {
        // Special handling for expandedProperties Set
        const prevExpandedArray = Array.from(prevProps.expandedProperties || []).sort();
        const nextExpandedArray = Array.from(nextProps.expandedProperties || []).sort();

        const prevWithExpandedArray = { ...prevProps, expandedProperties: prevExpandedArray };
        const nextWithExpandedArray = { ...nextProps, expandedProperties: nextExpandedArray };

        return JSON.stringify(prevWithExpandedArray) === JSON.stringify(nextWithExpandedArray);
    } catch (error) {
        // Fallback to false if stringify fails (e.g., circular references)
        console.warn('PropertyRow memo comparison failed:', error);
        return false;
    }
};

export default memo(PropertyRow, arePropsEqual);
