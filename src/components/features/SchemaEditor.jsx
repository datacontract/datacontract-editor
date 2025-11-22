import {useMemo, useState, useCallback} from 'react';
import {useEditorStore} from '../../store.js';
import {Tooltip} from '../ui/index.js';
import {getSchemaEnumValues} from '../../lib/schemaEnumExtractor.js';
import Tags from '../ui/Tags.jsx';
import * as YAML from 'yaml';
import ChevronRightIcon from "../ui/icons/ChevronRightIcon.jsx";
import KeyIcon from "../ui/icons/KeyIcon.jsx";
import AsteriskIcon from "../ui/icons/AsteriskIcon.jsx";
import LockClosedIcon from "../ui/icons/LockClosedIcon.jsx";
import CheckCircleIcon from "../ui/icons/CheckCircleIcon.jsx";
import LinkIcon from "../ui/icons/LinkIcon.jsx";
import StringIcon from "../ui/icons/StringIcon.jsx";
import NumberIcon from "../ui/icons/NumberIcon.jsx";
import IntegerIcon from "../ui/icons/IntegerIcon.jsx";
import DateIcon from "../ui/icons/DateIcon.jsx";
import TimeIcon from "../ui/icons/TimeIcon.jsx";
import TimestampIcon from "../ui/icons/TimestampIcon.jsx";
import ObjectIcon from "../ui/icons/ObjectIcon.jsx";
import ArrayIcon from "../ui/icons/ArrayIcon.jsx";
import BooleanIcon from "../ui/icons/BooleanIcon.jsx";
import PropertyDetailsPanel from '../diagram/PropertyDetailsPanel.jsx';
import KeyValueEditor from '../ui/KeyValueEditor.jsx';
import CustomPropertiesEditor from '../ui/CustomPropertiesEditor.jsx';
import AuthoritativeDefinitionsEditor from '../ui/AuthoritativeDefinitionsEditor.jsx';
import ValidatedInput from '../ui/ValidatedInput.jsx';
import QualityEditor from '../ui/QualityEditor.jsx';
import {Disclosure, DisclosureButton, DisclosurePanel} from '@headlessui/react';

