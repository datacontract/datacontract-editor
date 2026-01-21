import { useMemo, useCallback, useState, useEffect } from 'react';
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import ChevronRightIcon from '../ui/icons/ChevronRightIcon.jsx';
import ChevronDownIcon from '../ui/icons/ChevronDownIcon.jsx';
import ExternalLinkIcon from '../ui/icons/ExternalLinkIcon.jsx';
import ArrayInput from '../ui/ArrayInput.jsx';
import RelationshipEditor from '../ui/RelationshipEditor.jsx';
import AuthoritativeDefinitionsEditor from '../ui/AuthoritativeDefinitionsEditor.jsx';
import CustomPropertiesEditor from '../ui/CustomPropertiesEditor.jsx';
import EnumField from '../ui/EnumField.jsx';
import Tags from '../ui/Tags.jsx';
import QualityEditor from '../ui/QualityEditor.jsx';
import Tooltip from '../ui/Tooltip.jsx';
import { SparkleButton } from '../../ai/index.js';
import { useEditorStore } from '../../store.js';
import { getSchemaEnumValues } from '../../lib/schemaEnumExtractor.js';
import { useCustomization, useIsPropertyHidden, useStandardPropertyOverride } from '../../hooks/useCustomization.js';
import { CustomSections, UngroupedCustomProperties } from '../ui/CustomSection.jsx';
import { DefinitionSelectionModal } from '../ui/DefinitionSelectionModal.jsx';
import { toAbsoluteUrl, isExternalUrl, parseDefinitionUrl } from '../../lib/urlUtils.js';

