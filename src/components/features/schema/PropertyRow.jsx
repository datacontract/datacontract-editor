import {memo, useEffect, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Tooltip} from '../../ui/index.js';
import ChevronRightIcon from "../../ui/icons/ChevronRightIcon.jsx";
import PropertyIndicators from './PropertyIndicators.jsx';
import ItemsRow from './ItemsRow.jsx';
import {getLogicalTypeIcon} from './propertyIcons.js';
import {TypeSelector} from '../../ui/TypeSelector';
import {useSortable} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import {toAbsoluteUrl} from "../../../lib/urlUtils.js";
import DefinitionIcon from "../../ui/icons/DefinitionIcon.jsx";
import {useDefinition} from '../../../hooks/useDefinition.js';
import {isSemanticAuthDef} from '../../../utils/authDefTypes.js';
import {useEditorStore} from '../../../store.js';
import {useInsertFlash} from '../../browse/useInsertFlash.js';
import {propertyLinkIdentity, propertyMatchesLink} from '../../browse/useContractLinks.js';
import {useBrowseDropIndicator} from '../../browse/browseDropContext.js';
import {buildPropertyPath} from '../../../utils/schemaPathBuilder.js';

// Examples column shows at most this many chips; the rest collapse into a "+n" with the
// full list in the tooltip, so a property with many examples doesn't truncate mid-value.
const MAX_EXAMPLE_CHIPS = 2;

