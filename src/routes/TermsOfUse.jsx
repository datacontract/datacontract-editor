import { useMemo } from 'react';
import { useEditorStore } from '../store.js';
import { Tooltip } from '../components/ui/index.js';
import KeyValueEditor from '../components/ui/KeyValueEditor.jsx';
import AuthoritativeDefinitionsEditor from '../components/ui/AuthoritativeDefinitionsEditor.jsx';
import CustomPropertiesEditor from '../components/ui/CustomPropertiesEditor.jsx';
import { stringifyYaml, parseYaml } from '../utils/yaml.js';
import QuestionMarkCircleIcon from '../components/ui/icons/QuestionMarkCircleIcon.jsx';

const TermsOfUse = () => {
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
      const parsed = parseYaml(yaml);
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
          parsed = parseYaml(yaml) || {};
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
      const newYaml = stringifyYaml(parsed);
      setYaml(newYaml);
    } catch (error) {
      console.error('Error updating YAML:', error);
    }
  };

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
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <label htmlFor="description-purpose" className="block text-xs font-medium leading-4 text-gray-900">
                    Purpose
                  </label>
                  <Tooltip content="Intended purpose for the provided data">
                    <QuestionMarkCircleIcon />
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
                    <QuestionMarkCircleIcon />
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
                    <QuestionMarkCircleIcon />
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
                <CustomPropertiesEditor
                  value={formData.description.customProperties}
                  onChange={(value) => updateField('description.customProperties', value)}
                  showDescription={true}
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TermsOfUse;
