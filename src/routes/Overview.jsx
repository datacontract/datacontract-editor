import { useMemo } from 'react';
import { useEditorStore } from '../store.js';
import { ValidatedCombobox } from '../components/ui/index.js';
import AuthoritativeDefinitionsEditor from '../components/ui/AuthoritativeDefinitionsEditor.jsx';
import ValidatedInput from '../components/ui/ValidatedInput.jsx';
import Tooltip from '../components/ui/Tooltip.jsx';
import Tags from '../components/ui/Tags.jsx';
import * as YAML from 'yaml';

const Overview = () => {
  const yaml = useEditorStore((state) => state.yaml);
  const setYaml = useEditorStore((state) => state.setYaml);
  const editorConfig = useEditorStore((state) => state.editorConfig);

  // Status options for the combobox
  const statusOptions = [
    { id: 'draft', name: 'draft' },
    { id: 'proposed', name: 'proposed' },
    { id: 'in development', name: 'in development' },
    { id: 'active', name: 'active' },
    { id: 'deprecated', name: 'deprecated' },
    { id: 'retired', name: 'retired' }
  ];

  // Parse current YAML to extract form values
  const formData = useMemo(() => {
    if (!yaml?.trim()) {
      return {
        name: '',
        version: '',
        status: '',
        tenant: '',
        id: '',
        domain: '',
        tags: [],
        authoritativeDefinitions: [],
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
        name: parsed.name || '',
        version: parsed.version || '',
        status: parsed.status || '',
        tenant: parsed.tenant || '',
        id: parsed.id || '',
        domain: parsed.domain || '',
        tags: parsed.tags || [],
        authoritativeDefinitions: parsed.authoritativeDefinitions || [],
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
        name: '',
        version: '',
        status: '',
        tenant: '',
        id: '',
        domain: '',
        tags: [],
        authoritativeDefinitions: [],
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
      if (field === 'name') {
        parsed.name = value;
      } else if (field === 'version') {
        parsed.version = value;
      } else if (field === 'status') {
        parsed.status = value;
      } else if (field === 'tenant') {
        parsed.tenant = value;
      } else if (field === 'id') {
        parsed.id = value;
      } else if (field === 'domain') {
        parsed.domain = value;
      } else if (field === 'tags') {
        parsed.tags = value;
      } else if (field === 'authoritativeDefinitions') {
        parsed.authoritativeDefinitions = value;
      } else if (field.startsWith('description.')) {
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

          {/* Fundamentals Section */}
          <div>
            <h3 className="text-base font-semibold leading-6 text-gray-900 mb-3">Fundamentals</h3>

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                {/* Name Field */}
                <ValidatedInput
                  name="name"
                  label="Name"
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  required={true}
                  tooltip="The name of the data contract"
                  placeholder="Enter document name"
                  externalErrors={[]}
                  data-1p-ignore
                />

                {/* Version Field */}
                <ValidatedInput
                  name="version"
                  label="Version"
                  value={formData.version}
                  onChange={(e) => updateField('version', e.target.value)}
                  required={true}
                  tooltip="Version number using semantic versioning"
                  placeholder="1.0.0"
                  externalErrors={[]}
                />

                {/* ID Field */}
                <ValidatedInput
                  name="id"
                  label="ID"
                  value={formData.id}
                  onChange={(e) => updateField('id', e.target.value)}
                  required={true}
                  tooltip="Unique identifier for this data contract"
                  placeholder="unique-identifier"
                  externalErrors={[]}
                />

                {/* Status Field */}
                <ValidatedCombobox
                  name="status"
                  label="Status"
                  options={statusOptions}
                  value={formData.status}
                  onChange={(selectedValue) => updateField('status', selectedValue || '')}
                  placeholder="Select a status..."
                  acceptAnyInput={true}
                  required={true}
                  tooltip="Current status of the data contract"
                  externalErrors={[]}
                />

                {/* Tenant Field */}
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <label htmlFor="tenant" className="block text-xs font-medium leading-4 text-gray-900">
                      Tenant
                    </label>
                    <Tooltip content="Tenant or organization this contract belongs to">
                      <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                    </Tooltip>
                  </div>
                  <input
                    type="text"
                    name="tenant"
                    id="tenant"
                    value={formData.tenant}
                    onChange={(e) => updateField('tenant', e.target.value)}
                    className="mt-1 block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 disabled:bg-gray-50 disabled:text-gray-500 disabled:ring-gray-200 text-xs leading-4"
                    placeholder="company-A"
                  />
                </div>

                {/* Domain Field */}
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <label htmlFor="domain" className="block text-xs font-medium leading-4 text-gray-900">
                      Domain
                    </label>
                    <Tooltip content="Business domain or category of this data contract">
                      <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                    </Tooltip>
                  </div>
                  {editorConfig?.domains && editorConfig.domains.length > 0 ? (
                    <select
                      name="domain"
                      id="domain"
                      value={formData.domain}
                      onChange={(e) => updateField('domain', e.target.value)}
                      className="mt-1 block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 disabled:bg-gray-50 disabled:text-gray-500 disabled:ring-gray-200 text-xs leading-4"
                    >
                      <option value="">Select a domain...</option>
                      {editorConfig.domains.map((domain) => (
                        <option key={domain.id} value={domain.id}>
                          {domain.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      name="domain"
                      id="domain"
                      value={formData.domain}
                      onChange={(e) => updateField('domain', e.target.value)}
                      className="mt-1 block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 disabled:bg-gray-50 disabled:text-gray-500 disabled:ring-gray-200 text-xs leading-4"
                      placeholder="e.g., logistics, finance"
                    />
                  )}
                </div>

                {/* Tags Field */}
                <div className="sm:col-span-2">
                  <Tags
                    label="Tags"
                    value={formData.tags}
                    onChange={(value) => updateField('tags', value)}
                    tooltip="Categorize your data contract with tags"
                    placeholder="Add a tag..."
                  />
                </div>

                {/* Top-level Authoritative Definitions */}
                <div className="sm:col-span-2">
                  <AuthoritativeDefinitionsEditor
                    value={formData.authoritativeDefinitions}
                    onChange={(value) => updateField('authoritativeDefinitions', value)}
                  />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Overview;