// ODCS allows any JSON value as an example; objects and arrays would otherwise render
// as "[object Object]".
const formatExample = (value) => {
	if (value === null || value === undefined) return '';
	if (typeof value === 'object') {
		try {
			return JSON.stringify(value);
		} catch {
			return String(value);
		}
	}
	return String(value);
};

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
											 setValue, // Pass setValue for ItemsRow updateItems callback
											 sortableId, // Unique ID for sortable (provided by parent)
											 isDragEnabled = false // Only enable at top-level when wrapped in DndContext
										 }) => {
	const { t } = useTranslation();
	// Disable layout animation to prevent visual glitch on drop
	const animateLayoutChanges = () => false;

	// Sortable hook for drag-and-drop
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({
		id: sortableId || `${schemaIdx}-${propIndex}`,
		disabled: !isDragEnabled,
		animateLayoutChanges,
	});

	const sortableStyle = isDragEnabled ? {
		transform: CSS.Transform.toString(transform),
		transition: isDragging ? transition : 'none', // Only animate while dragging
		opacity: isDragging ? 0.5 : 1,
		zIndex: isDragging ? 1000 : 'auto',
		position: 'relative',
	} : {};

	const [editingPropertyName, setEditingPropertyName] = useState(false);
	const [editedPropertyName, setEditedPropertyName] = useState('');
	const inputRef = useRef(null);

	// Get definition data using hook
	const { getDefinition } = useDefinition();
	const [definition, setDefinition] = useState(null);
	const definitionUrl = (property.authoritativeDefinitions?.find(d => isSemanticAuthDef(d)) || property.authoritativeDefinitions?.find(d => d.type === 'definition'))?.url;
	const absoluteDefinitionUrl = definitionUrl ? toAbsoluteUrl(definitionUrl) : null;

	// Fetch definition data when URL changes
	useEffect(() => {
		if (!absoluteDefinitionUrl) {
			setDefinition(null);
			return;
		}

		let cancelled = false;

		const fetchDef = async () => {
			const data = await getDefinition(absoluteDefinitionUrl);
			if (!cancelled) {
				setDefinition(data);
			}
		};

		fetchDef();

		return () => {
			cancelled = true;
		};
	}, [absoluteDefinitionUrl, getDefinition]);

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

	// Determine effective logical type: use property's logicalType if set, otherwise use definition's
	const effectiveLogicalType = property.logicalType || definition?.logicalType;
	const isLogicalTypeFromDefinition = !property.logicalType && !!definition?.logicalType;

	const isObject = effectiveLogicalType === 'object';
	const isArray = effectiveLogicalType === 'array';
	const hasSubProperties = property.properties && property.properties.length > 0;
	const hasItems = property.items;
	const isSelected = selectedPropertyPath === buildPropertyPath(schemaIdx, currentPath);

	// Drop feedback for drags coming from the browse panel (top-level rows
	// only): an insertion line above the row, or a ring when hovering the
	// row's middle to link onto this existing property.
	const dropIndicator = useBrowseDropIndicator();
	const indicatorMatches = depth === 0
		&& dropIndicator?.schemaIndex === schemaIdx
		&& dropIndicator.index === propIndex;
	const showDropIndicator = indicatorMatches && dropIndicator.mode === 'insert';
	const isLinkTarget = indicatorMatches && dropIndicator.mode === 'link';

	// When this row was just inserted from the browse panel, scroll it into
	// view and flash it — otherwise a + click that appends below the fold
	// gives no visible feedback.
	const rowRef = useRef(null);
	const isFlashing = useInsertFlash(schemaIdx, propIndex, { enabled: depth === 0, scrollRef: rowRef });

	// Cross-highlight: hovering a linked element in the browse panel
	// highlights its counterpart rows here.
	const hoveredContractLink = useEditorStore((state) => state.hoveredContractLink);
	const isHoverHighlighted = propertyMatchesLink(property, hoveredContractLink);
	const setHoveredSchemaProperty = useEditorStore((state) => state.setHoveredSchemaProperty);

	const handleSelect = (e) => {
		e.stopPropagation();
		onSelectProperty(currentPath, property);
	};

	return (
		<>
			{showDropIndicator && <div className="h-0.5 bg-indigo-500 relative z-10"/>}
			<div
				ref={(el) => {
					rowRef.current = el;
					if (isDragEnabled) setNodeRef(el);
				}}
				className={`border-t border-gray-100 group cursor-pointer transition-colors duration-700 ${isLinkTarget ? 'bg-indigo-50 ring-2 ring-inset ring-indigo-400' : isFlashing ? 'bg-indigo-100' : isHoverHighlighted ? 'bg-blue-50 ring-1 ring-inset ring-blue-300' : isSelected ? 'bg-indigo-50 hover:bg-indigo-100 ring-1 ring-inset ring-indigo-200' : 'hover:bg-gray-50'} ${isDragging ? 'shadow-lg bg-white' : ''}`}
				style={{paddingLeft: `${depth * 1.5}rem`, ...sortableStyle}}
				onClick={handleSelect}
				onMouseEnter={() => setHoveredSchemaProperty(propertyLinkIdentity(property))}
				onMouseLeave={() => setHoveredSchemaProperty(null)}
			>
				{/* Main row with name, type, description */}
				<div className="relative flex items-center px-2 py-1.5 bg-inherit">
					<div className="flex items-center gap-1.5 flex-1 min-w-0">
						{/* Logical Type Icon - also serves as drag handle when drag is enabled */}
						<span
							{...(isDragEnabled ? {...attributes, ...listeners} : {})}
							className={isDragEnabled ? "cursor-grab active:cursor-grabbing touch-none" : ""}
							onClick={(e) => isDragEnabled && e.stopPropagation()}
							title={isDragEnabled ? t("schema.properties.dragToReorder") : undefined}
						>
                            {(() => {
															const IconComponent = getLogicalTypeIcon(effectiveLogicalType);
															return IconComponent ? (
																<IconComponent className="h-3.5 w-3.5 text-gray-500 flex-shrink-0"/>
															) : (
																<div className="h-3.5 w-3.5 flex-shrink-0"/>
															);
														})()}
                        </span>

						{/* Property Name - shared measured width for alignment (see useMeasuredColumns) */}
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
								className="bg-white px-1.5 py-0.5 text-sm font-medium text-gray-900 rounded border border-indigo-300 focus:outline-none focus:border-indigo-500 shrink-0"
								style={{width: 'var(--prop-name-w, 14rem)'}}
								placeholder="property name"
								autoFocus
							/>
						) : (() => {
							const hasOwnName = !!property.name && property.name.toString().trim() !== '';
							const inheritedName = !hasOwnName && (definition?.name || definition?.businessName);
							const displayName = hasOwnName
								? property.name
								: inheritedName || 'unnamed property';
							const colorClass = hasOwnName
								? 'text-gray-600'
								: inheritedName
									? 'text-blue-500'
									: 'text-gray-400 italic';
							return (
								<span
									className={`cursor-pointer text-sm font-medium hover:text-indigo-600 hover:bg-indigo-50 px-1.5 py-0.5 rounded transition-colors border border-transparent hover:border-indigo-200 shrink-0 truncate ${colorClass}`}
									style={{width: 'var(--prop-name-w, 14rem)'}}
									onClick={(e) => {
										e.stopPropagation();
										onSelectProperty(currentPath, property);
										setEditedPropertyName(property?.name || '');
										setEditingPropertyName(true);
									}}
									title={property.name || (inheritedName ? `Inherited: ${inheritedName}` : 'Click to edit')}
								>
									<span data-measure="name">{displayName}</span>
								</span>
							);
						})()}

						{/* Property Type - shared measured width for alignment */}
						<div className="flex-shrink-0" style={{width: 'var(--prop-type-w, 7rem)'}} onClick={(e) => e.stopPropagation()}>
							<TypeSelector
								logicalType={property.logicalType}
								onLogicalTypeChange={(value) => updateProperty(schemaIdx, currentPath, 'logicalType', value || undefined)}
								physicalType={property.physicalType}
								onPhysicalTypeChange={(value) => updateProperty(schemaIdx, currentPath, 'physicalType', value || undefined)}
								fallbackLogicalType={definition?.logicalType}
								isLogicalTypeFromDefinition={isLogicalTypeFromDefinition}
							/>
						</div>

						{/* Definition icon slot — always reserved so descriptions align across rows */}
						<div className="w-3.5 flex-shrink-0">
							{definitionUrl &&
								<Tooltip key="def" content={`Definition: ${definitionUrl}`}>
									<DefinitionIcon className="h-3.5 w-3.5 text-blue-400 cursor-pointer"/>
								</Tooltip>
							}
						</div>

						{/* Visual Indicators - fixed width for alignment */}
						<div className="w-14 flex-shrink-0">
							<PropertyIndicators property={property}/>
						</div>

						{/* Description preview — takes the remaining width; falls back to the inherited
						    definition's description in blue when the property has none of its own,
						    mirroring the type-from-definition affordance just above. */}
						{property.description ? (
							<span className="text-xs text-gray-400 truncate flex-1 min-w-0" title={property.description}>
                                {property.description}
                            </span>
						) : definition?.description ? (
							<span className="text-xs text-blue-400 truncate flex-1 min-w-0" title={`Inherited: ${definition.description}`}>
                                {definition.description}
                            </span>
						) : (
							<span className="flex-1 min-w-0"/>
						)}

						{/* Examples preview — a fixed, left-aligned column after the description so the
						    values line up across rows instead of ragging along the right edge. The slot
						    is always reserved so it never shifts. It is hidden below @3xl, compact with
						    a single chip up to @5xl (preview pane open), and full width above that.
						    Own examples in gray, otherwise the inherited definition's in blue, mirroring
						    the description above. Chips already read as sample values, so the "e.g."
						    prefix lives only in the tooltip; no border keeps them quieter than the name. */}
						{(() => {
							const hasOwnExamples = property.examples && property.examples.length > 0;
							const examples = hasOwnExamples ? property.examples : definition?.examples;
							if (!examples || examples.length === 0) {
								return <span className="hidden @3xl:block basis-36 @5xl:basis-52 shrink-0"/>;
							}
							const labels = examples.map(formatExample);
							const shown = labels.slice(0, MAX_EXAMPLE_CHIPS);
							const overflow = labels.length - shown.length;
							const text = `e.g. ${labels.join(', ')}`;
							const chipClass = hasOwnExamples
								? 'bg-gray-100 text-gray-500'
								: 'bg-gray-100 text-blue-500';
							const countClass = hasOwnExamples ? 'text-gray-400' : 'text-blue-400';
							return (
								<span
									className="hidden @3xl:flex items-center gap-1 basis-36 @5xl:basis-52 min-w-0 shrink-0 overflow-hidden"
									title={hasOwnExamples ? text : `Inherited: ${text}`}
								>
									{shown.map((label, i) => (
										<span
											key={i}
											className={`font-mono text-[11px] leading-4 tabular-nums px-1 rounded truncate min-w-0 ${i > 0 ? 'hidden @5xl:block' : ''} ${chipClass}`}
										>
											{label}
										</span>
									))}
									{/* The compact column shows one chip, so its overflow count differs. */}
									{labels.length > 1 && (
										<span className={`@5xl:hidden text-[11px] leading-4 shrink-0 ${countClass}`}>
											+{labels.length - 1}
										</span>
									)}
									{overflow > 0 && (
										<span className={`hidden @5xl:inline text-[11px] leading-4 shrink-0 ${countClass}`}>
											+{overflow}
										</span>
									)}
								</span>
							);
						})()}
					</div>

					{/* Action Icons — overlaid on the row's right edge on hover instead of reserving
					    space in flow, so the description keeps the full width. bg-inherit picks up
					    the row's hover/selection tint so the buttons cover the text underneath. */}
					<div className="absolute inset-y-0 right-2 flex items-center gap-1 pl-3 bg-inherit opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity">
						{isObject && (
							<Tooltip content={t("schema.properties.addSubProperty")}>
								<button
									onClick={(e) => {
										e.stopPropagation();
										addSubProperty(schemaIdx, currentPath);
									}}
									className="p-1.5 rounded-full hover:bg-indigo-50"
									title={t("schema.properties.addSubProperty")}
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

		const prevWithExpandedArray = {...prevProps, expandedProperties: prevExpandedArray};
		const nextWithExpandedArray = {...nextProps, expandedProperties: nextExpandedArray};

		return JSON.stringify(prevWithExpandedArray) === JSON.stringify(nextWithExpandedArray);
	} catch (error) {
		// Fallback to false if stringify fails (e.g., circular references)
		console.warn('PropertyRow memo comparison failed:', error);
		return false;
	}
};

export default memo(PropertyRow, arePropsEqual);
