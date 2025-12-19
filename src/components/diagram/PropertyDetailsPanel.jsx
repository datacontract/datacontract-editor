import { useMemo, useCallback } from 'react';
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import ChevronRightIcon from '../ui/icons/ChevronRightIcon.jsx';
import ChevronDownIcon from '../ui/icons/ChevronDownIcon.jsx';
import ArrayInput from '../ui/ArrayInput.jsx';
import RelationshipEditor from '../ui/RelationshipEditor.jsx';
import AuthoritativeDefinitionsEditor from '../ui/AuthoritativeDefinitionsEditor.jsx';
import CustomPropertiesEditor from '../ui/CustomPropertiesEditor.jsx';
import EnumField from '../ui/EnumField.jsx';
import Tags from '../ui/Tags.jsx';
import QualityEditor from '../ui/QualityEditor.jsx';
import { useEditorStore } from '../../store.js';
import { getSchemaEnumValues } from '../../lib/schemaEnumExtractor.js';
import { useCustomization, useIsPropertyHidden, useStandardPropertyOverride } from '../../hooks/useCustomization.js';
import { CustomSections, UngroupedCustomProperties } from '../ui/CustomSection.jsx';

const PropertyDetailsPanel = ({ property, onUpdate, onDelete }) => {
  const jsonSchema = useEditorStore((state) => state.schemaData);
  const yamlParts = useEditorStore((state) => state.yamlParts);

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
                    className="w-full rounded border border-gray-300 bg-white px-2 py-1 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs"
                    placeholder="Human-readable name"
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
                    className="w-full rounded border border-gray-300 bg-white px-2 py-1 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs"
                    placeholder="Actual database column name"
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
                  placeholder="Select..."
                  fallbackOptions={['string', 'date', 'timestamp', 'time', 'number', 'integer', 'object', 'array', 'boolean']}
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
                    className="w-full rounded border border-gray-300 bg-white px-2 py-1 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs"
                    placeholder="e.g., VARCHAR(255)"
                  />
                </div>
              )}

              {/* Description */}
              {!isDescriptionHidden && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={property.description || ''}
                    onChange={(e) => updateField('description', e.target.value)}
                    rows={3}
                    className="w-full rounded border border-gray-300 bg-white px-2 py-1 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs"
                    placeholder="Describe this property..."
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
                    className="w-full rounded border border-gray-300 bg-white px-2 py-1 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs"
                    placeholder="example1&#10;example2&#10;example3"
                  />
                  <p className="mt-1 text-xs text-gray-500">One example per line (all content preserved)</p>
                </div>
              )}
            </DisclosurePanel>
          </>
        )}
      </Disclosure>

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
                      className="w-full rounded border border-gray-300 bg-white px-2 py-1 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs"
                      placeholder="e.g., email, uri, uuid"
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
                      className="w-full rounded border border-gray-300 bg-white px-2 py-1 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs"
                      placeholder="e.g., yyyy-MM-dd, ISO 8601"
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
                      className="w-full rounded border border-gray-300 bg-white px-2 py-1 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs"
                      placeholder={classificationOverride?.placeholder || "e.g., confidential, public, internal"}
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
                    className="w-full rounded border border-gray-300 bg-white px-2 py-1 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs"
                    placeholder="Encrypted field reference"
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
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm font-mono"
                    placeholder="SQL or transformation code..."
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
                    className="w-full rounded border border-gray-300 bg-white px-2 py-1 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs"
                    placeholder="Business-friendly explanation of transformation..."
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
                value={property.authoritativeDefinitions}
                onChange={(value) => updateField('authoritativeDefinitions', value)}
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
    </div>
  );
};

export default PropertyDetailsPanel;
