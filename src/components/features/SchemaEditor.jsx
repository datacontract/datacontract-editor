import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useEditorStore} from '../../store.js';
import {isSafeKey} from '../../utils/safeProperty.js';
import {Tooltip} from '../ui/index.js';
import {getSchemaEnumValues} from '../../lib/schemaEnumExtractor.js';
import TagsInput from '../ui/TagsInput.jsx';
import ChevronRightIcon from "../ui/icons/ChevronRightIcon.jsx";
import PropertyDetailsDrawer from '../ui/PropertyDetailsDrawer.jsx';
import RelationshipEditor from '../ui/RelationshipEditor.jsx';
import CustomPropertiesEditor from '../ui/CustomPropertiesEditor.jsx';
import AuthoritativeDefinitionsEditor from '../ui/AuthoritativeDefinitionsEditor.jsx';
import ValidatedInput from '../ui/ValidatedInput.jsx';
import ValidatedTextarea from '../ui/ValidatedTextarea.jsx';
import QualityEditor from '../ui/QualityEditor.jsx';
import QuestionMarkCircleIcon from '../ui/icons/QuestionMarkCircleIcon.jsx';
import {SparkleButton} from '../../ai/index.js';
import {Disclosure, DisclosureButton, DisclosurePanel} from '@headlessui/react';
import PropertyRow from './schema/PropertyRow.jsx';
import {useSchemaOperations} from './schema/useSchemaOperations.js';
import {useCustomization, useIsPropertyHidden, useStandardPropertyOverride} from '../../hooks/useCustomization.js';
import {useInheritedDefinition} from '../../hooks/useInheritedDefinition.js';
import {CustomSections, UngroupedCustomProperties} from '../ui/CustomSection.jsx';
import {DefinitionSelectionModal} from '../ui/DefinitionSelectionModal.jsx';
import {
	DndContext,
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
} from '@dnd-kit/core';
import {
	SortableContext,
	sortableKeyboardCoordinates,
	verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {restrictToVerticalAxis, restrictToParentElement} from '@dnd-kit/modifiers';

const SchemaEditor = ({schemaIndex}) => {
	const jsonSchema = useEditorStore((state) => state.schemaData);
	const yamlParts = useEditorStore((state) => state.yamlParts);
	const editorConfig = useEditorStore((state) => state.editorConfig);
	const removeValue = useEditorStore((state) => state.removeValue);
	const {
		schema,
		setValue,
		removeSchema,
		addProperty,
		handleSaveAndAddNext,
		updateProperty,
		removeProperty,
		addSubProperty,
		reorderProperty
	} = useSchemaOperations(schemaIndex);
	const [expandedProperties, setExpandedProperties] = useState(new Set()); // Track expanded property paths for nested items
	const [isDefinitionModalOpen, setIsDefinitionModalOpen] = useState(false);

	// Drag-and-drop sensors configuration
	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 8, // 8px threshold prevents accidental drags
			},
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	// Handle drag end for property reordering
	const handleDragEnd = useCallback((event) => {
		const {active, over} = event;
		if (!over || active.id === over.id) return;

		// Extract indices from IDs (format: "prop-{index}")
		const fromIndex = parseInt(active.id.toString().replace('prop-', ''), 10);
		const toIndex = parseInt(over.id.toString().replace('prop-', ''), 10);

		if (!isNaN(fromIndex) && !isNaN(toIndex)) {
			reorderProperty([], fromIndex, toIndex);
		}
	}, [reorderProperty]);

	// Get customization config for schema level
	const {customProperties: customPropertyConfigs, customSections} = useCustomization('schema');

	// Fetch inherited values from the schema-level semantic / authoritative
	// definition (if any). Same pattern PropertyDetailsPanel uses for properties.
	const currentSchema = schema?.[schemaIndex] || {};
	const {definitionData: schemaDefinitionData} = useInheritedDefinition(currentSchema.authoritativeDefinitions);

	// Check hidden status for standard properties
	const isNameHidden = useIsPropertyHidden('schema', 'name');
	const isPhysicalTypeHidden = useIsPropertyHidden('schema', 'physicalType');
	const isPhysicalNameHidden = useIsPropertyHidden('schema', 'physicalName');
	const isDescriptionHidden = useIsPropertyHidden('schema', 'description');
	const isBusinessNameHidden = useIsPropertyHidden('schema', 'businessName');
	const isDataGranularityDescriptionHidden = useIsPropertyHidden('schema', 'dataGranularityDescription');
	const isTagsHidden = useIsPropertyHidden('schema', 'tags');
	const isLogicalTypeHidden = useIsPropertyHidden('schema', 'logicalType');

	// Standard property overrides
	const nameOverride = useStandardPropertyOverride('schema', 'name');
	const physicalTypeOverride = useStandardPropertyOverride('schema', 'physicalType');
	const physicalNameOverride = useStandardPropertyOverride('schema', 'physicalName');
	const descriptionOverride = useStandardPropertyOverride('schema', 'description');
	const businessNameOverride = useStandardPropertyOverride('schema', 'businessName');
	const logicalTypeOverride = useStandardPropertyOverride('schema', 'logicalType');

	// Convert array format to object lookup for UI components
	const customPropertiesLookup = useMemo(() => {
		const cp = schema?.[schemaIndex]?.customProperties;
		if (!Array.isArray(cp)) return cp || {};
		return cp.reduce((acc, item) => {
			if (item?.property !== undefined && isSafeKey(item.property)) {
				acc[item.property] = item.value;
			}
			return acc;
		}, {});
	}, [schema, schemaIndex]);

	// Build context for condition evaluation
	const schemaContext = useMemo(() => {
		const currentSchema = schema?.[schemaIndex] || {};
		return {
			name: currentSchema.name,
			physicalType: currentSchema.physicalType,
			physicalName: currentSchema.physicalName,
			description: currentSchema.description,
			businessName: currentSchema.businessName,
			logicalType: currentSchema.logicalType,
			dataGranularityDescription: currentSchema.dataGranularityDescription,
			...customPropertiesLookup,
		};
	}, [schema, schemaIndex, customPropertiesLookup]);

	// Handle custom property changes - stores as array format per ODCS standard
	const updateCustomProperty = useCallback((propName, value) => {
		const currentSchema = schema?.[schemaIndex] || {};
		// Convert object format to array format if needed
		let currentArray;
		const cp = currentSchema.customProperties;
		if (Array.isArray(cp)) {
			currentArray = cp;
		} else if (cp && typeof cp === 'object') {
			currentArray = Object.entries(cp).map(([k, v]) => ({property: k, value: v}));
		} else {
			currentArray = [];
		}

		if (value === undefined) {
			const updated = currentArray.filter(item => item.property !== propName);
			setValue(`schema[${schemaIndex}].customProperties`, updated.length > 0 ? updated : undefined);
		} else {
			const existingIndex = currentArray.findIndex(item => item.property === propName);
			if (existingIndex >= 0) {
				const updated = [...currentArray];
				updated[existingIndex] = {property: propName, value};
				setValue(`schema[${schemaIndex}].customProperties`, updated);
			} else {
				setValue(`schema[${schemaIndex}].customProperties`, [...currentArray, {property: propName, value}]);
			}
		}
	}, [schema, schemaIndex, setValue]);

	// Selected property state for drawer
	const [selectedProperty, setSelectedProperty] = useState(null);
	const [selectedPropertyPath, setSelectedPropertyPath] = useState(null);

	// Ref for properties container to detect outside clicks
	const propertiesContainerRef = useRef(null);
	const drawerRef = useRef(null);

	// Refs for auto-editing newly added properties (like diagram editor)
	const shouldEditNextProperty = useRef(false);
	const previousPropertyCount = useRef(0);
	const nextPropertyToEdit = useRef(null); // { schemaIdx, propPath }

	// State to track which property index should auto-edit
	const [autoEditPropertyIndex, setAutoEditPropertyIndex] = useState(null);

	// Wrapper to handle save and add next with auto-edit
	const handleSaveAndAddNextWrapper = useCallback((schemaIdx, propPath, newName) => {
		const newPropertyIndex = handleSaveAndAddNext(schemaIdx, propPath, newName);
		if (newPropertyIndex !== undefined) {
			setAutoEditPropertyIndex(newPropertyIndex);
		}
	}, [handleSaveAndAddNext]);

	// Close drawer when schema index changes
	useEffect(() => {
		setSelectedProperty(null);
		setSelectedPropertyPath(null);
	}, [schemaIndex]);

	// Track whether initial expansion has been applied for the current schemaIndex.
	// Reset on schemaIndex change so we re-expand when navigating to another schema.
	const hasInitializedExpansion = useRef(false);
	useEffect(() => {
		hasInitializedExpansion.current = false;
	}, [schemaIndex]);

	// On first availability of properties for the current schema, expand all nested
	// objects/arrays so the full structure is visible by default.
	useEffect(() => {
		if (hasInitializedExpansion.current) return;

		const properties = schema?.[schemaIndex]?.properties;
		if (!Array.isArray(properties)) return;

		const keys = new Set();

		const collectFromProperties = (props, propPath) => {
			if (!Array.isArray(props)) return;
			props.forEach((prop, idx) => {
				const currentPath = [...propPath, idx];
				const pathKey = `${schemaIndex}-${currentPath.join('-')}`;
				const hasSubProps = Array.isArray(prop?.properties) && prop.properties.length > 0;
				const isArrayType = prop?.logicalType === 'array';
				const hasItems = !!prop?.items;

				if (hasSubProps || (isArrayType && hasItems)) {
					keys.add(pathKey);
				}
				if (hasSubProps) {
					collectFromProperties(prop.properties, currentPath);
				}
				if (isArrayType && hasItems) {
					collectFromItems(prop.items, currentPath);
				}
			});
		};

		const collectFromItems = (items, propPath) => {
			if (!items) return;
			const itemsPathKey = `${schemaIndex}-${propPath.join('-')}-items`;
			const itemsPath = [...propPath, 'items'];
			const hasSubProps = Array.isArray(items?.properties) && items.properties.length > 0;
			const isArrayType = items?.logicalType === 'array';
			const hasNestedItems = !!items?.items;

			if (hasSubProps || (isArrayType && hasNestedItems)) {
				keys.add(itemsPathKey);
			}
			if (hasSubProps) {
				collectFromProperties(items.properties, itemsPath);
			}
			if (isArrayType && hasNestedItems) {
				collectFromItems(items.items, itemsPath);
			}
		};

		collectFromProperties(properties, []);
		setExpandedProperties(keys);
		hasInitializedExpansion.current = true;
	}, [schema, schemaIndex]);

	// Track property count for auto-edit detection
	useEffect(() => {
		try {
			previousPropertyCount.current = schema?.[schemaIndex]?.properties?.length || 0;
		} catch {
			// Ignore parse errors
		}
	}, [schemaIndex, schema]);

	// Auto-edit newly added property (like diagram editor)
	useEffect(() => {
		if (!shouldEditNextProperty.current || !nextPropertyToEdit.current) return;

		try {
			const currentCount = schema?.[schemaIndex]?.properties?.length || 0;

			if (currentCount > previousPropertyCount.current) {
				// A new property was added - the PropertyRow will detect this via its own state
				previousPropertyCount.current = currentCount;
				shouldEditNextProperty.current = false;
				nextPropertyToEdit.current = null;
			}
		} catch {
			// Ignore parse errors
		}
	}, [schema, schemaIndex]);

	// Sync selected property with YAML changes (e.g., when editing inline)
	useEffect(() => {
		if (!selectedProperty || !selectedProperty.propPath) return;

		try {
			if (schema?.[schemaIndex]?.properties) return;

			// Navigate to the property using the propPath array from selectedProperty
			const propPath = selectedProperty.propPath;
			let currentProp = schema[schemaIndex].properties;

			for (let i = 0; i < propPath.length; i++) {
				if (propPath[i] === 'items') {
					currentProp = currentProp?.items;
				} else if (typeof propPath[i] === 'number') {
					currentProp = currentProp?.[propPath[i]];
					// Check if next segment is 'items', if not navigate to properties
					if (i < propPath.length - 1 && propPath[i + 1] !== 'items') {
						currentProp = currentProp?.properties;
					}
				}
			}

			if (currentProp) {
				setSelectedProperty(prev => ({
					...prev,
					property: currentProp
				}));
			}
		} catch {
			// Ignore parse errors
		}
	}, [schema, selectedProperty?.propPath, schemaIndex]);

	// Close drawer when clicking outside properties and drawer
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (!selectedProperty) return;

			const isInsideProperties = propertiesContainerRef.current?.contains(event.target);
			const isInsideDrawer = drawerRef.current?.contains(event.target);
			// Check if click is inside a dialog/modal (Headless UI adds data-headlessui-state)
			const isInsideDialog = event.target.closest('[role="dialog"]') ||
				event.target.closest('[data-headlessui-state]');

			if (!isInsideProperties && !isInsideDrawer && !isInsideDialog) {
				setSelectedProperty(null);
				setSelectedPropertyPath(null);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [selectedProperty]);

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

	// Handle keyboard shortcuts for selected property (Delete/Backspace to remove)
	useEffect(() => {
		const handleKeyDown = (event) => {
			if (!selectedProperty) return;

			// Check if we're inside an input/textarea - don't delete if typing
			const activeElement = document.activeElement;
			const isTyping = activeElement?.tagName === 'INPUT' ||
				activeElement?.tagName === 'TEXTAREA' ||
				activeElement?.isContentEditable;

			if (isTyping) return;

			// Delete or Backspace to remove property
			if (event.key === 'Delete' || event.key === 'Backspace') {
				event.preventDefault();

				const propPath = selectedProperty.propPath;
				const propIdx = propPath[propPath.length - 1];

				// Only support deleting top-level properties for now
				if (propPath.length === 1 && typeof propIdx === 'number') {
					if (window.confirm('Are you sure you want to delete this property?')) {
						removeProperty(schemaIndex, propIdx);
						setSelectedProperty(null);
						setSelectedPropertyPath(null);
					}
				}
			}
		};

		document.addEventListener('keydown', handleKeyDown);
		return () => {
			document.removeEventListener('keydown', handleKeyDown);
		};
	}, [selectedProperty, schemaIndex, removeProperty]);

	// Helper to toggle property expansion (for nested structures)
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

	// Handle property selection for drawer
	const handleSelectProperty = useCallback((propPath, property, definition) => {
		// Build proper path string for PropertyDetailsDrawer
		let pathStr = `schema[${schemaIndex}].properties`;

		for (let i = 0; i < propPath.length; i++) {
			if (propPath[i] === 'items') {
				pathStr += '.items';
				if (i < propPath.length - 1) {
					pathStr += '.properties';
				}
			} else {
				pathStr += `[${propPath[i]}]`;
				if (i < propPath.length - 1 && propPath[i + 1] !== 'items') {
					pathStr += '.properties';
				}
			}
		}

		setSelectedPropertyPath(pathStr);
		setSelectedProperty({
			propPath,
			property,
			definition,
		});

		// Auto-expand objects and arrays on selection so the user can immediately
		// see/add sub-properties or items.
		const effectiveLogicalType = property?.logicalType || definition?.logicalType;
		if (effectiveLogicalType === 'object' || effectiveLogicalType === 'array') {
			const pathKey = `${schemaIndex}-${propPath.join('-')}`;
			setExpandedProperties(prev => {
				if (prev.has(pathKey)) return prev;
				const next = new Set(prev);
				next.add(pathKey);
				return next;
			});
		}
	}, [schemaIndex]);

	// Handle closing the drawer
	const handleCloseDrawer = useCallback(() => {
		setSelectedProperty(null);
		setSelectedPropertyPath(null);
	}, []);

	// Add property from a selected definition
	// Only sets name and definition link - other values are inherited from the definition
	const addPropertyFromDefinition = useCallback((definition) => {
		try {
			if (!schema || !schema[schemaIndex]) {
				console.warn('Schema at index not found:', schemaIndex);
				return;
			}
			console.log('Definition selected: ', definition);

			const currentProperties = schema[schemaIndex].properties || [];
			const newProperty = {
				name: definition.businessName || definition.name?.split('/').pop() || '',
				authoritativeDefinitions: [{type: 'semantics', url: definition.url}],
			};

			setValue(`schema[${schemaIndex}].properties`, [...currentProperties, newProperty]);
			setIsDefinitionModalOpen(false);
		} catch (error) {
			console.error('Error adding property from definition:', error);
		}
	}, [schema, schemaIndex, setValue]);

	return (
		<div className="h-full flex flex-col bg-white">
			<div className="flex-1 overflow-y-auto p-4">
				<div className="space-y-4">

					{/* Schema Section */}
					<div>
						{schema[schemaIndex] ? (
							<div className="relative">
								<h3 className="text-base font-semibold leading-6 text-gray-900">
									{schema[schemaIndex].name || schema[schemaIndex].businessName || 'Untitled Schema'}
								</h3>
								<p className="mt-1 text-xs leading-4 text-gray-500 mb-4">Define the structure and properties of this schema, including field types, constraints, and metadata.</p>
								<button
									type="button"
									onClick={() => {
										if (window.confirm('Are you sure you want to remove this schema?')) {
											removeSchema();
										}
									}}
									className="absolute top-0 right-0 p-1 text-gray-400 cursor-pointer border border-gray-300 rounded hover:text-red-400 hover:border-red-400 transition-colors"
									title="Remove Schema"
								>
									<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24"
											 stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
													d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
									</svg>
								</button>

								{/* Basic Metadata */}
								<div className="space-y-4">
									{/* Name Field */}
									{!isNameHidden && (
										<ValidatedInput
											name={`schema-name-${schemaIndex}`}
											label={nameOverride?.title || 'Name'}
											value={schema[schemaIndex].name || ''}
											onChange={(e) => setValue(`schema[${schemaIndex}].name`, e.target.value)}
											required={nameOverride?.required ?? true}
											tooltip={nameOverride?.description || 'Technical name for the schema (required)'}
											placeholder={nameOverride?.placeholder || 'schema_name'}
											pattern={nameOverride?.pattern}
											patternMessage={nameOverride?.patternMessage}
											minLength={nameOverride?.minLength}
											maxLength={nameOverride?.maxLength}
											validationKey={`schema.${schemaIndex}.name`}
											validationSection="Schema"
										/>
									)}

									{/* Description Field */}
									{!isDescriptionHidden && (
										<ValidatedTextarea
											name={`schema-description-${schemaIndex}`}
											label={descriptionOverride?.title || 'Description'}
											value={schema[schemaIndex].description || ''}
											onChange={(e) => setValue(`schema[${schemaIndex}].description`, e.target.value)}
											onClear={() => removeValue(`schema[${schemaIndex}].description`)}
											required={descriptionOverride?.required ?? false}
											tooltip={descriptionOverride?.description || 'Description of what this schema contains'}
											placeholder={schemaDefinitionData?.description || descriptionOverride?.placeholder || 'Describe the schema...'}
											placeholderClassName={schemaDefinitionData?.description && !schema[schemaIndex].description ? 'placeholder:text-blue-400' : 'placeholder:text-gray-400'}
											minLength={descriptionOverride?.minLength}
											maxLength={descriptionOverride?.maxLength}
											rows={2}
											actions={
												<SparkleButton
													fieldName={`Description for "${schema[schemaIndex].name || 'schema'}"`}
													fieldPath={`schema[${schemaIndex}].description`}
													currentValue={schema[schemaIndex].description || ''}
													onSuggestion={(value) => setValue(`schema[${schemaIndex}].description`, value)}
													placeholder="Description of what this schema/table contains and its purpose"
												/>
											}
										/>
									)}
								</div>

								{/* Advanced Metadata Section */}
								<div className="mt-6">
									<Disclosure>
										{({open}) => (
											<>
												<DisclosureButton
													className="flex w-full items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-left text-xs font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus-visible:ring focus-visible:ring-indigo-500/75">
													<span>Advanced Metadata</span>
													<ChevronRightIcon
														className={`h-3 w-3 text-gray-500 transition-transform ${open ? 'rotate-90' : ''}`}
													/>
												</DisclosureButton>
												<DisclosurePanel className="px-3 pt-3 pb-2">
													<div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
														{/* Business Name Field */}
														{!isBusinessNameHidden && (
															<ValidatedInput
																name={`schema-business-name-${schemaIndex}`}
																label={businessNameOverride?.title || 'Business Name'}
																value={schema[schemaIndex].businessName || ''}
																onChange={(e) => setValue(`schema[${schemaIndex}].businessName`, e.target.value)}
																required={businessNameOverride?.required ?? false}
																tooltip={businessNameOverride?.description || 'Human-friendly name for the schema'}
																placeholder={schemaDefinitionData?.businessName || businessNameOverride?.placeholder || 'Human readable name'}
																placeholderClassName={schemaDefinitionData?.businessName && !schema[schemaIndex].businessName ? 'placeholder:text-blue-400' : 'placeholder:text-gray-400'}
																pattern={businessNameOverride?.pattern}
																patternMessage={businessNameOverride?.patternMessage}
																minLength={businessNameOverride?.minLength}
																maxLength={businessNameOverride?.maxLength}
															/>
														)}

														{/* Physical Type Field */}
														{!isPhysicalTypeHidden && (
															<div>
																<ValidatedInput
																	name={`schema-physical-type-${schemaIndex}`}
																	label={physicalTypeOverride?.title || 'Physical Type'}
																	value={(() => {
																		const currentType = schema[schemaIndex].physicalType || 'table';
																		const matchedOption = schemaTypeOptions.find(option => option.id === currentType);
																		return matchedOption ? matchedOption.name : currentType;
																	})()}
																	onChange={(e) => {
																		const inputValue = e.target.value;
																		const matchedOption = schemaTypeOptions.find(option => option.name === inputValue);
																		const typeValue = matchedOption ? matchedOption.id : inputValue;
																		setValue(`schema[${schemaIndex}].physicalType`, typeValue);
																	}}
																	required={physicalTypeOverride?.required ?? false}
																	tooltip={physicalTypeOverride?.description || 'Physical type of the schema (table, view, etc.)'}
																	placeholder={schemaDefinitionData?.physicalType || physicalTypeOverride?.placeholder || 'table'}
																	placeholderClassName={schemaDefinitionData?.physicalType && !schema[schemaIndex].physicalType ? 'placeholder:text-blue-400' : 'placeholder:text-gray-400'}
																	pattern={physicalTypeOverride?.pattern}
																	patternMessage={physicalTypeOverride?.patternMessage}
																	minLength={physicalTypeOverride?.minLength}
																	maxLength={physicalTypeOverride?.maxLength}
																	list={`schema-type-options-${schemaIndex}`}
																/>
																<datalist id={`schema-type-options-${schemaIndex}`}>
																	{schemaTypeOptions.map((option) => (
																		<option key={option.id} value={option.name}/>
																	))}
																</datalist>
															</div>
														)}

														{/* Physical Name Field */}
														{!isPhysicalNameHidden && (
															<ValidatedInput
																name={`schema-physical-name-${schemaIndex}`}
																label={physicalNameOverride?.title || 'Physical Name'}
																value={schema[schemaIndex].physicalName || ''}
																onChange={(e) => setValue(`schema[${schemaIndex}].physicalName`, e.target.value)}
																required={physicalNameOverride?.required ?? false}
																tooltip={physicalNameOverride?.description || 'Physical name in the database/storage'}
																placeholder={schemaDefinitionData?.physicalName || physicalNameOverride?.placeholder || 'shipments_v1'}
																placeholderClassName={schemaDefinitionData?.physicalName && !schema[schemaIndex].physicalName ? 'placeholder:text-blue-400' : 'placeholder:text-gray-400'}
																pattern={physicalNameOverride?.pattern}
																patternMessage={physicalNameOverride?.patternMessage}
																minLength={physicalNameOverride?.minLength}
																maxLength={physicalNameOverride?.maxLength}
															/>
														)}

														{/* Logical Type Field */}
														{!isLogicalTypeHidden && (
															<ValidatedInput
																name={`schema-logical-type-${schemaIndex}`}
																label={logicalTypeOverride?.title || 'Logical Type'}
																value={schema[schemaIndex].logicalType || ''}
																onChange={(e) => setValue(`schema[${schemaIndex}].logicalType`, e.target.value)}
																required={logicalTypeOverride?.required ?? false}
																tooltip={logicalTypeOverride?.description || 'Logical type of the schema (object, array, etc.)'}
																placeholder={schemaDefinitionData?.logicalType || logicalTypeOverride?.placeholder || 'object'}
																placeholderClassName={schemaDefinitionData?.logicalType && !schema[schemaIndex].logicalType ? 'placeholder:text-blue-400' : 'placeholder:text-gray-400'}
																pattern={logicalTypeOverride?.pattern}
																patternMessage={logicalTypeOverride?.patternMessage}
																minLength={logicalTypeOverride?.minLength}
																maxLength={logicalTypeOverride?.maxLength}
															/>
														)}
													</div>

													{/* Data Granularity Description Field */}
													{!isDataGranularityDescriptionHidden && (
														<div className="mt-4">
															<div className="flex items-center gap-1 mb-1">
																<label htmlFor={`schema-data-granularity-${schemaIndex}`}
																			 className="block text-xs font-medium leading-4 text-gray-900">
																	Data Granularity Description
																</label>
																<Tooltip content="Describe the level of detail represented by one record">
																	<QuestionMarkCircleIcon/>
																</Tooltip>
															</div>
															<textarea
																id={`schema-data-granularity-${schemaIndex}`}
																name={`schema-data-granularity-${schemaIndex}`}
																rows={2}
																value={schema[schemaIndex].dataGranularityDescription || ''}
																onChange={(e) => setValue(`schema[${schemaIndex}].dataGranularityDescription`, e.target.value)}
																className={`mt-1 block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 ${schemaDefinitionData?.dataGranularityDescription && !schema[schemaIndex].dataGranularityDescription ? 'placeholder:text-blue-400' : 'placeholder:text-gray-400'} focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4`}
																placeholder={schemaDefinitionData?.dataGranularityDescription || "e.g., One record per customer per day"}
															/>
														</div>
													)}

													{/* Tags Field */}
													{!isTagsHidden && (
														<div className="mt-4">
															<TagsInput
																label="Tags"
																value={schema[schemaIndex].tags || []}
																onChange={(value) => setValue(`schema[${schemaIndex}].tags`, value)}
																tooltip="Tags for categorizing and organizing schemas"
																placeholder="Add a tag..."
															/>
														</div>
													)}

													{/* Data Quality Section */}
													<div className="mt-6">
														<QualityEditor
															value={schema[schemaIndex].quality}
															// TODO: Implement update
															onChange={(value) => setValue(`schema[${schemaIndex}].quality`, value)}
															context="schema"
														/>
													</div>

													{/* Authoritative Definitions Section */}
													<div className="mt-6">
														<AuthoritativeDefinitionsEditor
															value={schema[schemaIndex].authoritativeDefinitions}
															onChange={(value) => setValue(`schema[${schemaIndex}].authoritativeDefinitions`, value)}
														/>
													</div>

													{/* Relationships Section */}
													<div className="mt-6">
														<RelationshipEditor
															value={schema[schemaIndex].relationships}
															onChange={(value) => setValue(`schema[${schemaIndex}].relationships`, value)}
															relationshipTypeOptions={relationshipTypeOptions}
															showFrom={true}
														/>
													</div>

													{/* Custom Sections from Customization */}
													<div className="mt-6">
														<CustomSections
															customSections={customSections}
															customProperties={customPropertyConfigs}
															values={customPropertiesLookup}
															onPropertyChange={updateCustomProperty}
															context={schemaContext}
															yamlParts={yamlParts}
															validationKeyPrefix={`schema.${schemaIndex}`}
															validationSection="Schema"
														/>
													</div>

													{/* Ungrouped Custom Properties */}
													<div className="mt-4">
														<UngroupedCustomProperties
															customProperties={customPropertyConfigs}
															customSections={customSections}
															values={customPropertiesLookup}
															onPropertyChange={updateCustomProperty}
															context={schemaContext}
															yamlParts={yamlParts}
															validationKeyPrefix={`schema.${schemaIndex}`}
															validationSection="Schema"
														/>
													</div>

													{/* Custom Properties Section (raw key-value editor) */}
													<div className="mt-6">
														<CustomPropertiesEditor
															value={schema[schemaIndex].customProperties}
															onChange={(value) => setValue(`schema[${schemaIndex}].customProperties`, value)}
															showDescription={true}
															managedProperties={customPropertyConfigs.map(c => c.property)}
														/>
													</div>
												</DisclosurePanel>
											</>
										)}
									</Disclosure>
								</div>

								{/* Properties Section - Schema Tree View */}
								<div className="mt-6" ref={propertiesContainerRef}>
									<div className="border border-gray-200 rounded-md">
										{/* Header Row */}
										<div
											className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200 rounded-t-md">
											<span className="text-sm font-medium text-gray-700">Properties</span>
											<div className="flex items-center gap-2">
												{(editorConfig?.semantics?.baseUrl || editorConfig?.definitions?.baseUrl) && (
													<button
														onClick={() => setIsDefinitionModalOpen(true)}
														className="rounded-sm bg-white px-2 py-1 text-xs font-semibold text-gray-900 shadow-xs inset-ring inset-ring-gray-300 hover:bg-gray-50"
														title="Add from Definition"
													>
														Add from Definition
													</button>
												)}
												<button
													onClick={() => addProperty()}
													className="text-gray-400 hover:text-indigo-600 cursor-pointer"
													title="Add property"
												>
													<svg className="w-4 h-4" fill="none" stroke="currentColor"
															 viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round"
																	strokeWidth={2} d="M12 4v16m8-8H4"/>
													</svg>
												</button>
											</div>
										</div>

										{/* Properties List with Drag-and-Drop */}
										{schema[schemaIndex].properties && schema[schemaIndex].properties.length > 0 ? (
											<DndContext
												sensors={sensors}
												collisionDetection={closestCenter}
												onDragEnd={handleDragEnd}
												modifiers={[restrictToVerticalAxis, restrictToParentElement]}
											>
												<SortableContext
													items={schema[schemaIndex].properties.map((_, idx) => `prop-${idx}`)}
													strategy={verticalListSortingStrategy}
												>
													<div className="rounded-b-md">
														{schema[schemaIndex].properties.map((property, propIndex) => (
															<PropertyRow
																key={`prop-${propIndex}`}
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
																onSelectProperty={handleSelectProperty}
																selectedPropertyPath={selectedPropertyPath}
																totalPropertiesCount={schema[schemaIndex].properties.length}
																onSaveAndAddNext={handleSaveAndAddNextWrapper}
																autoEditNewProperty={autoEditPropertyIndex === propIndex}
																setValue={setValue}
																onAutoEditComplete={() => setAutoEditPropertyIndex(null)}
																sortableId={`prop-${propIndex}`}
																isDragEnabled={true}
															/>
														))}
													</div>
												</SortableContext>
											</DndContext>
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

			{/* Property Details Drawer */}
			<PropertyDetailsDrawer
				ref={drawerRef}
				open={selectedProperty !== null}
				onClose={handleCloseDrawer}
				propertyPath={selectedPropertyPath}
			/>

			{/* Definition Selection Modal */}
			<DefinitionSelectionModal
				isOpen={isDefinitionModalOpen}
				onClose={() => setIsDefinitionModalOpen(false)}
				onSelect={addPropertyFromDefinition}
			/>
		</div>
	);
};

export default SchemaEditor;
