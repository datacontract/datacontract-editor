import { useMemo, useCallback } from 'react';
import { useEditorStore } from '../store.js';
import { Tooltip } from '../components/ui/index.js';
import AuthoritativeDefinitionsEditor from '../components/ui/AuthoritativeDefinitionsEditor.jsx';
import CustomPropertiesEditor from '../components/ui/CustomPropertiesEditor.jsx';
import QuestionMarkCircleIcon from '../components/ui/icons/QuestionMarkCircleIcon.jsx';
import { SparkleButton } from '../ai/index.js';
import { useShallow } from "zustand/react/shallow";
import { useCustomization, useStandardPropertyOverride, useIsPropertyHidden } from '../hooks/useCustomization.js';
import { CustomSections, UngroupedCustomProperties } from '../components/ui/CustomSection.jsx';

const TermsOfUse = () => {
	const description = useEditorStore(useShallow((state) => state.getValue('description'))) || {};
	const setYamlValue = useEditorStore(useShallow((state) => state.setValue));
	const yamlParts = useEditorStore((state) => state.yamlParts);

	// Get customization config for description level
	const { customProperties: customPropertyConfigs, customSections } = useCustomization('description');

	// Check hidden status for standard properties
	const isPurposeHidden = useIsPropertyHidden('description', 'purpose');
	const isUsageHidden = useIsPropertyHidden('description', 'usage');
	const isLimitationsHidden = useIsPropertyHidden('description', 'limitations');
	const isAuthoritativeDefinitionsHidden = useIsPropertyHidden('description', 'authoritativeDefinitions');

	// Get overrides for standard properties
	const purposeOverride = useStandardPropertyOverride('description', 'purpose');
	const usageOverride = useStandardPropertyOverride('description', 'usage');
	const limitationsOverride = useStandardPropertyOverride('description', 'limitations');

	// Convert customProperties to lookup for UI components
	const customPropertiesLookup = useMemo(() => {
		const props = description?.customProperties;
		if (!Array.isArray(props)) return props || {};
		return props.reduce((acc, item) => {
			if (item?.property !== undefined) {
				acc[item.property] = item.value;
			}
			return acc;
		}, {});
	}, [description?.customProperties]);

	// Handle custom property changes - stores as array format per ODCS standard
	const updateCustomProperty = useCallback((property, value) => {
		const currentProps = description?.customProperties;
		let currentArray;
		if (Array.isArray(currentProps)) {
			currentArray = currentProps;
		} else if (currentProps && typeof currentProps === 'object') {
			currentArray = Object.entries(currentProps).map(([k, v]) => ({ property: k, value: v }));
		} else {
			currentArray = [];
		}

		if (value === undefined) {
			const updated = currentArray.filter(item => item.property !== property);
			setYamlValue('description.customProperties', updated.length > 0 ? updated : undefined);
		} else {
			const existingIndex = currentArray.findIndex(item => item.property === property);
			if (existingIndex >= 0) {
				const updated = [...currentArray];
				updated[existingIndex] = { property, value };
				setYamlValue('description.customProperties', updated);
			} else {
				setYamlValue('description.customProperties', [...currentArray, { property, value }]);
			}
		}
	}, [description?.customProperties, setYamlValue]);

	// Build context for condition evaluation
	const descriptionContext = useMemo(() => ({
		purpose: description?.purpose,
		usage: description?.usage,
		limitations: description?.limitations,
		...customPropertiesLookup,
	}), [description?.purpose, description?.usage, description?.limitations, customPropertiesLookup]);

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">

          {/* Terms of Use Section */}
          <div>
            <h3 className="text-base font-semibold leading-6 text-gray-900 mb-3">Terms of Use</h3>
            <p className="text-sm text-gray-500 mb-4">High level description of the dataset including purpose, usage guidelines, and limitations.</p>
            <div className="space-y-3">
              {/* Purpose Field */}
              {!isPurposeHidden && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1">
                    <label htmlFor="description-purpose" className="block text-xs font-medium leading-4 text-gray-900">
                      {purposeOverride?.title || 'Purpose'}
                    </label>
                    <Tooltip content={purposeOverride?.description || "Intended purpose for the provided data"}>
                      <QuestionMarkCircleIcon />
                    </Tooltip>
                  </div>
                  <SparkleButton
                    fieldName={purposeOverride?.title || "Purpose"}
                    fieldPath="description.purpose"
                    currentValue={description?.purpose}
                    onSuggestion={(value) => setYamlValue('description.purpose', value)}
                    placeholder={purposeOverride?.description || "Intended purpose for the provided data"}
                  />
                </div>
                <textarea
                  id="description-purpose"
                  name="description-purpose"
                  rows={3}
                  value={description?.purpose}
                  onChange={(e) => setYamlValue('description.purpose', e.target.value)}
                  className="mt-1 block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 disabled:bg-gray-50 disabled:text-gray-500 disabled:ring-gray-200 text-xs leading-4"
                  placeholder={purposeOverride?.placeholder || "Describe the purpose of this data contract..."}
                />
              </div>
              )}

              {/* Usage Field */}
              {!isUsageHidden && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1">
                    <label htmlFor="description-usage" className="block text-xs font-medium leading-4 text-gray-900">
                      {usageOverride?.title || 'Usage'}
                    </label>
                    <Tooltip content={usageOverride?.description || "How this data should be used"}>
                      <QuestionMarkCircleIcon />
                    </Tooltip>
                  </div>
                  <SparkleButton
                    fieldName={usageOverride?.title || "Usage"}
                    fieldPath="description.usage"
                    currentValue={description?.usage}
                    onSuggestion={(value) => setYamlValue('description.usage', value)}
                    placeholder={usageOverride?.description || "How this data should be used"}
                  />
                </div>
                <textarea
                  id="description-usage"
                  name="description-usage"
                  rows={3}
                  value={description?.usage}
                  onChange={(e) => setYamlValue('description.usage', e.target.value)}
                  className="mt-1 block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 disabled:bg-gray-50 disabled:text-gray-500 disabled:ring-gray-200 text-xs leading-4"
                  placeholder={usageOverride?.placeholder || "Describe how to use this data..."}
                />
              </div>
              )}

              {/* Limitations Field */}
              {!isLimitationsHidden && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1">
                    <label htmlFor="description-limitations" className="block text-xs font-medium leading-4 text-gray-900">
                      {limitationsOverride?.title || 'Limitations'}
                    </label>
                    <Tooltip content={limitationsOverride?.description || "Technical, compliance, and legal limitations for data use"}>
                      <QuestionMarkCircleIcon />
                    </Tooltip>
                  </div>
                  <SparkleButton
                    fieldName={limitationsOverride?.title || "Limitations"}
                    fieldPath="description.limitations"
                    currentValue={description?.limitations}
                    onSuggestion={(value) => setYamlValue('description.limitations', value)}
                    placeholder={limitationsOverride?.description || "Technical, compliance, and legal limitations for data use"}
                  />
                </div>
                <textarea
                  id="description-limitations"
                  name="description-limitations"
                  rows={3}
                  value={description?.limitations}
                  onChange={(e) => setYamlValue('description.limitations', e.target.value)}
                  className="mt-1 block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 disabled:bg-gray-50 disabled:text-gray-500 disabled:ring-gray-200 text-xs leading-4"
                  placeholder={limitationsOverride?.placeholder || "Describe any limitations or constraints..."}
                />
              </div>
              )}

              {/* Authoritative Definitions Field */}
              {!isAuthoritativeDefinitionsHidden && (
              <div>
                <AuthoritativeDefinitionsEditor
                  value={description?.authoritativeDefinitions}
                  onChange={(value) => setYamlValue('description.authoritativeDefinitions', value)}
                />
              </div>
              )}

              {/* Custom Sections */}
              {customSections.length > 0 && (
                <CustomSections
                  customSections={customSections}
                  customProperties={customPropertyConfigs}
                  values={customPropertiesLookup}
                  onPropertyChange={updateCustomProperty}
                  context={descriptionContext}
                  yamlParts={yamlParts}
                />
              )}

              {/* Ungrouped Custom Properties */}
              <UngroupedCustomProperties
                customProperties={customPropertyConfigs}
                customSections={customSections}
                values={customPropertiesLookup}
                onPropertyChange={updateCustomProperty}
                context={descriptionContext}
                yamlParts={yamlParts}
              />

              {/* Fallback Custom Properties Editor (only if no custom schema defined) */}
              {customPropertyConfigs.length === 0 && (
              <div>
                <CustomPropertiesEditor
                  value={description?.customProperties}
                  onChange={(value) => setYamlValue('description.customProperties', value)}
                  showDescription={true}
                />
              </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TermsOfUse;
