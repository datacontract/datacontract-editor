import { useEditorStore } from '../store.js';
import { ValidatedCombobox } from '../components/ui/index.js';
import AuthoritativeDefinitionsEditor from '../components/ui/AuthoritativeDefinitionsEditor.jsx';
import ValidatedInput from '../components/ui/ValidatedInput.jsx';
import Tooltip from '../components/ui/Tooltip.jsx';
import Tags from '../components/ui/Tags.jsx';
import QuestionMarkCircleIcon from '../components/ui/icons/QuestionMarkCircleIcon.jsx';
import {useShallow} from "zustand/react/shallow";

const Overview = () => {
	const id = useEditorStore(useShallow((state) => state.getValue('id')));
	const name = useEditorStore(useShallow((state) => state.getValue('name')));
	const version = useEditorStore(useShallow((state) => state.getValue('version')));
	const status = useEditorStore(useShallow((state) => state.getValue('status')));
	const domain = useEditorStore(useShallow((state) => state.getValue('domain')));
	const tenant = useEditorStore(useShallow((state) => state.getValue('tenant')));
	const tags = useEditorStore(useShallow((state) => state.getValue('tags')));
	const authoritativeDefinitions = useEditorStore(useShallow((state) => state.getValue('authoritativeDefinitions')));

	const setValue = useEditorStore((state) => state.setValue);
	const setId = (newValue) => setValue('id', newValue);
	const setName = (newValue) => setValue('name', newValue);
	const setVersion = (newValue) => setValue('version', newValue);
	const setStatus = (newValue) => setValue('status', newValue);
	const setDomain = (newValue) => setValue('domain', newValue);
	const setTenant = (newValue) => setValue('tenant', newValue);
	const setTags = (key, newValue) => setValue(key, newValue);
	const setAuthoritativeDefinitions = (newValue) => setValue('authoritativeDefinitions', newValue);

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
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  required={true}
                  tooltip="Version number using semantic versioning"
                  placeholder="1.0.0"
                  externalErrors={[]}
                />

                {/* ID Field */}
                <ValidatedInput
                  name="id"
                  label="ID"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
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
                  value={status}
                  onChange={(selectedValue) => setStatus(selectedValue?.id || '')}
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
                      <QuestionMarkCircleIcon />
                    </Tooltip>
                  </div>
                  <input
                    type="text"
                    name="tenant"
                    id="tenant"
                    value={tenant}
                    onChange={(e) => setTenant(e.target.value)}
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
                      <QuestionMarkCircleIcon />
                    </Tooltip>
                  </div>
                  {editorConfig?.domains && editorConfig.domains.length > 0 ? (
                    <select
                      name="domain"
                      id="domain"
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
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
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                      className="mt-1 block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 disabled:bg-gray-50 disabled:text-gray-500 disabled:ring-gray-200 text-xs leading-4"
                      placeholder="e.g., logistics, finance"
                    />
                  )}
                </div>

                {/* Tags Field */}
                <div className="sm:col-span-2">
                  <Tags
                    label="Tags"
                    value={tags}
                    onChange={(value) => setTags('tags', value)}
                    tooltip="Categorize your data contract with tags"
                    placeholder="Add a tag..."
                  />
                </div>

                {/* Top-level Authoritative Definitions */}
                <div className="sm:col-span-2">
                  <AuthoritativeDefinitionsEditor
                    value={authoritativeDefinitions}
                    onChange={(value) => setAuthoritativeDefinitions(value)}
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