// Fallback logical type options (used if schema not loaded)
const fallbackLogicalTypeOptions = [
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

// Get icon component for logical type
const getLogicalTypeIcon = (logicalType) => {
    const iconMap = {
        'string': StringIcon,
        'number': NumberIcon,
        'integer': IntegerIcon,
        'date': DateIcon,
        'time': TimeIcon,
        'timestamp': TimestampIcon,
        'object': ObjectIcon,
        'array': ArrayIcon,
        'boolean': BooleanIcon
    };
    return iconMap[logicalType] || null;
};

// Visual indicator badges component
const PropertyIndicators = ({property}) => {
    const indicators = [];

    if (property.primaryKey) {
        indicators.push(
            <Tooltip key="pk" content="Primary Key">
                <KeyIcon className="h-3.5 w-3.5 text-gray-400"/>
            </Tooltip>
        );
    }

    if (property.required) {
        indicators.push(
            <Tooltip key="req" content="Required">
                <AsteriskIcon className="h-3.5 w-3.5 text-gray-400"/>
            </Tooltip>
        );
    }

    if (property.classification) {
        indicators.push(
            <Tooltip key="class" content={`Classification: ${property.classification}`}>
                <LockClosedIcon className="h-3.5 w-3.5 text-gray-400"/>
            </Tooltip>
        );
    }

    if (property.quality && property.quality.length > 0) {
        indicators.push(
            <Tooltip key="qual" content={`${property.quality.length} quality rule(s)`}>
                <CheckCircleIcon className="h-3.5 w-3.5 text-gray-400"/>
            </Tooltip>
        );
    }

    if (property.relationships && property.relationships.length > 0) {
        indicators.push(
            <Tooltip key="rel" content={`${property.relationships.length} relationship(s)`}>
                <LinkIcon className="h-3.5 w-3.5 text-gray-400"/>
            </Tooltip>
        );
    }

    return indicators.length > 0 ? (
        <div className="flex items-center gap-1">
            {indicators}
        </div>
    ) : null;
};

// Component to render array items as a special node
const ItemsRow = ({
                      items,
                      parentPropertyName,
                      schemaIdx,
                      depth = 0,
                      propPath = [],
                      togglePropertyExpansion,
                      updateItems,
                      updateProperty,
                      addSubProperty,
                      removeProperty,
                      expandedProperties,
                      yaml,
                      setYaml
                  }) => {
    const [editingItemsType, setEditingItemsType] = useState(false);
    const jsonSchema = useEditorStore((state) => state.schemaData);

    // Get logical type options dynamically from schema
    const logicalTypeOptions = useMemo(() => {
        const schemaEnums = getSchemaEnumValues(jsonSchema, 'logicalType', 'property');
        return schemaEnums || fallbackLogicalTypeOptions;
    }, [jsonSchema]);

    const pathKey = `${schemaIdx}-${propPath.join('-')}-items`;
    const isExpanded = expandedProperties.has(pathKey);
    const isObject = items?.logicalType === 'object';
    const hasSubProperties = items?.properties && items.properties.length > 0;

    return (
        <>
            <div
                className="border-t border-gray-100 hover:bg-gray-50 group cursor-pointer"
                style={{paddingLeft: `${depth * 1.5}rem`}}
                onClick={() => togglePropertyExpansion(pathKey)}
            >
                {/* Main row for items node */}
                <div className="flex items-center justify-between px-2 pr-2 py-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        {/* Logical Type Icon */}
                        {(() => {
                            const IconComponent = getLogicalTypeIcon(items?.logicalType);
                            return IconComponent ? (
                                <IconComponent className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" />
                            ) : (
                                <div className="h-3.5 w-3.5 flex-shrink-0" />
                            );
                        })()}

                        {/* Items label - showing parent property name with [] */}
                        <span
                            className="px-1 py-0.5 text-sm text-gray-700 font-medium min-w-32 max-w-xs truncate"
                            title={`${parentPropertyName}[]`}
                        >
                            {parentPropertyName}[]
                        </span>

                        {/* Items Type - inline select */}
                        <div className="text-xs text-gray-600 flex items-center">
                            {editingItemsType ? (
                                <select
                                    value={items?.logicalType || ''}
                                    onChange={(e) => {
                                        updateItems('logicalType', e.target.value || undefined);
                                        setEditingItemsType(false);
                                    }}
                                    onBlur={() => setEditingItemsType(false)}
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
                                    className="cursor-pointer text-sm text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 px-2 py-0.5 rounded transition-colors border border-transparent hover:border-indigo-200"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingItemsType(true);
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setEditingItemsType(true);
                                        }
                                    }}
                                    tabIndex={0}
                                    role="button"
                                    aria-label="Edit items type"
                                    title="Click or press Enter to edit items type"
                                >
                                    {items?.logicalType || <span className="text-gray-400 italic">type</span>}
                                </span>
                            )}
                        </div>

                        {/* Description hint */}
                        {items?.description && (
                            <span className="text-xs text-gray-500 truncate" title={items.description}>
                                {items.description}
                            </span>
                        )}
                    </div>

                    {/* Action Icons */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {isObject && (
                            <Tooltip content="Add property to items">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        addSubProperty(schemaIdx, propPath, true);
                                    }}
                                    className="p-1.5 rounded-full hover:bg-indigo-50"
                                    title="Add property to items"
                                >
                                    <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor"
                                         viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                              d="M12 4v16m8-8H4"/>
                                    </svg>
                                </button>
                            </Tooltip>
                        )}
                        {/* Expand/Collapse Button */}
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
                    </div>
                </div>
            </div>

            {/* Expandable Details Section for items */}
            {isExpanded && (
                <div
                    className="border-t border-gray-100 bg-blue-50/20 py-3 px-2"
                    style={{paddingLeft: `${0.5 + depth * 1.5}rem`}}
                >
                    <PropertyDetailsPanel
                        property={items || {}}
                        onUpdate={(updatedItems) => {
                            try {
                                let parsed = {};
                                if (yaml?.trim()) {
                                    try {
                                        parsed = YAML.parse(yaml) || {};
                                    } catch {
                                        parsed = {};
                                    }
                                }

                                if (!parsed.schema || !parsed.schema[schemaIdx] || !parsed.schema[schemaIdx].properties) {
                                    return;
                                }

                                // Navigate to the parent property using propPath
                                let targetProp = parsed.schema[schemaIdx].properties;
                                for (let i = 0; i < propPath.length; i++) {
                                    if (propPath[i] === 'items') {
                                        targetProp = targetProp.items;
                                        if (i < propPath.length - 1 && !targetProp.properties) {
                                            targetProp.properties = [];
                                        }
                                        if (i < propPath.length - 1) {
                                            targetProp = targetProp.properties;
                                        }
                                    } else if (i < propPath.length - 1) {
                                        targetProp = targetProp[propPath[i]];
                                        if (propPath[i + 1] !== 'items') {
                                            targetProp = targetProp.properties;
                                        }
                                    } else {
                                        targetProp = targetProp[propPath[i]];
                                    }
                                }

                                // Update items
                                targetProp.items = updatedItems;

                                const newYaml = YAML.stringify(parsed);
                                setYaml(newYaml);
                            } catch (error) {
                                console.error('Error updating items:', error);
                            }
                        }}
                        onDelete={null} // Items cannot be deleted, only the parent array property can be deleted
                    />
                </div>
            )}

            {/* Render items' sub-properties recursively if items is an object */}
            {hasSubProperties && (
                <>
                    {items.properties.map((subProp, subPropIndex) => (
                        <PropertyRow
                            key={subPropIndex}
                            property={subProp}
                            propIndex={subPropIndex}
                            schemaIdx={schemaIdx}
                            depth={depth + 1}
                            propPath={[...propPath, 'items']}
                            togglePropertyExpansion={togglePropertyExpansion}
                            updateProperty={updateProperty}
                            addSubProperty={addSubProperty}
                            removeProperty={removeProperty}
                            expandedProperties={expandedProperties}
                            yaml={yaml}
                            setYaml={setYaml}
                        />
                    ))}
                </>
            )}

            {/* Render nested items if items is also an array */}
            {items?.logicalType === 'array' && items.items && (
                <ItemsRow
                    items={items.items}
                    parentPropertyName={parentPropertyName + '[]'}
                    schemaIdx={schemaIdx}
                    depth={depth + 1}
                    propPath={[...propPath, 'items']}
                    togglePropertyExpansion={togglePropertyExpansion}
                    updateItems={(field, value) => {
                        try {
                            let parsed = {};
                            if (yaml?.trim()) {
                                try {
                                    parsed = YAML.parse(yaml) || {};
                                } catch {
                                    parsed = {};
                                }
                            }

                            if (!parsed.schema || !parsed.schema[schemaIdx] || !parsed.schema[schemaIdx].properties) {
                                return;
                            }

                            // Navigate to the parent property
                            let targetProp = parsed.schema[schemaIdx].properties;
                            for (let i = 0; i < propPath.length; i++) {
                                if (i < propPath.length - 1) {
                                    targetProp = targetProp[propPath[i]].properties;
                                } else {
                                    targetProp = targetProp[propPath[i]];
                                }
                            }

                            // Update nested items.items
                            if (!targetProp.items) {
                                targetProp.items = {};
                            }
                            if (!targetProp.items.items) {
                                targetProp.items.items = {};
                            }
                            targetProp.items.items[field] = value;

                            const newYaml = YAML.stringify(parsed);
                            setYaml(newYaml);
                        } catch (error) {
                            console.error('Error updating nested items:', error);
                        }
                    }}
                    updateProperty={updateProperty}
                    addSubProperty={addSubProperty}
                    removeProperty={removeProperty}
                    expandedProperties={expandedProperties}
                    yaml={yaml}
                    setYaml={setYaml}
                />
            )}
        </>
    );
};