const PropertyDetailsPanel = ({ property, onUpdate, onDelete }) => {
  const jsonSchema = useEditorStore((state) => state.schemaData);
  const yamlParts = useEditorStore((state) => state.yamlParts);
  const editorConfig = useEditorStore((state) => state.editorConfig);

  // Modal state
  const [isDefinitionModalOpen, setIsDefinitionModalOpen] = useState(false);

  // Definition data state
  const [definitionData, setDefinitionData] = useState(null);
  const [isFetchingDefinition, setIsFetchingDefinition] = useState(false);

  // Get customization config for schema.properties level
  const { customProperties: customPropertyConfigs, customSections } = useCustomization('schema.properties');

  // Check hidden status for standard properties
  const isNameHidden = useIsPropertyHidden('schema.properties', 'name');
  const isBusinessNameHidden = useIsPropertyHidden('schema.properties', 'businessName');
  const isPhysicalNameHidden = useIsPropertyHidden('schema.properties', 'physicalName');
  const isLogicalTypeHidden = useIsPropertyHidden('schema.properties', 'logicalType');
  const isPhysicalTypeHidden = useIsPropertyHidden('schema.properties', 'physicalType');
  const isDescriptionHidden = useIsPropertyHidden('schema.properties', 'description');
  const isExamplesHidden = useIsPropertyHidden('schema.properties', 'examples');
  const isRequiredHidden = useIsPropertyHidden('schema.properties', 'required');
  const isUniqueHidden = useIsPropertyHidden('schema.properties', 'unique');
  const isPrimaryKeyHidden = useIsPropertyHidden('schema.properties', 'primaryKey');
  const isPartitionedHidden = useIsPropertyHidden('schema.properties', 'partitioned');
  const isClassificationHidden = useIsPropertyHidden('schema.properties', 'classification');
  const isCriticalDataElementHidden = useIsPropertyHidden('schema.properties', 'criticalDataElement');
  const isEncryptedNameHidden = useIsPropertyHidden('schema.properties', 'encryptedName');
  const isTransformSourceObjectsHidden = useIsPropertyHidden('schema.properties', 'transformSourceObjects');
  const isTransformLogicHidden = useIsPropertyHidden('schema.properties', 'transformLogic');
  const isTransformDescriptionHidden = useIsPropertyHidden('schema.properties', 'transformDescription');

  // Semantics enabled via embed config (not customization)
  const isSemanticsEnabled = editorConfig?.semantics?.enabled ?? false;

  // Get overrides for standard properties
  const classificationOverride = useStandardPropertyOverride('schema.properties', 'classification');

  // Convert array format to object lookup for UI components
  const customPropertiesLookup = useMemo(() => {
    const cp = property.customProperties;
    if (!Array.isArray(cp)) return cp || {};
    return cp.reduce((acc, item) => {
      if (item?.property !== undefined) {
        acc[item.property] = item.value;
      }
      return acc;
    }, {});
  }, [property.customProperties]);

  // Build context for condition evaluation (includes property values + custom properties)
  const propertyContext = useMemo(() => ({
    name: property.name,
    businessName: property.businessName,
    physicalName: property.physicalName,
    logicalType: property.logicalType,
    physicalType: property.physicalType,
    description: property.description,
    required: property.required,
    unique: property.unique,
    primaryKey: property.primaryKey,
    partitioned: property.partitioned,
    classification: property.classification,
    criticalDataElement: property.criticalDataElement,
    ...customPropertiesLookup,
  }), [property, customPropertiesLookup]);

  // Handle custom property changes - stores as array format per ODCS standard
  const updateCustomProperty = useCallback((propName, value) => {
    // Convert object format to array format if needed
    let currentArray;
    const cp = property.customProperties;
    if (Array.isArray(cp)) {
      currentArray = cp;
    } else if (cp && typeof cp === 'object') {
      currentArray = Object.entries(cp).map(([k, v]) => ({ property: k, value: v }));
    } else {
      currentArray = [];
    }

    if (value === undefined) {
      const updated = currentArray.filter(item => item.property !== propName);
      onUpdate('customProperties', updated.length > 0 ? updated : undefined);
    } else {
      const existingIndex = currentArray.findIndex(item => item.property === propName);
      if (existingIndex >= 0) {
        const updated = [...currentArray];
        updated[existingIndex] = { property: propName, value };
        onUpdate('customProperties', updated);
      } else {
        onUpdate('customProperties', [...currentArray, { property: propName, value }]);
      }
    }
  }, [property.customProperties, onUpdate]);

  // Dynamically get enum values from schema
  const qualityDimensionOptions = useMemo(() => {
    return getSchemaEnumValues(jsonSchema, 'quality.dimension', 'property') ||
           ['accuracy', 'completeness', 'conformity', 'consistency', 'coverage', 'timeliness', 'uniqueness'];
  }, [jsonSchema]);

  const qualityTypeOptions = useMemo(() => {
    return getSchemaEnumValues(jsonSchema, 'quality.type', 'property') ||
           ['library', 'text', 'sql', 'custom'];
  }, [jsonSchema]);

  const qualityMetricOptions = useMemo(() => {
    return getSchemaEnumValues(jsonSchema, 'quality.metric', 'property') ||
           ['nullValues', 'missingValues', 'invalidValues', 'duplicateValues', 'rowCount'];
  }, [jsonSchema]);

  const relationshipTypeOptions = useMemo(() => {
    return getSchemaEnumValues(jsonSchema, 'relationships.type', 'property') ||
           ['foreignKey', 'references', 'mapsTo'];
  }, [jsonSchema]);

  const updateField = (field, value) => {
    onUpdate(field, value);
  };

  // Get semantic definition from authoritative definitions (type === 'definition')
  const semanticDefinition = useMemo(() => {
    const def = property.authoritativeDefinitions?.find(d => d.type === 'definition');
    console.log('Semantic definition found:', def);
    return def;
  }, [property.authoritativeDefinitions]);

  // Get absolute URL and check if external
  const semanticDefinitionAbsoluteUrl = useMemo(() => {
    const url = semanticDefinition?.url ? toAbsoluteUrl(semanticDefinition.url) : null;
    console.log('Absolute URL:', url, 'Original URL:', semanticDefinition?.url);
    return url;
  }, [semanticDefinition?.url]);

  const isSemanticDefinitionExternal = useMemo(() => {
    if (!semanticDefinition?.url) return false;

    const external = isExternalUrl(semanticDefinition.url);
    console.log('Is external URL:', external);
    console.log('Current window.location.hostname:', window.location.hostname);
    console.log('Current window.location.href:', window.location.href);

    // Try to get the definition URL's hostname
    try {
      const defUrl = new URL(semanticDefinition.url, window.location.href);
      console.log('Definition URL hostname:', defUrl.hostname);
      console.log('Definition URL (full):', defUrl.href);
      console.log('Hostnames match:', defUrl.hostname === window.location.hostname);
    } catch (e) {
      console.error('Error parsing definition URL:', e);
    }

    return external;
  }, [semanticDefinition?.url]);

  // Fetch definition data when semantic definition URL is available
  useEffect(() => {
    if (!semanticDefinitionAbsoluteUrl) {
      setDefinitionData(null);
      return;
    }

    // Only fetch for internal URLs to avoid CORS issues
    if (isSemanticDefinitionExternal) {
      console.log('Skipping fetch - external URL');
      setDefinitionData(null);
      return;
    }

    const fetchDefinition = async () => {
      setIsFetchingDefinition(true);
      try {
        // Parse the definition URL to extract info and construct API endpoint
        const parsedUrl = parseDefinitionUrl(semanticDefinitionAbsoluteUrl);

        if (!parsedUrl) {
          console.error('Unable to parse definition URL:', semanticDefinitionAbsoluteUrl);
          setDefinitionData(null);
          setIsFetchingDefinition(false);
          return;
        }

        console.log('Parsed definition URL:', parsedUrl);
        console.log('Fetching from API endpoint:', parsedUrl.apiUrl);

        const response = await fetch(parsedUrl.apiUrl);
        if (response.ok) {
          const data = await response.json();
          console.log('Fetched definition data:', data);
          setDefinitionData(data);
        } else {
          console.error('Failed to fetch definition - HTTP', response.status, response.statusText);
          setDefinitionData(null);
        }
      } catch (error) {
        console.error('Failed to fetch definition:', error);
        setDefinitionData(null);
      } finally {
        setIsFetchingDefinition(false);
      }
    };

    fetchDefinition();
  }, [semanticDefinitionAbsoluteUrl, isSemanticDefinitionExternal]);

  // Remove semantic definition
  const removeSemanticDefinition = useCallback(() => {
    const filtered = property.authoritativeDefinitions?.filter(d => d.type !== 'definition');
    updateField('authoritativeDefinitions', filtered?.length ? filtered : undefined);
  }, [property.authoritativeDefinitions, updateField]);

  // Build tooltip content for definition preview
  const buildDefinitionTooltip = useCallback(() => {
    if (isFetchingDefinition) {
      return (
        <div className="text-xs">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 animate-spin rounded-full border-2 border-gray-300 border-t-white"></div>
            <span>Loading definition...</span>
          </div>
        </div>
      );
    }

    if (!definitionData) {
      return (
        <div className="text-xs">
          <div>Unable to load definition data.</div>
          <div className="mt-1 text-gray-400">Check console for details.</div>
        </div>
      );
    }

    return (
      <div className="text-xs space-y-1.5 max-w-sm">
        <div className="font-semibold text-white mb-2">Definition Preview</div>
        {definitionData.name && (
          <div><span className="font-medium text-gray-300">Name:</span> <span className="text-white">{definitionData.name}</span></div>
        )}
        {definitionData.businessName && (
          <div><span className="font-medium text-gray-300">Business Name:</span> <span className="text-white">{definitionData.businessName}</span></div>
        )}
        {definitionData.logicalType && (
          <div><span className="font-medium text-gray-300">Logical Type:</span> <span className="text-white">{definitionData.logicalType}</span></div>
        )}
        {definitionData.physicalType && (
          <div><span className="font-medium text-gray-300">Physical Type:</span> <span className="text-white">{definitionData.physicalType}</span></div>
        )}
        {definitionData.description && (
          <div><span className="font-medium text-gray-300">Description:</span> <span className="text-white">{definitionData.description}</span></div>
        )}
        {definitionData.classification && (
          <div><span className="font-medium text-gray-300">Classification:</span> <span className="text-white">{definitionData.classification}</span></div>
        )}
        {definitionData.examples && definitionData.examples.length > 0 && (
          <div>
            <span className="font-medium text-gray-300">Examples:</span>
            <div className="ml-2 mt-1 space-y-0.5">
              {definitionData.examples.map((ex, idx) => (
                <div key={idx} className="text-white">• {ex}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }, [definitionData, isFetchingDefinition]);

  // Handle definition selection from modal
  const handleDefinitionSelect = useCallback((definition) => {
    console.log('Selected definition from modal:', definition);

    // Use the full URL if available, otherwise use name (which might be a path)
    // The definition.name should contain the full URL like:
    // http://localhost:8888/fabi-demo/definitions/fulfillment/shipment_id
    const definitionUrl = definition.url || definition.name;
    console.log('Using definition URL:', definitionUrl);

    const newDef = { type: 'definition', url: definitionUrl };
    const defs = property.authoritativeDefinitions || [];
    updateField('authoritativeDefinitions', [...defs.filter(d => d.type !== 'definition'), newDef]);
  }, [property.authoritativeDefinitions, updateField]);

  // Get authoritative definitions excluding semantic definition (when semantics section visible)
  const filteredAuthoritativeDefinitions = useMemo(() => {
    if (!isSemanticsEnabled) return property.authoritativeDefinitions;
    return property.authoritativeDefinitions?.filter(d => d.type !== 'definition');
  }, [property.authoritativeDefinitions, isSemanticsEnabled]);

  return (
    <div className="space-y-1.5">
      {/* Metadata Section */}
      <Disclosure defaultOpen>
        {({ open }) => (
          <>
            <DisclosureButton className="flex w-full items-center justify-between rounded bg-gray-50 px-2 py-1 text-left text-xs font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus-visible:ring focus-visible:ring-indigo-500/75">
              <span>Metadata</span>
              <ChevronRightIcon
                className={`h-3 w-3 text-gray-500 transition-transform ${open ? 'rotate-90' : ''}`}
              />
            </DisclosureButton>
            <DisclosurePanel className="px-2 pt-2 pb-1 text-xs text-gray-500 space-y-2">
              {/* Property Name */}
              {!isNameHidden && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Property Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={property.name || ''}
                    onChange={(e) => updateField('name', e.target.value)}
                    className="w-full rounded border border-gray-300 bg-white px-2 py-1 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs"
                    placeholder="property_name"
                  />
                </div>
              )}

              {/* Business Name */}
              {!isBusinessNameHidden && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Business Name</label>
                  <input
                    type="text"
                    value={property.businessName || ''}
                    onChange={(e) => updateField('businessName', e.target.value)}
                    className={`w-full rounded border border-gray-300 bg-white px-2 py-1 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs ${definitionData?.businessName && !property.businessName ? 'placeholder:text-blue-400' : ''}`}
                    placeholder={definitionData?.businessName || "Human-readable name"}
                  />
                </div>
              )}

              {/* Physical Name */}
              {!isPhysicalNameHidden && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Physical Name</label>
                  <input
                    type="text"
                    value={property.physicalName || ''}
                    onChange={(e) => updateField('physicalName', e.target.value)}
                    className={`w-full rounded border border-gray-300 bg-white px-2 py-1 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs ${definitionData?.physicalName && !property.physicalName ? 'placeholder:text-blue-400' : ''}`}
                    placeholder={definitionData?.physicalName || "Actual database column name"}
                  />
                </div>
              )}

              {/* Logical Type */}
              {!isLogicalTypeHidden && (
                <EnumField
                  propertyPath="logicalType"
                  context="property"
                  value={property.logicalType || ''}
                  onChange={(value) => updateField('logicalType', value || undefined)}
                  label="Logical Type"
                  placeholder={definitionData?.logicalType || "Select..."}
                  fallbackOptions={['string', 'date', 'timestamp', 'time', 'number', 'integer', 'object', 'array', 'boolean']}
                  className={definitionData?.logicalType && !property.logicalType ? 'text-blue-400' : ''}
                  valueFromDefinition={definitionData?.logicalType}
                />
              )}

              {/* Array Item Type - only shown when logical type is array */}
              {!isLogicalTypeHidden && property.logicalType === 'array' && (
                <EnumField
                  propertyPath="logicalType"
                  context="property"
                  value={property.items?.logicalType || ''}
                  onChange={(value) => {
                    const items = property.items || {};
                    updateField('items', { ...items, logicalType: value || undefined });
                  }}
                  label="Array Item Type"
                  placeholder="Select item type..."
                  fallbackOptions={['string', 'date', 'timestamp', 'time', 'number', 'integer', 'object', 'array', 'boolean']}
                />
              )}

              {/* Physical Type */}
              {!isPhysicalTypeHidden && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Physical Type</label>
                  <input
                    type="text"
                    value={property.physicalType || ''}
                    onChange={(e) => updateField('physicalType', e.target.value)}
                    className={`w-full rounded border border-gray-300 bg-white px-2 py-1 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs ${definitionData?.physicalType && !property.physicalType ? 'placeholder:text-blue-400' : ''}`}
                    placeholder={definitionData?.physicalType || "e.g., VARCHAR(255)"}
                  />
                </div>
              )}

              {/* Description */}
              {!isDescriptionHidden && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-gray-700">Description</label>
                    <SparkleButton
                      fieldName={`Description for "${property.name || 'property'}"`}
                      fieldPath="property.description"
                      currentValue={property.description}
                      onSuggestion={(value) => updateField('description', value)}
                      placeholder={`Description of the ${property.name || 'data'} field`}
                    />
                  </div>
                  <textarea
                    value={property.description || ''}
                    onChange={(e) => updateField('description', e.target.value)}
                    rows={3}
                    className={`w-full rounded border border-gray-300 bg-white px-2 py-1 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs ${definitionData?.description && !property.description ? 'placeholder:text-blue-400' : ''}`}
                    placeholder={definitionData?.description || "Describe this property..."}
                  />
                </div>
              )}

              {/* Examples */}
              {!isExamplesHidden && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Examples</label>
                  <textarea
                    value={property.examples?.join('\n') || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '') {
                        updateField('examples', undefined);
                      } else {
                        const examples = value.split('\n');
                        updateField('examples', examples);
                      }
                    }}
                    rows={3}
                    className={`w-full rounded border border-gray-300 bg-white px-2 py-1 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs ${definitionData?.examples && !property.examples ? 'placeholder:text-blue-400' : ''}`}
                    placeholder={definitionData?.examples ? definitionData.examples.join('\n') : "example1\nexample2\nexample3"}
                  />
                  <p className="mt-1 text-xs text-gray-500">One example per line (all content preserved)</p>
                </div>
              )}
            </DisclosurePanel>
          </>
        )}
      </Disclosure>

      {/* Semantics Section */}
      {isSemanticsEnabled && (
        <Disclosure>
          {({ open }) => (
            <>
              <DisclosureButton className="flex w-full items-center justify-between rounded bg-gray-50 px-2 py-1 text-left text-xs font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus-visible:ring focus-visible:ring-indigo-500/75">
                <span>Semantics</span>
                <ChevronRightIcon
                  className={`h-3 w-3 text-gray-500 transition-transform ${open ? 'rotate-90' : ''}`}
                />
              </DisclosureButton>
              <DisclosurePanel className="px-2 pt-2 pb-1 text-xs text-gray-500 space-y-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Definition</label>
                  {semanticDefinition ? (
                    <div className="space-y-2">
                      {/* Definition Link */}
                      <Tooltip content={semanticDefinitionAbsoluteUrl}>
                        <a
                          href={semanticDefinitionAbsoluteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-indigo-600 hover:underline flex items-center gap-1 min-w-0"
                        >
                          <span className="truncate">{semanticDefinitionAbsoluteUrl}</span>
                          {isSemanticDefinitionExternal && (
                            <ExternalLinkIcon className="h-3 w-3 flex-shrink-0" />
                          )}
                        </a>
                      </Tooltip>

                      {/* Buttons - Right aligned */}
                      <div className="flex justify-end gap-2">
                        {!isSemanticDefinitionExternal && (
                          <Tooltip content={buildDefinitionTooltip()}>
                            <button
                              className="rounded bg-white px-2 py-1 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                            >
                              Show Details
                            </button>
                          </Tooltip>
                        )}
                        {/* Debug: Show why button might not appear */}
                        {process.env.NODE_ENV === 'development' && isSemanticDefinitionExternal && (
                          <span className="text-xs text-gray-400 italic">
                            (External URL)
                          </span>
                        )}
                        <button
                          onClick={removeSemanticDefinition}
                          className="rounded bg-white px-2 py-1 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : editorConfig?.onSearchDefinitions ? (
                    <button
                      onClick={() => setIsDefinitionModalOpen(true)}
                      className="rounded bg-white px-2 py-1 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    >
                      Find Definition
                    </button>
                  ) : (
                    <span className="text-xs text-gray-400 italic">Definition lookup not configured</span>
                  )}
                </div>
              </DisclosurePanel>
            </>
          )}
        </Disclosure>
      )}

      {/* Logical Type Options Section */}
      <Disclosure>
        {({ open }) => (
          <>
            <DisclosureButton className="flex w-full items-center justify-between rounded bg-gray-50 px-2 py-1 text-left text-xs font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus-visible:ring focus-visible:ring-indigo-500/75">
              <span>Logical Type Options</span>
              <ChevronRightIcon
                className={`h-3 w-3 text-gray-500 transition-transform ${open ? 'rotate-90' : ''}`}
              />
            </DisclosureButton>
            <DisclosurePanel className="px-2 pt-2 pb-1 text-xs text-gray-500 space-y-2">
              {/* String-specific constraints */}
              {(property.logicalType === 'string') && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Format</label>
                    <input
                      type="text"
                      value={property.logicalTypeOptions?.format || ''}
                      onChange={(e) => updateField('logicalTypeOptions', { ...property.logicalTypeOptions, format: e.target.value || undefined })}
                      className={`w-full rounded border border-gray-300 bg-white px-2 py-1 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs ${definitionData?.logicalTypeOptions?.format && !property.logicalTypeOptions?.format ? 'placeholder:text-blue-400' : ''}`}
                      placeholder={definitionData?.logicalTypeOptions?.format || "e.g., email, uri, uuid"}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Min Length</label>
                      <input
                        type="number"
                        value={property.logicalTypeOptions?.minLength || ''}
                        onChange={(e) => updateField('logicalTypeOptions', { ...property.logicalTypeOptions, minLength: parseInt(e.target.value) || undefined })}
                        className="w-full rounded border border-gray-300 bg-white px-2 py-1 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Max Length</label>
                      <input
                        type="number"
                        value={property.logicalTypeOptions?.maxLength || ''}
                        onChange={(e) => updateField('logicalTypeOptions', { ...property.logicalTypeOptions, maxLength: parseInt(e.target.value) || undefined })}
                        className="w-full rounded border border-gray-300 bg-white px-2 py-1 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs"
                        min="0"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Pattern (Regex)</label>
                    <input
                      type="text"
                      value={property.logicalTypeOptions?.pattern || ''}
                      onChange={(e) => updateField('logicalTypeOptions', { ...property.logicalTypeOptions, pattern: e.target.value || undefined })}
                      className="w-full rounded-md border border-gray-300 bg-white px-2 py-1 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs font-mono"
                      placeholder="Regular expression"
                    />
                  </div>
                </>
              )}

              {/* Integer-specific constraints */}
              {property.logicalType === 'integer' && (
                <>
                  <EnumField
                    propertyPath="logicalTypeOptions.integerFormat"
                    context="property"
                    value={property.logicalTypeOptions?.format || ''}
                    onChange={(value) => updateField('logicalTypeOptions', { ...property.logicalTypeOptions, format: value || undefined })}
                    label="Format"
                    placeholder="Select integer format..."
                    allowCustomValue={true}
                    fallbackOptions={['i8', 'i16', 'i32', 'i64', 'i128', 'u8', 'u16', 'u32', 'u64', 'u128']}
                  />
                </>
              )}

              {/* Number-specific constraints */}
              {property.logicalType === 'number' && (
                <>
                  <EnumField
                    propertyPath="logicalTypeOptions.floatFormat"
                    context="property"
                    value={property.logicalTypeOptions?.format || ''}
                    onChange={(value) => updateField('logicalTypeOptions', { ...property.logicalTypeOptions, format: value || undefined })}
                    label="Format"
                    placeholder="Select number format..."
                    allowCustomValue={true}
                    fallbackOptions={['f32', 'f64']}
                  />
                </>
              )}

              {/* Shared Number/Integer constraints */}
              {(property.logicalType === 'number' || property.logicalType === 'integer') && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Minimum</label>
                      <input
                        type="number"
                        value={property.logicalTypeOptions?.minimum ?? ''}
                        onChange={(e) => updateField('logicalTypeOptions', { ...property.logicalTypeOptions, minimum: e.target.value ? parseFloat(e.target.value) : undefined })}
                        className="w-full rounded border border-gray-300 bg-white px-2 py-1 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs"
                        step="any"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Maximum</label>
                      <input
                        type="number"
                        value={property.logicalTypeOptions?.maximum ?? ''}
                        onChange={(e) => updateField('logicalTypeOptions', { ...property.logicalTypeOptions, maximum: e.target.value ? parseFloat(e.target.value) : undefined })}
                        className="w-full rounded border border-gray-300 bg-white px-2 py-1 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs"
                        step="any"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Exclusive Minimum</label>
                      <input
                        type="number"
                        value={property.logicalTypeOptions?.exclusiveMinimum ?? ''}
                        onChange={(e) => updateField('logicalTypeOptions', { ...property.logicalTypeOptions, exclusiveMinimum: e.target.value ? parseFloat(e.target.value) : undefined })}
                        className="w-full rounded border border-gray-300 bg-white px-2 py-1 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs"
                        step="any"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Exclusive Maximum</label>
                      <input
                        type="number"
                        value={property.logicalTypeOptions?.exclusiveMaximum ?? ''}
                        onChange={(e) => updateField('logicalTypeOptions', { ...property.logicalTypeOptions, exclusiveMaximum: e.target.value ? parseFloat(e.target.value) : undefined })}
                        className="w-full rounded border border-gray-300 bg-white px-2 py-1 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs"
                        step="any"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Multiple Of</label>
                    <input
                      type="number"
                      value={property.logicalTypeOptions?.multipleOf ?? ''}
                      onChange={(e) => updateField('logicalTypeOptions', { ...property.logicalTypeOptions, multipleOf: e.target.value ? parseFloat(e.target.value) : undefined })}
                      className="w-full rounded border border-gray-300 bg-white px-2 py-1 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs"
                      step="any"
                      placeholder="Value must be a multiple of this number"
                    />
                  </div>
                </>
              )}

              {/* Date/Timestamp/Time-specific constraints */}
              {(property.logicalType === 'date' || property.logicalType === 'timestamp' || property.logicalType === 'time') && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Format</label>
                    <input
                      type="text"
                      value={property.logicalTypeOptions?.format || ''}
                      onChange={(e) => updateField('logicalTypeOptions', { ...property.logicalTypeOptions, format: e.target.value || undefined })}
                      className={`w-full rounded border border-gray-300 bg-white px-2 py-1 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs ${definitionData?.logicalTypeOptions?.format && !property.logicalTypeOptions?.format ? 'placeholder:text-blue-400' : ''}`}
                      placeholder={definitionData?.logicalTypeOptions?.format || "e.g., yyyy-MM-dd, ISO 8601"}
                    />
                    <p className="mt-1 text-xs text-gray-500">JDK DateTimeFormatter pattern</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Minimum</label>
                      <input
                        type="text"
                        value={property.logicalTypeOptions?.minimum || ''}
                        onChange={(e) => updateField('logicalTypeOptions', { ...property.logicalTypeOptions, minimum: e.target.value || undefined })}
                        className="w-full rounded border border-gray-300 bg-white px-2 py-1 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs"
                        placeholder="Earliest allowed value"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Maximum</label>
                      <input
                        type="text"
                        value={property.logicalTypeOptions?.maximum || ''}
                        onChange={(e) => updateField('logicalTypeOptions', { ...property.logicalTypeOptions, maximum: e.target.value || undefined })}
                        className="w-full rounded border border-gray-300 bg-white px-2 py-1 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs"
                        placeholder="Latest allowed value"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Array-specific constraints */}
              {property.logicalType === 'array' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Min Items</label>
                      <input
                        type="number"
                        value={property.logicalTypeOptions?.minItems || ''}
                        onChange={(e) => updateField('logicalTypeOptions', { ...property.logicalTypeOptions, minItems: parseInt(e.target.value) || undefined })}
                        className="w-full rounded border border-gray-300 bg-white px-2 py-1 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Max Items</label>
                      <input
                        type="number"
                        value={property.logicalTypeOptions?.maxItems || ''}
                        onChange={(e) => updateField('logicalTypeOptions', { ...property.logicalTypeOptions, maxItems: parseInt(e.target.value) || undefined })}
                        className="w-full rounded border border-gray-300 bg-white px-2 py-1 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs"
                        min="0"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="uniqueItems" className="block text-xs font-medium text-gray-700 mb-1">Unique Items</label>
                    <div className="grid grid-cols-1">
                      <select
                        id="uniqueItems"
                        value={property.logicalTypeOptions?.uniqueItems === true ? 'true' : property.logicalTypeOptions?.uniqueItems === false ? 'false' : ''}
                        onChange={(e) => {
                          const newValue = e.target.value === 'true' ? true : e.target.value === 'false' ? false : undefined;
                          updateField('logicalTypeOptions', { ...property.logicalTypeOptions, uniqueItems: newValue });
                        }}
                        className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pl-3 pr-8 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs"
                      >
                        <option value="">Not set</option>
                        <option value="false">False</option>
                        <option value="true">True</option>
                      </select>
                      <ChevronDownIcon
                        aria-hidden="true"
                        className="pointer-events-none col-start-1 row-start-1 mr-2 size-4 self-center justify-self-end text-gray-500"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Message when no type-specific constraints available */}
              {!['string', 'number', 'integer', 'date', 'timestamp', 'time', 'array'].includes(property.logicalType || 'string') && (
                <p className="text-sm text-gray-500 italic">No type-specific constraints available for {property.logicalType || 'this type'}.</p>
              )}
            </DisclosurePanel>
          </>
        )}
      </Disclosure>

      {/* Constraints Section */}
      <Disclosure>
        {({ open }) => (
          <>
            <DisclosureButton className="flex w-full items-center justify-between rounded bg-gray-50 px-2 py-1 text-left text-xs font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus-visible:ring focus-visible:ring-indigo-500/75">
              <span>Constraints</span>
              <ChevronRightIcon
                className={`h-3 w-3 text-gray-500 transition-transform ${open ? 'rotate-90' : ''}`}
              />
            </DisclosureButton>
            <DisclosurePanel className="px-2 pt-2 pb-1 text-xs text-gray-500 space-y-2">
              <div className="grid grid-cols-2 gap-3">
                {/* Required */}
                {!isRequiredHidden && (
                  <div>
                    <label htmlFor="required" className="block text-xs font-medium text-gray-700 mb-1">Required</label>
                    <div className="grid grid-cols-1">
                      <select
                        id="required"
                        value={property.required === true ? 'true' : property.required === false ? 'false' : ''}
                        onChange={(e) => {
                          const newValue = e.target.value === 'true' ? true : e.target.value === 'false' ? false : undefined;
                          updateField('required', newValue);
                        }}
                        className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pl-3 pr-8 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs"
                      >
                        <option value="">Not set</option>
                        <option value="false">False</option>
                        <option value="true">True</option>
                      </select>
                      <ChevronDownIcon
                        aria-hidden="true"
                        className="pointer-events-none col-start-1 row-start-1 mr-2 size-4 self-center justify-self-end text-gray-500"
                      />
                    </div>
                  </div>
                )}

                {/* Unique */}
                {!isUniqueHidden && (
                  <div>
                    <label htmlFor="unique" className="block text-xs font-medium text-gray-700 mb-1">Unique</label>
                    <div className="grid grid-cols-1">
                      <select
                        id="unique"
                        value={property.unique === true ? 'true' : property.unique === false ? 'false' : ''}
                        onChange={(e) => {
                          const newValue = e.target.value === 'true' ? true : e.target.value === 'false' ? false : undefined;
                          updateField('unique', newValue);
                        }}
                        className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pl-3 pr-8 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs"
                      >
                        <option value="">Not set</option>
                        <option value="false">False</option>
                        <option value="true">True</option>
                      </select>
                      <ChevronDownIcon
                        aria-hidden="true"
                        className="pointer-events-none col-start-1 row-start-1 mr-2 size-4 self-center justify-self-end text-gray-500"
                      />
                    </div>
                  </div>
                )}

                {/* Primary Key */}
                {!isPrimaryKeyHidden && (
                  <div>
                    <label htmlFor="primaryKey" className="block text-xs font-medium text-gray-700 mb-1">Primary Key</label>
                    <div className="grid grid-cols-1">
                      <select
                        id="primaryKey"
                        value={property.primaryKey === true ? 'true' : property.primaryKey === false ? 'false' : ''}
                        onChange={(e) => {
                          const newValue = e.target.value === 'true' ? true : e.target.value === 'false' ? false : undefined;
                          updateField('primaryKey', newValue);
                        }}
                        className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pl-3 pr-8 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs"
                      >
                        <option value="">Not set</option>
                        <option value="false">False</option>
                        <option value="true">True</option>
                      </select>
                      <ChevronDownIcon
                        aria-hidden="true"
                        className="pointer-events-none col-start-1 row-start-1 mr-2 size-4 self-center justify-self-end text-gray-500"
                      />
                    </div>
                  </div>
                )}

                {/* Partitioned */}
                {!isPartitionedHidden && (
                  <div>
                    <label htmlFor="partitioned" className="block text-xs font-medium text-gray-700 mb-1">Partitioned</label>
                    <div className="grid grid-cols-1">
                      <select
                        id="partitioned"
                        value={property.partitioned === true ? 'true' : property.partitioned === false ? 'false' : ''}
                        onChange={(e) => {
                          const newValue = e.target.value === 'true' ? true : e.target.value === 'false' ? false : undefined;
                          updateField('partitioned', newValue);
                        }}
                        className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pl-3 pr-8 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs"
                      >
                        <option value="">Not set</option>
                        <option value="false">False</option>
                        <option value="true">True</option>
                      </select>
                      <ChevronDownIcon
                        aria-hidden="true"
                        className="pointer-events-none col-start-1 row-start-1 mr-2 size-4 self-center justify-self-end text-gray-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Primary Key Position - only shown when primaryKey is checked */}
              {property.primaryKey && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Primary Key Position
                  </label>
                  <input
                    type="number"
                    value={property.primaryKeyPosition}
                    onChange={(e) => updateField('primaryKeyPosition', parseInt(e.target.value) || null)}
                    className="w-full rounded border border-gray-300 bg-white px-2 py-1 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs"
                    placeholder="-1"
                    min="-1"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Ordinal position in composite primary key (starts at 1, or -1 for single key)
                  </p>
                </div>
              )}

              {/* Partition Key Position - only shown when partitioned is checked */}
              {property.partitioned && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Partition Key Position
                  </label>
                  <input
                    type="number"
                    value={property.partitionKeyPosition}
                    onChange={(e) => updateField('partitionKeyPosition', parseInt(e.target.value) || null)}
                    className="w-full rounded border border-gray-300 bg-white px-2 py-1 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs"
                    placeholder="-1"
                    min="-1"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Ordinal position in partition hierarchy (starts at 1, or -1 for single partition)
                  </p>
                </div>
              )}
            </DisclosurePanel>
          </>
        )}
      </Disclosure>

      {/* Classification & Security Section */}
      <Disclosure>
        {({ open }) => (
          <>
            <DisclosureButton className="flex w-full items-center justify-between rounded bg-gray-50 px-2 py-1 text-left text-xs font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus-visible:ring focus-visible:ring-indigo-500/75">
              <span>Classification & Security</span>
              <ChevronRightIcon
                className={`h-3 w-3 text-gray-500 transition-transform ${open ? 'rotate-90' : ''}`}
              />
            </DisclosureButton>
            <DisclosurePanel className="px-2 pt-2 pb-1 text-xs text-gray-500 space-y-2">
              {/* Classification */}
              {!isClassificationHidden && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    {classificationOverride?.title || 'Classification'}
                    {classificationOverride?.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {classificationOverride?.enum ? (
                    <div className="grid grid-cols-1">
                      <select
                        value={property.classification || ''}
                        onChange={(e) => updateField('classification', e.target.value || undefined)}
                        className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pl-3 pr-8 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs"
                      >
                        <option value="">{classificationOverride?.placeholder || 'Select...'}</option>
                        {classificationOverride.enum.map((opt) => (
                          <option key={typeof opt === 'string' ? opt : opt.value} value={typeof opt === 'string' ? opt : opt.value}>
                            {typeof opt === 'string' ? opt : (opt.label || opt.title)}
                          </option>
                        ))}
                      </select>
                      <ChevronDownIcon
                        aria-hidden="true"
                        className="pointer-events-none col-start-1 row-start-1 mr-2 size-4 self-center justify-self-end text-gray-500"
                      />
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={property.classification || ''}
                      onChange={(e) => updateField('classification', e.target.value || undefined)}
                      className={`w-full rounded border border-gray-300 bg-white px-2 py-1 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs ${definitionData?.classification && !property.classification ? 'placeholder:text-blue-400' : ''}`}
                      placeholder={definitionData?.classification || (classificationOverride?.placeholder || "e.g., confidential, public, internal")}
                    />
                  )}
                </div>
              )}

              {/* Critical Data Element */}
              {!isCriticalDataElementHidden && (
                <div>
                  <label htmlFor="criticalDataElement" className="block text-xs font-medium text-gray-700 mb-1">Critical Data Element</label>
                  <div className="grid grid-cols-1">
                    <select
                      id="criticalDataElement"
                      value={property.criticalDataElement === true ? 'true' : property.criticalDataElement === false ? 'false' : ''}
                      onChange={(e) => {
                        const newValue = e.target.value === 'true' ? true : e.target.value === 'false' ? false : undefined;
                        updateField('criticalDataElement', newValue);
                      }}
                      className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pl-3 pr-8 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs"
                    >
                      <option value="">Not set</option>
                      <option value="false">False</option>
                      <option value="true">True</option>
                    </select>
                    <ChevronDownIcon
                      aria-hidden="true"
                      className="pointer-events-none col-start-1 row-start-1 mr-2 size-4 self-center justify-self-end text-gray-500"
                    />
                  </div>
                </div>
              )}

              {/* Encrypted Name */}
              {!isEncryptedNameHidden && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Encrypted Name</label>
                  <input
                    type="text"
                    value={property.encryptedName || ''}
                    onChange={(e) => updateField('encryptedName', e.target.value || undefined)}
                    className={`w-full rounded border border-gray-300 bg-white px-2 py-1 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs ${definitionData?.encryptedName && !property.encryptedName ? 'placeholder:text-blue-400' : ''}`}
                    placeholder={definitionData?.encryptedName || "Encrypted field reference"}
                  />
                </div>
              )}

              {/* Tags */}
              <div>
                <Tags
                  label="Tags"
                  value={property.tags || []}
                  onChange={(value) => updateField('tags', value)}
                  placeholder="Add a tag..."
                />
              </div>
            </DisclosurePanel>
          </>
        )}
      </Disclosure>

      {/* Transformations Section */}
      <Disclosure>
        {({ open }) => (
          <>
            <DisclosureButton className="flex w-full items-center justify-between rounded bg-gray-50 px-2 py-1 text-left text-xs font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus-visible:ring focus-visible:ring-indigo-500/75">
              <span>Transformations</span>
              <ChevronRightIcon
                className={`h-3 w-3 text-gray-500 transition-transform ${open ? 'rotate-90' : ''}`}
              />
            </DisclosureButton>
            <DisclosurePanel className="px-2 pt-2 pb-1 text-xs text-gray-500 space-y-2">
              {/* Transform Source Objects */}
              {!isTransformSourceObjectsHidden && (
                <ArrayInput
                  label="Transform Source Objects"
                  value={property.transformSourceObjects}
                  onChange={(value) => updateField('transformSourceObjects', value)}
                  placeholder="source_table_name"
                  helpText="List of source tables/objects used in transformations"
                />
              )}

              {/* Transform Logic */}
              {!isTransformLogicHidden && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Transform Logic</label>
                  <textarea
                    value={property.transformLogic || ''}
                    onChange={(e) => updateField('transformLogic', e.target.value || undefined)}
                    rows={4}
                    className={`w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm font-mono ${definitionData?.transformLogic && !property.transformLogic ? 'placeholder:text-blue-400' : ''}`}
                    placeholder={definitionData?.transformLogic || "SQL or transformation code..."}
                  />
                  <p className="mt-1 text-xs text-gray-500">Technical transformation implementation (SQL, etc.)</p>
                </div>
              )}

              {/* Transform Description */}
              {!isTransformDescriptionHidden && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Transform Description</label>
                  <textarea
                    value={property.transformDescription || ''}
                    onChange={(e) => updateField('transformDescription', e.target.value || undefined)}
                    rows={3}
                    className={`w-full rounded border border-gray-300 bg-white px-2 py-1 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs ${definitionData?.transformDescription && !property.transformDescription ? 'placeholder:text-blue-400' : ''}`}
                    placeholder={definitionData?.transformDescription || "Business-friendly explanation of transformation..."}
                  />
                  <p className="mt-1 text-xs text-gray-500">Non-technical description of how field is derived</p>
                </div>
              )}
            </DisclosurePanel>
          </>
        )}
      </Disclosure>

      {/* Data Quality Section */}
      <Disclosure>
        {({ open }) => (
          <>
            <DisclosureButton className="flex w-full items-center justify-between rounded bg-gray-50 px-2 py-1 text-left text-xs font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus-visible:ring focus-visible:ring-indigo-500/75">
              <span>Data Quality</span>
              <ChevronRightIcon
                className={`h-3 w-3 text-gray-500 transition-transform ${open ? 'rotate-90' : ''}`}
              />
            </DisclosureButton>
            <DisclosurePanel className="px-2 pt-2 pb-1 text-xs text-gray-500 space-y-2">
              <QualityEditor
                value={property.quality}
                onChange={(value) => updateField('quality', value)}
                context="property"
              />
            </DisclosurePanel>
          </>
        )}
      </Disclosure>

      {/* Authoritative Definitions Section */}
      <Disclosure>
        {({ open }) => (
          <>
            <DisclosureButton className="flex w-full items-center justify-between rounded bg-gray-50 px-2 py-1 text-left text-xs font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus-visible:ring focus-visible:ring-indigo-500/75">
              <span>Authoritative Definitions</span>
              <ChevronRightIcon
                className={`h-3 w-3 text-gray-500 transition-transform ${open ? 'rotate-90' : ''}`}
              />
            </DisclosureButton>
            <DisclosurePanel className="px-2 pt-2 pb-1 text-xs text-gray-500 space-y-2">
              <AuthoritativeDefinitionsEditor
                value={filteredAuthoritativeDefinitions}
                onChange={(value) => {
                  // Preserve semantic definition when updating (if semantics section is enabled)
                  if (isSemanticsEnabled && semanticDefinition) {
                    const newValue = [...(value || []), semanticDefinition];
                    updateField('authoritativeDefinitions', newValue.length ? newValue : undefined);
                  } else {
                    updateField('authoritativeDefinitions', value);
                  }
                }}
              />
            </DisclosurePanel>
          </>
        )}
      </Disclosure>

      {/* Relationships Section */}
      <Disclosure>
        {({ open }) => (
          <>
            <DisclosureButton className="flex w-full items-center justify-between rounded bg-gray-50 px-2 py-1 text-left text-xs font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus-visible:ring focus-visible:ring-indigo-500/75">
              <span>Relationships</span>
              <ChevronRightIcon
                className={`h-3 w-3 text-gray-500 transition-transform ${open ? 'rotate-90' : ''}`}
              />
            </DisclosureButton>
            <DisclosurePanel className="px-2 pt-2 pb-1 text-xs text-gray-500 space-y-2">
              <RelationshipEditor
                value={property.relationships}
                onChange={(value) => updateField('relationships', value)}
                relationshipTypeOptions={relationshipTypeOptions}
              />
            </DisclosurePanel>
          </>
        )}
      </Disclosure>

      {/* Custom Sections from Customization */}
      <CustomSections
        customSections={customSections}
        customProperties={customPropertyConfigs}
        values={customPropertiesLookup}
        onPropertyChange={updateCustomProperty}
        context={propertyContext}
        yamlParts={yamlParts}
      />

      {/* Ungrouped Custom Properties */}
      <UngroupedCustomProperties
        customProperties={customPropertyConfigs}
        customSections={customSections}
        values={customPropertiesLookup}
        onPropertyChange={updateCustomProperty}
        context={propertyContext}
        yamlParts={yamlParts}
      />

      {/* Custom Properties Section (raw key-value editor) */}
      <Disclosure>
        {({ open }) => (
          <>
            <DisclosureButton className="flex w-full items-center justify-between rounded bg-gray-50 px-2 py-1 text-left text-xs font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus-visible:ring focus-visible:ring-indigo-500/75">
              <span>Custom Properties</span>
              <ChevronRightIcon
                className={`h-3 w-3 text-gray-500 transition-transform ${open ? 'rotate-90' : ''}`}
              />
            </DisclosureButton>
            <DisclosurePanel className="px-2 pt-2 pb-1 text-xs text-gray-500 space-y-2">
              <CustomPropertiesEditor
                value={property.customProperties}
                onChange={(value) => updateField('customProperties', value)}
                showDescription={true}
              />
            </DisclosurePanel>
          </>
        )}
      </Disclosure>

      {/* Delete Button */}
      {onDelete && (
        <div className="pt-3 border-t border-gray-200">
          <button
            onClick={onDelete}
            className="px-2 py-1 text-xs text-red-600 bg-white border border-red-600 rounded hover:bg-red-50 transition-colors flex items-center justify-center gap-1.5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete Property
          </button>
        </div>
      )}

      {/* Definition Selection Modal */}
      <DefinitionSelectionModal
        isOpen={isDefinitionModalOpen}
        onClose={() => { setIsDefinitionModalOpen(false)} }
        onSelect={handleDefinitionSelect}
        onSearchDefinitions={editorConfig?.onSearchDefinitions}
      />
    </div>
  );
};

export default PropertyDetailsPanel;
