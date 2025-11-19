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
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-medium leading-4 text-gray-900">
                  Support Channels
                </label>
                <button
                  type="button"
                  onClick={addSupportItem}
                  className="inline-flex items-center rounded-md bg-indigo-600 px-2 py-1 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Add Channel
                </button>
              </div>

              {formData.supportItems.length === 0 ? (
                <div className="text-center py-4 text-xs text-gray-500 bg-gray-50 rounded-md border border-gray-200">
                  No support channels added yet. Click "Add Channel" to get started.
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.supportItems.map((item, index) => (
                    <div key={index} className="border border-gray-300 rounded-md p-3 bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-medium text-gray-700">Channel {index + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeSupportItem(index)}
                          className="text-xs text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <ValidatedInput
                          name={`support-channel-${index}`}
                          label="Channel"
                          value={item.channel || ''}
                          onChange={(e) => updateSupportItem(index, 'channel', e.target.value)}
                          required={true}
                          placeholder="support-slack"
                        />
                        <div>
                          <label className="block text-xs font-medium leading-4 text-gray-900 mb-1">
                            URL
                          </label>
                          <input
                            type="text"
                            value={item.url || ''}
                            onChange={(e) => updateSupportItem(index, 'url', e.target.value)}
                            className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                            placeholder="https://slack.com/channels/support"
                          />
                        </div>
                        <div>
                          <Combobox
                            label={
                              <div className="flex items-center gap-1">
                                <span>Tool</span>
                                <Tooltip content="Platform type (email, slack, teams, discord, ticket, googlechat, other)">
                                  <QuestionMarkCircleIcon className="w-3.5 h-3.5 text-gray-400" />
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
                                  <QuestionMarkCircleIcon className="w-3.5 h-3.5 text-gray-400" />
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
                            className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
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
                            className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                            placeholder="https://invite-link.com"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;
