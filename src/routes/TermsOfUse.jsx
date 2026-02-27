import { useMemo, useCallback } from 'react';
import { useEditorStore } from '../store.js';
import { Tooltip } from '../components/ui/index.js';
import AuthoritativeDefinitionsEditor from '../components/ui/AuthoritativeDefinitionsEditor.jsx';
import CustomPropertiesEditor from '../components/ui/CustomPropertiesEditor.jsx';
import ValidatedTextarea from '../components/ui/ValidatedTextarea.jsx';
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
            <h3 className="text-base font-semibold leading-6 text-gray-900">Terms of Use</h3>
            <p className="mt-1 text-xs leading-4 text-gray-500 mb-4">High level description of the dataset including purpose, usage guidelines, and limitations.</p>
            <div className="space-y-3">
              {/* Purpose Field */}
              {!isPurposeHidden && (
                <ValidatedTextarea
                  name="description-purpose"
                  label={purposeOverride?.title || 'Purpose'}
                  value={description?.purpose}
                  onChange={(e) => setYamlValue('description.purpose', e.target.value)}
                  required={purposeOverride?.required}
                  minLength={purposeOverride?.minLength}
                  maxLength={purposeOverride?.maxLength}
                  tooltip={purposeOverride?.description || "Intended purpose for the provided data"}
                  placeholder={purposeOverride?.placeholder || "Describe the purpose of this data contract..."}
                  rows={3}
                  actions={
                    <SparkleButton
                      fieldName={purposeOverride?.title || "Purpose"}
                      fieldPath="description.purpose"
                      currentValue={description?.purpose}
                      onSuggestion={(value) => setYamlValue('description.purpose', value)}
                      placeholder={purposeOverride?.description || "Intended purpose for the provided data"}
                    />
                  }
                />
              )}

              {/* Usage Field */}
              {!isUsageHidden && (
                <ValidatedTextarea
                  name="description-usage"
                  label={usageOverride?.title || 'Usage'}
                  value={description?.usage}
                  onChange={(e) => setYamlValue('description.usage', e.target.value)}
                  required={usageOverride?.required}
                  minLength={usageOverride?.minLength}
                  maxLength={usageOverride?.maxLength}
                  tooltip={usageOverride?.description || "How this data should be used"}
                  placeholder={usageOverride?.placeholder || "Describe how to use this data..."}
                  rows={3}
                  actions={
                    <SparkleButton
                      fieldName={usageOverride?.title || "Usage"}
                      fieldPath="description.usage"
                      currentValue={description?.usage}
                      onSuggestion={(value) => setYamlValue('description.usage', value)}
                      placeholder={usageOverride?.description || "How this data should be used"}
                    />
                  }
                />
              )}

              {/* Limitations Field */}
              {!isLimitationsHidden && (
                <ValidatedTextarea
                  name="description-limitations"
                  label={limitationsOverride?.title || 'Limitations'}
                  value={description?.limitations}
                  onChange={(e) => setYamlValue('description.limitations', e.target.value)}
                  required={limitationsOverride?.required}
                  minLength={limitationsOverride?.minLength}
                  maxLength={limitationsOverride?.maxLength}
                  tooltip={limitationsOverride?.description || "Technical, compliance, and legal limitations for data use"}
                  placeholder={limitationsOverride?.placeholder || "Describe any limitations or constraints..."}
                  rows={3}
                  actions={
                    <SparkleButton
                      fieldName={limitationsOverride?.title || "Limitations"}
                      fieldPath="description.limitations"
                      currentValue={description?.limitations}
                      onSuggestion={(value) => setYamlValue('description.limitations', value)}
                      placeholder={limitationsOverride?.description || "Technical, compliance, and legal limitations for data use"}
                    />
                  }
                />
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
                  validationKeyPrefix="description"
                  validationSection="Terms of Use"
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
                validationKeyPrefix="description"
                validationSection="Terms of Use"
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
