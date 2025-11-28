import { useMemo } from 'react';
import { useEditorStore } from '../store.js';
import { Combobox, Tooltip } from '../components/ui/index.js';
import ValidatedInput from '../components/ui/ValidatedInput.jsx';
import QuestionMarkCircleIcon from '../components/ui/icons/QuestionMarkCircleIcon.jsx';
import supportIcons from '../assets/support-icons/supportIcons.jsx';
import * as YAML from 'yaml';

const Support = () => {
  const yaml = useEditorStore((state) => state.yaml);
  const setYaml = useEditorStore((state) => state.setYaml);
  const currentView = useEditorStore((state) => state.currentView);

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

  // Parse current YAML to extract form values
  const formData = useMemo(() => {
    if (!yaml?.trim()) {
      return { supportItems: [] };
    }

    try {
      const parsed = YAML.parse(yaml);
      return {
        supportItems: parsed.support || []
      };
    } catch {
      return { supportItems: [] };
    }
  }, [yaml]);

  // Update YAML when form fields change
  const updateField = (value) => {
    try {
      let parsed = {};
      if (yaml?.trim()) {
        try {
          parsed = YAML.parse(yaml) || {};
        } catch {
          parsed = {};
        }
      }

      if (value && value.length > 0) {
        parsed.support = value;
      } else {
        delete parsed.support;
      }

      // Convert back to YAML
      const newYaml = YAML.stringify(parsed);
      setYaml(newYaml);
    } catch (error) {
      console.error('Error updating YAML:', error);
    }
  };

  // Update a specific support item
  const updateSupportItem = (index, field, value) => {
    const updatedItems = [...formData.supportItems];
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
    updateField([...formData.supportItems, newItem]);
  };

  // Remove a support item
  const removeSupportItem = (index) => {
    const updatedItems = formData.supportItems.filter((_, i) => i !== index);
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
              {formData.supportItems.length > 0 && (
                <div className="space-y-3 mb-2">
                  {formData.supportItems.map((item, index) => (
                    <div key={index} className="border border-gray-300 rounded-md p-3 bg-gray-50">
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <ValidatedInput
                          name={`support-channel-${index}`}
                          label="Channel"
                          value={item.channel || ''}
                          onChange={(e) => updateSupportItem(index, 'channel', e.target.value)}
                          required={true}
													className="bg-white"
                          placeholder="support-slack"
                        />
                        <div>
                          <label className="block text-xs font-medium leading-4 text-gray-900 mb-1">
                            URL
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={item.url || ''}
                              onChange={(e) => updateSupportItem(index, 'url', e.target.value)}
                              className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                              placeholder="https://slack.com/channels/support"
                            />
                            <button
                              type="button"
                              onClick={() => removeSupportItem(index)}
                              className="p-1.5 text-gray-400 cursor-pointer border border-gray-300 rounded hover:text-red-400 hover:border-red-400 transition-colors flex-shrink-0"
                              title="Remove channel"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
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
                            onChange={(selectedValue) => updateSupportItem(index, 'tool', selectedValue || '')}
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
                            onChange={(selectedValue) => updateSupportItem(index, 'scope', selectedValue || '')}
                            placeholder="Select a scope..."
                            acceptAnyInput={true}
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-medium leading-4 text-gray-900 mb-1">
                            Description
                          </label>
                          <textarea
                            rows={2}
                            value={item.description || ''}
                            onChange={(e) => updateSupportItem(index, 'description', e.target.value)}
                            className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                            placeholder="Channel details for users..."
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-medium leading-4 text-gray-900 mb-1">
                            Invitation URL
                          </label>
                          <input
                            type="text"
                            value={item.invitationUrl || ''}
                            onChange={(e) => updateSupportItem(index, 'invitationUrl', e.target.value)}
                            className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                            placeholder="https://invite-link.com"
                          />
                        </div>
                      </div>
                    </div>
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
