import { useMemo } from 'react';
import { useEditorStore } from '../store.js';
import { Tooltip } from '../components/ui/index.js';
import KeyValueEditor from '../components/ui/KeyValueEditor.jsx';
import AuthoritativeDefinitionsEditor from '../components/ui/AuthoritativeDefinitionsEditor.jsx';
import * as YAML from 'yaml';

const TermsAndConditions = () => {
  const yaml = useEditorStore((state) => state.yaml);
  const setYaml = useEditorStore((state) => state.setYaml);

  // Parse current YAML to extract form values
  const formData = useMemo(() => {
    if (!yaml?.trim()) {
      return {
        description: {
          purpose: '',
          usage: '',
          limitations: '',
          authoritativeDefinitions: [],
          customProperties: []
        }
      };
    }

    try {
      const parsed = YAML.parse(yaml);
      const description = parsed.description || {};
      return {
        description: {
          purpose: description.purpose || '',
          usage: description.usage || '',
          limitations: description.limitations || '',
          authoritativeDefinitions: description.authoritativeDefinitions || [],
          customProperties: description.customProperties || []
        }
      };
    } catch {
      return {
        description: {
          purpose: '',
          usage: '',
          limitations: '',
          authoritativeDefinitions: [],
          customProperties: []
        }
      };
    }
  }, [yaml]);

  // Update YAML when form fields change
  const updateField = (field, value) => {
    try {
      let parsed = {};
      if (yaml?.trim()) {
        try {
          parsed = YAML.parse(yaml) || {};
        } catch {
          // If YAML is invalid, start fresh
          parsed = {};
        }
      }

      // Update the field
      if (field.startsWith('description.')) {
        const descriptionField = field.split('.')[1];
        if (!parsed.description) {
          parsed.description = {};
        }
        if (typeof parsed.description === 'string') {
          parsed.description = { purpose: parsed.description };
        }
        // For array fields, use value directly (including undefined to remove)
        if (descriptionField === 'authoritativeDefinitions' || descriptionField === 'customProperties') {
          parsed.description[descriptionField] = value;
        } else {
          // For string fields
          parsed.description[descriptionField] = value;
        }
      }

      // Convert back to YAML
      const newYaml = YAML.stringify(parsed);
      setYaml(newYaml);
    } catch (error) {
      console.error('Error updating YAML:', error);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">

          {/* Terms and Conditions Section */}
          <div>
            <h3 className="text-base font-semibold leading-6 text-gray-900 mb-3">Terms and Conditions</h3>
            <p className="text-sm text-gray-500 mb-4">High level description of the dataset including purpose, usage guidelines, and limitations.</p>
            <div className="space-y-3">
              {/* Purpose Field */}
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <label htmlFor="description-purpose" className="block text-xs font-medium leading-4 text-gray-900">
                    Purpose
                  </label>
                  <Tooltip content="Intended purpose for the provided data">
                    <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                  </Tooltip>
                </div>
                <textarea
                  id="description-purpose"
                  name="description-purpose"
                  rows={3}
                  value={formData.description.purpose}
                  onChange={(e) => updateField('description.purpose', e.target.value)}
                  className="mt-1 block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 disabled:bg-gray-50 disabled:text-gray-500 disabled:ring-gray-200 text-xs leading-4"
                  placeholder="Describe the purpose of this data contract..."
                />
              </div>

              {/* Usage Field */}
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <label htmlFor="description-usage" className="block text-xs font-medium leading-4 text-gray-900">
                    Usage
                  </label>
                  <Tooltip content="How this data should be used">
                    <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                  </Tooltip>
                </div>
                <textarea
                  id="description-usage"
                  name="description-usage"
                  rows={3}
                  value={formData.description.usage}
                  onChange={(e) => updateField('description.usage', e.target.value)}
                  className="mt-1 block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 disabled:bg-gray-50 disabled:text-gray-500 disabled:ring-gray-200 text-xs leading-4"
                  placeholder="Describe how to use this data..."
                />
              </div>

              {/* Limitations Field */}
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <label htmlFor="description-limitations" className="block text-xs font-medium leading-4 text-gray-900">
                    Limitations
                  </label>
                  <Tooltip content="Technical, compliance, and legal limitations for data use">
                    <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                  </Tooltip>
                </div>
                <textarea
                  id="description-limitations"
                  name="description-limitations"
                  rows={3}
                  value={formData.description.limitations}
                  onChange={(e) => updateField('description.limitations', e.target.value)}
                  className="mt-1 block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 disabled:bg-gray-50 disabled:text-gray-500 disabled:ring-gray-200 text-xs leading-4"
                  placeholder="Describe any limitations or constraints..."
                />
              </div>

              {/* Authoritative Definitions Field */}
              <div>
                <AuthoritativeDefinitionsEditor
                  value={formData.description.authoritativeDefinitions}
                  onChange={(value) => updateField('description.authoritativeDefinitions', value)}
                />
              </div>

              {/* Custom Properties Field */}
              <div>
                <KeyValueEditor
                  label="Custom Properties"
                  value={formData.description.customProperties}
                  onChange={(value) => updateField('description.customProperties', value)}
                  fields={[
                    { name: 'property', label: 'Property', type: 'text', placeholder: 'myCustomProperty' },
                    { name: 'value', label: 'Value', type: 'text', placeholder: 'value' },
                    { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Optional description...' }
                  ]}
                  helpText="Add custom key-value properties for description-specific metadata"
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