// Recursive component to render a property and its sub-properties
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
                         yaml,
                         setYaml
                     }) => {
    const [editingPropertyName, setEditingPropertyName] = useState(false);
    const [editedPropertyName, setEditedPropertyName] = useState('');
    const [editingPropertyType, setEditingPropertyType] = useState(false);
    const jsonSchema = useEditorStore((state) => state.schemaData);

    // Get logical type options dynamically from schema
    const logicalTypeOptions = useMemo(() => {
        const schemaEnums = getSchemaEnumValues(jsonSchema, 'logicalType', 'property');
        return schemaEnums || fallbackLogicalTypeOptions;
    }, [jsonSchema]);

    const currentPath = [...propPath, propIndex];
    const pathKey = `${schemaIdx}-${currentPath.join('-')}`;
    const isExpanded = expandedProperties.has(pathKey);
    const isObject = property.logicalType === 'object';
    const isArray = property.logicalType === 'array';
    const hasSubProperties = property.properties && property.properties.length > 0;
    const hasItems = property.items;

    return (
        <>
            <div
                className="border-t border-gray-100 hover:bg-gray-50 group cursor-pointer"
                style={{paddingLeft: `${depth * 1.5}rem`}}
                onClick={() => togglePropertyExpansion(pathKey)}
            >
                {/* Main row with name, type, description */}
                <div className="flex items-center justify-between px-2 pr-2 py-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
                        {/* Logical Type Icon */}
                        {(() => {
                            const IconComponent = getLogicalTypeIcon(property.logicalType);
                            return IconComponent ? (
                                <IconComponent className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" />
                            ) : (
                                <div className="h-3.5 w-3.5 flex-shrink-0" />
                            );
                        })()}

                        {/* Property Name */}
                        {editingPropertyName ? (
                            <input
                                type="text"
                                value={editedPropertyName}
                                onChange={(e) => setEditedPropertyName(e.target.value)}
                                onBlur={() => {
                                    updateProperty(schemaIdx, currentPath, 'name', editedPropertyName.trim());
                                    setEditingPropertyName(false);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        updateProperty(schemaIdx, currentPath, 'name', editedPropertyName.trim());
                                        setEditingPropertyName(false);
                                    } else if (e.key === 'Escape') {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setEditingPropertyName(false);
                                    }
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className="bg-white px-2 py-0.5 text-sm font-medium text-gray-900 rounded border border-indigo-300 focus:outline-none focus:border-indigo-500 min-w-[8rem]"
                                placeholder="property name"
                                size={editedPropertyName ? editedPropertyName.length : 16}
                                autoFocus
                            />
                        ) : (
                            <span
                                className={`cursor-pointer text-sm font-medium hover:text-indigo-600 hover:bg-indigo-50 px-2 py-0.5 rounded transition-colors border border-transparent hover:border-indigo-200 min-w-32 ${
                                    !property.name || property.name.trim() === '' ? 'text-gray-400 italic' : 'text-gray-600'
                                }`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setEditedPropertyName(property.name || '');
                                    setEditingPropertyName(true);
                                }}
                                title={property.name || "Click to edit"}
                            >
                                {!property.name || property.name.trim() === '' ? 'unnamed property' : property.name}
                            </span>
                        )}

                        {/* Property Type - inline select like diagram editor */}
                        <div className="text-xs text-gray-600 flex items-center flex-shrink-0">
                            {editingPropertyType ? (
                                <select
                                    value={property.logicalType || ''}
                                    onChange={(e) => {
                                        updateProperty(schemaIdx, currentPath, 'logicalType', e.target.value || undefined);
                                        setEditingPropertyType(false);
                                    }}
                                    onBlur={() => setEditingPropertyType(false)}
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
                                    className="cursor-pointer text-sm text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 px-2 py-0.5 rounded transition-colors border border-transparent hover:border-indigo-200 whitespace-nowrap"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingPropertyType(true);
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setEditingPropertyType(true);
                                        }
                                    }}
                                    tabIndex={0}
                                    role="button"
                                    aria-label="Edit logical type"
                                    title="Click or press Enter to edit type"
                                >
                  {property.logicalType || <span className="text-gray-400 italic">logicalType</span>}
                </span>
                            )}
                        </div>

                        {/* Visual Indicators */}
                        <PropertyIndicators property={property}/>
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
                        {/* Expand/Collapse Button */}
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
                    </div>
                </div>
            </div>

            {/* Expandable Details Section with PropertyDetailsPanel */}
            {isExpanded && (
                <div
                    className="border-t border-gray-100 bg-gray-50/50 py-3 px-2"
                    style={{paddingLeft: `${0.5 + depth * 1.5}rem`}}
                >
                    <PropertyDetailsPanel
                        property={property}
                        onUpdate={(updatedProperty) => {
                            // Update the entire property at once to avoid multiple YAML parse/stringify cycles
                            try {
                                let parsed = {};
                                if (yaml?.trim()) {
                                    try {
                                        parsed = YAML.parse(yaml) || {};
                                    } catch {
                                        parsed = {};
                                    }
                                }

                                if (!parsed.schema || !parsed.schema[schemaIdx] || !parsed.schema[schemaIdx].properties) {
                                    return;
                                }

                                // Navigate to the target property using currentPath
                                let targetProp = parsed.schema[schemaIdx].properties;
                                for (let i = 0; i < currentPath.length; i++) {
                                    // Check if current path segment is 'items'
                                    if (currentPath[i] === 'items') {
                                        targetProp = targetProp.items;
                                    } else if (i < currentPath.length - 1) {
                                        targetProp = targetProp[currentPath[i]];
                                        // Only navigate to properties if next segment is not 'items'
                                        if (currentPath[i + 1] !== 'items') {
                                            targetProp = targetProp.properties;
                                        }
                                    } else {
                                        targetProp = targetProp[currentPath[i]];
                                    }
                                }

                                // Update all fields at once
                                Object.assign(targetProp, updatedProperty);

                                const newYaml = YAML.stringify(parsed);
                                setYaml(newYaml);
                            } catch (error) {
                                console.error('Error updating property:', error);
                            }
                        }}
                        onDelete={() => removeProperty(schemaIdx, propIndex)}
                    />
                </div>
            )}

            {/* Render sub-properties recursively */}
            {hasSubProperties && (
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
                            yaml={yaml}
                            setYaml={setYaml}
                        />
                    ))}
                </>
            )}

            {/* Render items node for array properties */}
            {isArray && hasItems && (
                <ItemsRow
                    items={property.items}
                    parentPropertyName={property.name}
                    schemaIdx={schemaIdx}
                    depth={depth + 1}
                    propPath={currentPath}
                    togglePropertyExpansion={togglePropertyExpansion}
                    updateItems={(field, value) => {
                        try {
                            let parsed = {};
                            if (yaml?.trim()) {
                                try {
                                    parsed = YAML.parse(yaml) || {};
                                } catch {
                                    parsed = {};
                                }
                            }

                            if (!parsed.schema || !parsed.schema[schemaIdx] || !parsed.schema[schemaIdx].properties) {
                                return;
                            }

                            // Navigate to the target property using currentPath
                            let targetProp = parsed.schema[schemaIdx].properties;
                            for (let i = 0; i < currentPath.length; i++) {
                                if (i < currentPath.length - 1) {
                                    targetProp = targetProp[currentPath[i]].properties;
                                } else {
                                    targetProp = targetProp[currentPath[i]];
                                }
                            }

                            // Update items field
                            if (!targetProp.items) {
                                targetProp.items = {};
                            }
                            targetProp.items[field] = value;

                            const newYaml = YAML.stringify(parsed);
                            setYaml(newYaml);
                        } catch (error) {
                            console.error('Error updating items field:', error);
                        }
                    }}
                    updateProperty={updateProperty}
                    addSubProperty={addSubProperty}
                    removeProperty={removeProperty}
                    expandedProperties={expandedProperties}
                    yaml={yaml}
                    setYaml={setYaml}
                />
            )}
        </>
    );
};

