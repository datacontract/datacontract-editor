import {Tooltip} from '../../ui/index.js';
import ChevronRightIcon from "../../ui/icons/ChevronRightIcon.jsx";
import {getLogicalTypeIcon} from './propertyIcons.js';
import {TypeSelector} from '../../ui/TypeSelector';

/**
 * Component to render array items as a special node
 * Displays items[] with type selector and nested properties/items
 */
const ItemsRow = ({
                      items,
                      parentPropertyName,
                      schemaIdx,
                      depth = 0,
                      propPath = [],
                      updateItems,
                      updateProperty,
                      addSubProperty,
                      removeProperty,
                      expandedProperties,
                      togglePropertyExpansion,
                      onSelectProperty,
                      selectedPropertyPath,
                      setValue,
                      PropertyRow // Passed to avoid circular dependency
                  }) => {
    const pathKey = `${schemaIdx}-${propPath.join('-')}-items`;
    const isExpanded = expandedProperties.has(pathKey);
    const isObject = items?.logicalType === 'object';
    const hasSubProperties = items?.properties && items.properties.length > 0;
    const itemsPath = [...propPath, 'items'];
    const isSelected = selectedPropertyPath === itemsPath.join('-');

    const handleSelect = (e) => {
        e.stopPropagation();
        onSelectProperty(itemsPath, items);
    };

    return (
        <>
            <div
                className={`border-t border-gray-100 group cursor-pointer ${isSelected ? 'bg-indigo-50 hover:bg-indigo-100 ring-1 ring-inset ring-indigo-200' : 'hover:bg-gray-50'}`}
                style={{paddingLeft: `${depth * 1.5}rem`}}
                onClick={handleSelect}
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

                        {/* Items Type - TypeSelector for logical and physical types */}
                        <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                            <TypeSelector
                                logicalType={items?.logicalType}
                                onLogicalTypeChange={(value) => updateItems('logicalType', value || undefined)}
                                physicalType={items?.physicalType}
                                onPhysicalTypeChange={(value) => updateItems('physicalType', value || undefined)}
                            />
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
                                        // propPath already points to the parent property, so pass isItems=true
                                        // This will create the path: schema[x].properties[y].items.properties
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
                        {/* Expand/Collapse Button for nested items */}
                        {(hasSubProperties || (items?.logicalType === 'array' && items.items)) && (
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

            {/* Render items' sub-properties recursively if items is an object and expanded */}
            {isExpanded && hasSubProperties && PropertyRow && (
                <>
                    {items.properties.map((subProp, subPropIndex) => (
                        <PropertyRow
                            key={subPropIndex}
                            property={subProp}
                            propIndex={subPropIndex}
                            schemaIdx={schemaIdx}
                            depth={depth + 1}
                            propPath={itemsPath}
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

            {/* Render nested items if items is also an array and expanded */}
            {isExpanded && items?.logicalType === 'array' && items.items && (
                <ItemsRow
                    items={items.items}
                    parentPropertyName={parentPropertyName + '[]'}
                    schemaIdx={schemaIdx}
                    depth={depth + 1}
                    propPath={itemsPath}
                    updateItems={updateItems}
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

export default ItemsRow;
