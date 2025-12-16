import { useMemo, useCallback } from 'react';
import { useEditorStore } from '../store.js';
import { Combobox, Tooltip } from '../components/ui/index.js';
import ValidatedInput from '../components/ui/ValidatedInput.jsx';
import QuestionMarkCircleIcon from '../components/ui/icons/QuestionMarkCircleIcon.jsx';
import supportIcons from '../assets/support-icons/supportIcons.jsx';
import {useShallow} from "zustand/react/shallow";
import { useCustomization, useIsPropertyHidden } from '../hooks/useCustomization.js';
import { CustomSections, UngroupedCustomProperties } from '../components/ui/CustomSection.jsx';

// Support Item component with customization support
const SupportItem = ({ item, index, onUpdate, onRemove, toolOptions, scopeOptions }) => {
  const yamlParts = useEditorStore((state) => state.yamlParts);

  // Get customization config for support level
  const { customProperties: customPropertyConfigs, customSections } = useCustomization('support');

  // Check hidden status for standard properties
  const isChannelHidden = useIsPropertyHidden('support', 'channel');
  const isUrlHidden = useIsPropertyHidden('support', 'url');
  const isDescriptionHidden = useIsPropertyHidden('support', 'description');
  const isToolHidden = useIsPropertyHidden('support', 'tool');
  const isScopeHidden = useIsPropertyHidden('support', 'scope');
  const isInvitationUrlHidden = useIsPropertyHidden('support', 'invitationUrl');

  // Convert array format to object lookup for UI components
  const customPropertiesLookup = useMemo(() => {
    const cp = item.customProperties;
    if (!Array.isArray(cp)) return cp || {};
    return cp.reduce((acc, item) => {
      if (item?.property !== undefined) {
        acc[item.property] = item.value;
      }
      return acc;
    }, {});
  }, [item.customProperties]);

  // Build context for condition evaluation
  const supportContext = useMemo(() => ({
    channel: item.channel,
    url: item.url,
    description: item.description,
    tool: item.tool,
    scope: item.scope,
    invitationUrl: item.invitationUrl,
    ...customPropertiesLookup,
  }), [item, customPropertiesLookup]);

  // Handle custom property changes - stores as array format per ODCS standard
  const updateCustomProperty = useCallback((propName, value) => {
    // Convert object format to array format if needed
    let currentArray;
    const cp = item.customProperties;
    if (Array.isArray(cp)) {
      currentArray = cp;
    } else if (cp && typeof cp === 'object') {
      currentArray = Object.entries(cp).map(([k, v]) => ({ property: k, value: v }));
    } else {
      currentArray = [];
    }

    if (value === undefined) {
      const updated = currentArray.filter(i => i.property !== propName);
      onUpdate(index, 'customProperties', updated.length > 0 ? updated : undefined);
    } else {
      const existingIndex = currentArray.findIndex(i => i.property === propName);
      if (existingIndex >= 0) {
        const updated = [...currentArray];
        updated[existingIndex] = { property: propName, value };
        onUpdate(index, 'customProperties', updated);
      } else {
        onUpdate(index, 'customProperties', [...currentArray, { property: propName, value }]);
      }
    }
  }, [item.customProperties, index, onUpdate]);

  return (
    <div className="border border-gray-300 rounded-md p-3 bg-gray-50">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {!isChannelHidden && (
          <ValidatedInput
            name={`support-channel-${index}`}
            label="Channel"
            value={item.channel || ''}
            onChange={(e) => onUpdate(index, 'channel', e.target.value)}
            required={true}
            className="bg-white"
            placeholder="support-slack"
          />
        )}
        <div>
          {!isUrlHidden && (
            <>
              <label className="block text-xs font-medium leading-4 text-gray-900 mb-1">
                URL
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={item.url || ''}
                  onChange={(e) => onUpdate(index, 'url', e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                  placeholder="https://slack.com/channels/support"
                />
                <button
                  type="button"
                  onClick={() => onRemove(index)}
                  className="p-1.5 text-gray-400 cursor-pointer border border-gray-300 rounded hover:text-red-400 hover:border-red-400 transition-colors flex-shrink-0"
                  title="Remove channel"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </>
          )}
          {isUrlHidden && (
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="p-1.5 text-gray-400 cursor-pointer border border-gray-300 rounded hover:text-red-400 hover:border-red-400 transition-colors flex-shrink-0"
              title="Remove channel"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
        {!isToolHidden && (
          <div>
            <Combobox
              label={
                <div className="flex items-center gap-1">
                  <span>Tool</span>
                  <Tooltip content="Platform type (email, slack, teams, discord, ticket, googlechat, other)">
                    <QuestionMarkCircleIcon />
                  </Tooltip>
                </div>
              }
              options={toolOptions}
              value={item.tool || ''}
              onChange={(selectedValue) => onUpdate(index, 'tool', selectedValue || '')}
              placeholder="Select a tool..."
              acceptAnyInput={true}
              renderSelectedIcon={(value) => {
                const IconComponent = supportIcons[value];
                return IconComponent ? <IconComponent /> : null;
              }}
              renderOption={(option) => {
                const IconComponent = supportIcons[option.id];
                return (
                  <div className="flex items-center gap-2">
                    {IconComponent && <IconComponent />}
                    <span className="block truncate">{option.name}</span>
                  </div>
                );
              }}
            />
          </div>
        )}
        {!isScopeHidden && (
          <div>
            <Combobox
              label={
                <div className="flex items-center gap-1">
                  <span>Scope</span>
                  <Tooltip content="Usage context (interactive, announcements, issues, notifications)">
                    <QuestionMarkCircleIcon />
                  </Tooltip>
                </div>
              }
              options={scopeOptions}
              value={item.scope || ''}
              onChange={(selectedValue) => onUpdate(index, 'scope', selectedValue || '')}
              placeholder="Select a scope..."
              acceptAnyInput={true}
            />
          </div>
        )}
        {!isDescriptionHidden && (
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium leading-4 text-gray-900 mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={item.description || ''}
              onChange={(e) => onUpdate(index, 'description', e.target.value)}
              className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
              placeholder="Channel details for users..."
            />
          </div>
        )}
        {!isInvitationUrlHidden && (
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium leading-4 text-gray-900 mb-1">
              Invitation URL
            </label>
            <input
              type="text"
              value={item.invitationUrl || ''}
              onChange={(e) => onUpdate(index, 'invitationUrl', e.target.value)}
              className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
              placeholder="https://invite-link.com"
            />
          </div>
        )}

        {/* Custom Sections from Customization */}
        <div className="sm:col-span-2">
          <CustomSections
            customSections={customSections}
            customProperties={customPropertyConfigs}
            values={customPropertiesLookup}
            onPropertyChange={updateCustomProperty}
            context={supportContext}
            yamlParts={yamlParts}
          />
        </div>

        {/* Ungrouped Custom Properties */}
        <div className="sm:col-span-2">
          <UngroupedCustomProperties
            customProperties={customPropertyConfigs}
            customSections={customSections}
            values={customPropertiesLookup}
            onPropertyChange={updateCustomProperty}
            context={supportContext}
            yamlParts={yamlParts}
          />
        </div>
      </div>
    </div>
  );
};

const Support = () => {
	const support = useEditorStore(useShallow((state) => state.getValue('support'))) || [];
	const setValue = useEditorStore(useShallow((state) => state.setValue));

  const toolOptions = [
    { id: 'email', name: 'email' },
    { id: 'slack', name: 'slack' },
    { id: 'teams', name: 'teams' },
    { id: 'discord', name: 'discord' },
    { id: 'ticket', name: 'ticket' },
    { id: 'googlechat', name: 'googlechat' },
    { id: 'other', name: 'other' }
  ];

  const scopeOptions = [
    { id: 'interactive', name: 'interactive' },
    { id: 'announcements', name: 'announcements' },
    { id: 'issues', name: 'issues' },
    { id: 'notifications', name: 'notifications' }
  ];

  // Update YAML when form fields change
  const updateField = (value) => {
    try {

      if (value) {
				setValue('support', value);
      }
    } catch (error) {
      console.error('Error updating YAML:', error);
    }
  };

  // Update a specific support item
  const updateSupportItem = (index, field, value) => {
    const updatedItems = [...support];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value || undefined
    };
    updateField(updatedItems);
  };

  // Add a new support item
  const addSupportItem = () => {
    const newItem = {
      channel: '',
      url: ''
    };
    updateField([...support, newItem]);
  };

  // Remove a support item
  const removeSupportItem = (index) => {
    const updatedItems = support.filter((_, i) => i !== index);
		console.log(updatedItems);
    updateField(updatedItems);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-semibold leading-6 text-gray-900 mb-3">Support</h3>
            <p className="mt-1 text-xs leading-4 text-gray-500 mb-4">
              Communication channels for dataset assistance.
            </p>

            <div>
              {/* Display existing support channels */}
              {support?.length > 0 && (
                <div className="space-y-3 mb-2">
                  {support.map((item, index) => (
                    <SupportItem
                      key={index}
                      item={item}
                      index={index}
                      onUpdate={updateSupportItem}
                      onRemove={removeSupportItem}
                      toolOptions={toolOptions}
                      scopeOptions={scopeOptions}
                    />
                  ))}
                </div>
              )}

              {/* Always show add button */}
              <button
                type="button"
                onClick={addSupportItem}
                className="w-full px-2 py-1 border-2 border-dashed border-gray-300 rounded text-xs text-gray-600 hover:border-indigo-400 hover:text-indigo-600"
              >
                + Add Support Channel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;