const SchemaEditor = ({schemaIndex}) => {
    const yaml = useEditorStore((state) => state.yaml);
    const setYaml = useEditorStore((state) => state.setYaml);
    const currentView = useEditorStore((state) => state.currentView);
    const jsonSchema = useEditorStore((state) => state.schemaData);
    const [expandedProperties, setExpandedProperties] = useState(new Set()); // Track expanded property paths

    // Get logical type options dynamically from schema
    const logicalTypeOptions = useMemo(() => {
        const schemaEnums = getSchemaEnumValues(jsonSchema, 'logicalType', 'property');
        return schemaEnums || fallbackLogicalTypeOptions;
    }, [jsonSchema]);

    // Dynamically get enum values from schema for schema-level KeyValueEditor fields
    const qualityDimensionOptions = useMemo(() => {
        return getSchemaEnumValues(jsonSchema, 'quality.dimension', 'schema') ||
               ['accuracy', 'completeness', 'conformity', 'consistency', 'coverage', 'timeliness', 'uniqueness'];
    }, [jsonSchema]);

    const qualityTypeOptions = useMemo(() => {
        return getSchemaEnumValues(jsonSchema, 'quality.type', 'schema') ||
               ['library', 'text', 'sql', 'custom'];
    }, [jsonSchema]);

    const qualityMetricOptions = useMemo(() => {
        return getSchemaEnumValues(jsonSchema, 'quality.metric', 'schema') ||
               ['nullValues', 'missingValues', 'invalidValues', 'duplicateValues', 'rowCount'];
    }, [jsonSchema]);

    const relationshipTypeOptions = useMemo(() => {
        return getSchemaEnumValues(jsonSchema, 'relationships.type', 'schema') ||
               ['foreignKey', 'references', 'mapsTo'];
    }, [jsonSchema]);

    // Schema type options for the combobox
    const schemaTypeOptions = [
        {id: 'table', name: 'table'},
        {id: 'view', name: 'view'},
        {id: 'stream', name: 'stream'},
        {id: 'object', name: 'object'}
    ];

    // Parse current YAML to extract the specific schema
    const schemaData = useMemo(() => {
        if (!yaml?.trim()) {
            return {
                schema: null,
                allSchemas: []
            };
        }

        try {
            const parsed = YAML.parse(yaml);
            const allSchemas = parsed.schema || [];

            // Get the specific schema by index
            const schema = (schemaIndex >= 0 && schemaIndex < allSchemas.length)
                ? allSchemas[schemaIndex]
                : null;

            return {
                schema,
                allSchemas
            };
        } catch {
            return {
                schema: null,
                allSchemas: []
            };
        }
    }, [yaml, schemaIndex]);

    // Update schema field
    const updateSchema = (index, field, value) => {
        try {
            let parsed = {};
            if (yaml?.trim()) {
                try {
                    parsed = YAML.parse(yaml) || {};
                } catch {
                    parsed = {};
                }
            }

            if (!parsed.schema) {
                return;
            }

            if (!parsed.schema || !parsed.schema[schemaIndex]) {
                return;
            }

            parsed.schema[schemaIndex][field] = value;

            const newYaml = YAML.stringify(parsed);
            setYaml(newYaml);
        } catch (error) {
            console.error('Error updating schema:', error);
        }
    };

    // Remove schema
    const removeSchema = () => {
        try {
            let parsed = {};
            if (yaml?.trim()) {
                try {
                    parsed = YAML.parse(yaml) || {};
                } catch {
                    return;
                }
            }

            if (!parsed.schema) {
                return;
            }

            if (!parsed.schema || !parsed.schema[schemaIndex]) {
                return;
            }

            parsed.schema.splice(schemaIndex, 1);

            const newYaml = YAML.stringify(parsed);
            setYaml(newYaml);
        } catch (error) {
            console.error('Error removing schema:', error);
        }
    };

    // Add property to schema
    const addProperty = () => {
        try {
            let parsed = {};
            if (yaml?.trim()) {
                try {
                    parsed = YAML.parse(yaml) || {};
                } catch {
                    parsed = {};
                }
            }

            if (!parsed.schema) {
                console.warn('No schema found in YAML');
                return;
            }

            if (!parsed.schema || !parsed.schema[schemaIndex]) {
                console.warn(`Schema at index ${schemaIndex} not found`);
                return;
            }

            if (!parsed.schema[schemaIndex].properties) {
                parsed.schema[schemaIndex].properties = [];
            }

            parsed.schema[schemaIndex].properties.push({
                name: '',
                logicalType: '',
                description: ''
            });

            const newYaml = YAML.stringify(parsed);
            setYaml(newYaml);
        } catch (error) {
            console.error('Error adding property:', error);
        }
    };

    // Update property field (supports nested properties via propPath)
    const updateProperty = (schemaIdx, propPath, field, value) => {
        try {
            let parsed = {};
            if (yaml?.trim()) {
                try {
                    parsed = YAML.parse(yaml) || {};
                } catch {
                    parsed = {};
                }
            }

            if (!parsed.schema) {
                return;
            }

            if (!parsed.schema || !parsed.schema[schemaIndex] || !parsed.schema[schemaIndex].properties) {
                return;
            }

            // Navigate to the target property using propPath
            let targetProp = parsed.schema[schemaIndex].properties;

            // For backward compatibility, if propPath is a number, treat it as old behavior
            if (typeof propPath === 'number') {
                if (!targetProp[propPath]) {
                    return;
                }
                targetProp[propPath][field] = value;
            } else {
                // New behavior: propPath is an array
                for (let i = 0; i < propPath.length; i++) {
                    // Check if current path segment is 'items'
                    if (propPath[i] === 'items') {
                        targetProp = targetProp.items;
                        // Initialize properties array if needed and this is not the last segment
                        if (i < propPath.length - 1 && !targetProp.properties) {
                            targetProp.properties = [];
                        }
                        // Move to properties array if there are more segments
                        if (i < propPath.length - 1) {
                            targetProp = targetProp.properties;
                        }
                    } else if (i < propPath.length - 1) {
                        targetProp = targetProp[propPath[i]];
                        // Only navigate to properties if next segment is not 'items'
                        if (propPath[i + 1] !== 'items') {
                            targetProp = targetProp.properties;
                        }
                    } else {
                        targetProp = targetProp[propPath[i]];
                    }
                }
                targetProp[field] = value;
            }

            const newYaml = YAML.stringify(parsed);
            setYaml(newYaml);
        } catch (error) {
            console.error('Error updating property:', error);
        }
    };

    // Remove property from schema
    const removeProperty = (schemaIdx, propIdx) => {
        try {
            let parsed = {};
            if (yaml?.trim()) {
                try {
                    parsed = YAML.parse(yaml) || {};
                } catch {
                    return;
                }
            }

            if (!parsed.schema) {
                return;
            }

            if (!parsed.schema || !parsed.schema[schemaIndex] || !parsed.schema[schemaIndex].properties) {
                return;
            }

            if (!parsed.schema[schemaIndex].properties[propIdx]) {
                return;
            }

            parsed.schema[schemaIndex].properties.splice(propIdx, 1);

            const newYaml = YAML.stringify(parsed);
            setYaml(newYaml);
        } catch (error) {
            console.error('Error removing property:', error);
        }
    };

    // Add sub-property to a property (for nested objects or items)
    const addSubProperty = (schemaIdx, propPath, isItems = false) => {
        try {
            let parsed = {};
            if (yaml?.trim()) {
                try {
                    parsed = YAML.parse(yaml) || {};
                } catch {
                    parsed = {};
                }
            }

            if (!parsed.schema) {
                console.warn('No schema found in YAML');
                return;
            }

            if (!parsed.schema || !parsed.schema[schemaIndex]) {
                console.warn(`Schema at index ${schemaIndex} not found`);
                return;
            }

            // Navigate to the property using propPath array
            let targetProp = parsed.schema[schemaIndex].properties;
            for (let i = 0; i < propPath.length; i++) {
                // Check if current path segment is 'items'
                if (propPath[i] === 'items') {
                    targetProp = targetProp.items;
                } else {
                    targetProp = targetProp[propPath[i]];
                    if (i < propPath.length - 1 && propPath[i + 1] !== 'items') {
                        targetProp = targetProp.properties;
                    }
                }
            }

            // If isItems, we're adding to items.properties
            if (isItems) {
                if (!targetProp.items) {
                    targetProp.items = {};
                }
                if (!targetProp.items.properties) {
                    targetProp.items.properties = [];
                }
                targetProp.items.properties.push({
                    name: '',
                    logicalType: '',
                    description: ''
                });
            } else {
                // Initialize properties array if it doesn't exist
                if (!targetProp.properties) {
                    targetProp.properties = [];
                }

                targetProp.properties.push({
                    name: '',
                    logicalType: '',
                    description: ''
                });
            }

            const newYaml = YAML.stringify(parsed);
            setYaml(newYaml);
        } catch (error) {
            console.error('Error adding sub-property:', error);
        }
    };

    // Helper to toggle property expansion
    const togglePropertyExpansion = useCallback((pathKey) => {
        setExpandedProperties(prev => {
            const next = new Set(prev);
            if (next.has(pathKey)) {
                next.delete(pathKey);
            } else {
                next.add(pathKey);
            }
            return next;
        });
    }, []);

    return (
        <div className="h-full flex flex-col bg-white">
                <div className="flex-1 overflow-y-auto p-4">
                    <div className="space-y-4">

                        {/* Schema Section */}
                        <div>
                            {schemaData.schema ? (
                                <div>
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="text-base font-semibold leading-6 text-gray-900">
                                            {schemaData.schema.name || schemaData.schema.businessName || 'Untitled Schema'}
                                        </h3>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (window.confirm('Are you sure you want to remove this schema?')) {
                                                    removeSchema();
                                                }
                                            }}
                                            className="p-1 text-gray-400 cursor-pointer border border-gray-300 rounded hover:text-red-400 hover:border-red-400 transition-colors"
                                            title="Remove Schema"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>

                                    {/* Basic Metadata */}
                                    <div className="space-y-4">
                                        {/* Name Field */}
                                        <ValidatedInput
                                            name={`schema-name-${schemaIndex}`}
                                            label="Name"
                                            value={schemaData.schema.name || ''}
                                            onChange={(e) => updateSchema(schemaIndex, 'name', e.target.value)}
                                            required={true}
                                            tooltip="Technical name for the schema (required)"
                                            placeholder="schema_name"
                                        />

                                        {/* Description Field */}
                                        <div>
                                            <div className="flex items-center gap-1 mb-1">
                                                <label htmlFor={`schema-description-${schemaIndex}`}
                                                       className="block text-xs font-medium leading-4 text-gray-900">
                                                    Description
                                                </label>
                                                <Tooltip content="Description of what this schema contains">
                                                    <svg className="w-4 h-4 text-gray-400" fill="currentColor"
                                                         viewBox="0 0 20 20">
                                                        <path fillRule="evenodd"
                                                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                                                              clipRule="evenodd"/>
                                                    </svg>
                                                </Tooltip>
                                            </div>
                                            <textarea
                                                id={`schema-description-${schemaIndex}`}
                                                name={`schema-description-${schemaIndex}`}
                                                rows={2}
                                                value={schemaData.schema.description || ''}
                                                onChange={(e) => updateSchema(schemaIndex, 'description', e.target.value)}
                                                className="mt-1 block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                                                placeholder="Describe the schema..."
                                            />
                                        </div>
                                    </div>

                                    {/* Advanced Metadata Section */}
                                    <div className="mt-6">
                                        <Disclosure>
                                            {({ open }) => (
                                                <>
                                                    <DisclosureButton className="flex w-full items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-left text-xs font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus-visible:ring focus-visible:ring-indigo-500/75">
                                                        <span>Advanced Metadata</span>
                                                        <ChevronRightIcon
                                                            className={`h-3 w-3 text-gray-500 transition-transform ${open ? 'rotate-90' : ''}`}
                                                        />
                                                    </DisclosureButton>
                                                    <DisclosurePanel className="px-3 pt-3 pb-2">
                                                        <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                                                            {/* Business Name Field */}
                                                            <div>
                                                                <div className="flex items-center gap-1 mb-1">
                                                                    <label htmlFor={`schema-business-name-${schemaIndex}`}
                                                                           className="block text-xs font-medium leading-4 text-gray-900">
                                                                        Business Name
                                                                    </label>
                                                                    <Tooltip content="Human-friendly name for the schema">
                                                                        <svg className="w-4 h-4 text-gray-400" fill="currentColor"
                                                                             viewBox="0 0 20 20">
                                                                            <path fillRule="evenodd"
                                                                                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                                                                                  clipRule="evenodd"/>
                                                                        </svg>
                                                                    </Tooltip>
                                                                </div>
                                                                <input
                                                                    type="text"
                                                                    name={`schema-business-name-${schemaIndex}`}
                                                                    id={`schema-business-name-${schemaIndex}`}
                                                                    value={schemaData.schema.businessName || ''}
                                                                    onChange={(e) => updateSchema(schemaIndex, 'businessName', e.target.value)}
                                                                    className="mt-1 block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                                                                    placeholder="Human readable name"
                                                                />
                                                            </div>

                                                            {/* Physical Type Field */}
                                                            <div>
                                                                <div className="flex items-center gap-1 mb-1">
                                                                    <label className="block text-xs font-medium leading-4 text-gray-900">
                                                                        Physical Type
                                                                    </label>
                                                                    <Tooltip content="Physical type of the schema (table, view, etc.)">
                                                                        <svg className="w-4 h-4 text-gray-400" fill="currentColor"
                                                                             viewBox="0 0 20 20">
                                                                            <path fillRule="evenodd"
                                                                                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                                                                                  clipRule="evenodd"/>
                                                                        </svg>
                                                                    </Tooltip>
                                                                </div>
                                                                <div className="mt-1 grid grid-cols-1">
                                                                    <input
                                                                        type="text"
                                                                        value={(() => {
                                                                            const currentType = schemaData.schema.physicalType || 'table';
                                                                            const matchedOption = schemaTypeOptions.find(option => option.id === currentType);
                                                                            return matchedOption ? matchedOption.name : currentType;
                                                                        })()}
                                                                        onChange={(e) => {
                                                                            const inputValue = e.target.value;
                                                                            const matchedOption = schemaTypeOptions.find(option => option.name === inputValue);
                                                                            const typeValue = matchedOption ? matchedOption.id : inputValue;
                                                                            updateSchema(schemaIndex, 'physicalType', typeValue);
                                                                        }}
                                                                        className="col-start-1 row-start-1 block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                                                                        placeholder="table"
                                                                        list={`schema-type-options-${schemaIndex}`}
                                                                    />
                                                                    <datalist id={`schema-type-options-${schemaIndex}`}>
                                                                        {schemaTypeOptions.map((option) => (
                                                                            <option key={option.id} value={option.name}/>
                                                                        ))}
                                                                    </datalist>
                                                                </div>
                                                            </div>

                                                            {/* Physical Name Field */}
                                                            <div>
                                                                <div className="flex items-center gap-1 mb-1">
                                                                    <label htmlFor={`schema-physical-name-${schemaIndex}`}
                                                                           className="block text-xs font-medium leading-4 text-gray-900">
                                                                        Physical Name
                                                                    </label>
                                                                    <Tooltip content="Physical name in the database/storage">
                                                                        <svg className="w-4 h-4 text-gray-400" fill="currentColor"
                                                                             viewBox="0 0 20 20">
                                                                            <path fillRule="evenodd"
                                                                                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                                                                                  clipRule="evenodd"/>
                                                                        </svg>
                                                                    </Tooltip>
                                                                </div>
                                                                <input
                                                                    type="text"
                                                                    name={`schema-physical-name-${schemaIndex}`}
                                                                    id={`schema-physical-name-${schemaIndex}`}
                                                                    value={schemaData.schema.physicalName || ''}
                                                                    onChange={(e) => updateSchema(schemaIndex, 'physicalName', e.target.value)}
                                                                    className="mt-1 block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                                                                    placeholder="shipments_v1"
                                                                />
                                                            </div>

                                                            {/* Logical Type Field */}
                                                            <div>
                                                                <div className="flex items-center gap-1 mb-1">
                                                                    <label htmlFor={`schema-logical-type-${schemaIndex}`}
                                                                           className="block text-xs font-medium leading-4 text-gray-900">
                                                                        Logical Type
                                                                    </label>
                                                                    <Tooltip content="Logical type of the schema (object, array, etc.)">
                                                                        <svg className="w-4 h-4 text-gray-400" fill="currentColor"
                                                                             viewBox="0 0 20 20">
                                                                            <path fillRule="evenodd"
                                                                                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                                                                                  clipRule="evenodd"/>
                                                                        </svg>
                                                                    </Tooltip>
                                                                </div>
                                                                <input
                                                                    type="text"
                                                                    name={`schema-logical-type-${schemaIndex}`}
                                                                    id={`schema-logical-type-${schemaIndex}`}
                                                                    value={schemaData.schema.logicalType || ''}
                                                                    onChange={(e) => updateSchema(schemaIndex, 'logicalType', e.target.value)}
                                                                    className="mt-1 block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                                                                    placeholder="object"
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Data Granularity Description Field */}
                                                        <div className="mt-4">
                                                            <div className="flex items-center gap-1 mb-1">
                                                                <label htmlFor={`schema-data-granularity-${schemaIndex}`}
                                                                       className="block text-xs font-medium leading-4 text-gray-900">
                                                                    Data Granularity Description
                                                                </label>
                                                                <Tooltip content="Describe the level of detail represented by one record">
                                                                    <svg className="w-4 h-4 text-gray-400" fill="currentColor"
                                                                         viewBox="0 0 20 20">
                                                                        <path fillRule="evenodd"
                                                                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                                                                              clipRule="evenodd"/>
                                                                    </svg>
                                                                </Tooltip>
                                                            </div>
                                                            <textarea
                                                                id={`schema-data-granularity-${schemaIndex}`}
                                                                name={`schema-data-granularity-${schemaIndex}`}
                                                                rows={2}
                                                                value={schemaData.schema.dataGranularityDescription || ''}
                                                                onChange={(e) => updateSchema(schemaIndex, 'dataGranularityDescription', e.target.value)}
                                                                className="mt-1 block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                                                                placeholder="e.g., One record per customer per day"
                                                            />
                                                        </div>

                                                        {/* Tags Field */}
                                                        <div className="mt-4">
                                                            <Tags
                                                                label="Tags"
                                                                value={schemaData.schema.tags || []}
                                                                onChange={(value) => updateSchema(schemaIndex, 'tags', value)}
                                                                tooltip="Tags for categorizing and organizing schemas"
                                                                placeholder="Add a tag..."
                                                            />
                                                        </div>

                                                        {/* Data Quality Section */}
                                                        <div className="mt-6">
                                                            <h4 className="text-xs font-medium text-gray-900 mb-3">Data Quality</h4>
                                                            <QualityEditor
                                                                value={schemaData.schema.quality}
                                                                onChange={(value) => updateSchema(schemaIndex, 'quality', value)}
                                                                context="schema"
                                                            />
                                                        </div>

                                                        {/* Authoritative Definitions Section */}
                                                        <div className="mt-6">
                                                            <h4 className="text-xs font-medium text-gray-900 mb-3">Authoritative Definitions</h4>
                                                            <AuthoritativeDefinitionsEditor
                                                                value={schemaData.schema.authoritativeDefinitions}
                                                                onChange={(value) => updateSchema(schemaIndex, 'authoritativeDefinitions', value)}
                                                            />
                                                        </div>

                                                        {/* Relationships Section */}
                                                        <div className="mt-6">
                                                            <h4 className="text-xs font-medium text-gray-900 mb-3">Relationships</h4>
                                                            <KeyValueEditor
                                                                label="Relationship"
                                                                value={schemaData.schema.relationships}
                                                                onChange={(value) => updateSchema(schemaIndex, 'relationships', value)}
                                                                fields={[
                                                                    { name: 'type', label: 'Relationship Type', type: 'select', options: relationshipTypeOptions },
                                                                    { name: 'to', label: 'To', type: 'text', placeholder: 'schema.property or schema/table/properties/property' },
                                                                    { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Describe the relationship...' }
                                                                ]}
                                                                helpText="Define relationships to other schemas (use 'to' field with format: schema.property)"
                                                            />
                                                        </div>

                                                        {/* Custom Properties Section */}
                                                        <div className="mt-6">
                                                            <h4 className="text-xs font-medium text-gray-900 mb-3">Custom Properties</h4>
                                                            <CustomPropertiesEditor
                                                                value={schemaData.schema.customProperties}
                                                                onChange={(value) => updateSchema(schemaIndex, 'customProperties', value)}
                                                                showDescription={true}
                                                                helpText="Organization-specific custom metadata extensions"
                                                            />
                                                        </div>
                                                    </DisclosurePanel>
                                                </>
                                            )}
                                        </Disclosure>
                                    </div>

                                    {/* Properties Section - Schema Tree View */}
                                    <div className="mt-6">
                                        <div className="border border-gray-200 rounded-md">
                                            {/* Header Row */}
                                            <div
                                                className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200 rounded-t-md">
                                                <span className="text-sm font-medium text-gray-700">Properties</span>
                                                <button
                                                    onClick={() => addProperty()}
                                                    className="text-gray-400 hover:text-indigo-600"
                                                    title="Add property"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor"
                                                         viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round"
                                                              strokeWidth={2} d="M12 4v16m8-8H4"/>
                                                    </svg>
                                                </button>
                                            </div>

                                            {/* Properties List */}
                                            {schemaData.schema.properties && schemaData.schema.properties.length > 0 ? (
                                                <div className="rounded-b-md">
                                                    {schemaData.schema.properties.map((property, propIndex) => (
                                                        <PropertyRow
                                                            key={propIndex}
                                                            property={property}
                                                            propIndex={propIndex}
                                                            schemaIdx={schemaIndex}
                                                            depth={0}
                                                            propPath={[]}
                                                            togglePropertyExpansion={togglePropertyExpansion}
                                                            updateProperty={updateProperty}
                                                            addSubProperty={addSubProperty}
                                                            removeProperty={removeProperty}
                                                            expandedProperties={expandedProperties}
                                                            yaml={yaml}
                                                            setYaml={setYaml}
                                                        />
                                                    ))}
                                                </div>
                                            ) : (
                                                <div
                                                    className="px-4 py-8 text-center rounded-b-md cursor-pointer hover:bg-gray-50"
                                                    onClick={() => addProperty()}
                                                >
                                                    <p className="text-sm text-gray-400 mb-2">No properties defined</p>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            addProperty();
                                                        }}
                                                        className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor"
                                                             viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round"
                                                                  strokeWidth={2} d="M12 4v16m8-8H4"/>
                                                        </svg>
                                                        Add property
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-6 text-gray-500">
                                    <p className="text-xs">Schema not found at index {schemaIndex}.</p>
                                    <p className="text-xs mt-1">It may have been deleted.</p>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
        </div>
    );
};

export default SchemaEditor;
