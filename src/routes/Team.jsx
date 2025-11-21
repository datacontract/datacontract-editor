import { useMemo } from 'react';
import { useEditorStore } from '../store.js';
import { Tooltip } from '../components/ui/index.js';
import QuestionMarkCircleIcon from '../components/ui/icons/QuestionMarkCircleIcon.jsx';
import Tags from '../components/ui/Tags.jsx';
import KeyValueEditor from '../components/ui/KeyValueEditor.jsx';
import AuthoritativeDefinitionsEditor from '../components/ui/AuthoritativeDefinitionsEditor.jsx';
import CustomPropertiesEditor from '../components/ui/CustomPropertiesEditor.jsx';
import * as YAML from 'yaml';

const Team = () => {
  const yaml = useEditorStore((state) => state.yaml);
  const setYaml = useEditorStore((state) => state.setYaml);
  const currentView = useEditorStore((state) => state.currentView);
  const editorConfig = useEditorStore((state) => state.editorConfig);

  // Parse current YAML to extract form values
  const formData = useMemo(() => {
    if (!yaml?.trim()) {
      return {
        name: '',
        description: '',
        members: [],
        tags: [],
        customProperties: [],
        authoritativeDefinitions: []
      };
    }

    try {
      const parsed = YAML.parse(yaml);
      // team is now an object with name, description, members, tags, customProperties, authoritativeDefinitions
      const team = parsed.team || {};
      return {
        name: team.name || '',
        description: team.description || '',
        members: Array.isArray(team.members) ? team.members : [],
        tags: Array.isArray(team.tags) ? team.tags : [],
        customProperties: Array.isArray(team.customProperties) ? team.customProperties : [],
        authoritativeDefinitions: Array.isArray(team.authoritativeDefinitions) ? team.authoritativeDefinitions : []
      };
    } catch {
      return {
        name: '',
        description: '',
        members: [],
        tags: [],
        customProperties: [],
        authoritativeDefinitions: []
      };
    }
  }, [yaml]);

  // Update team object in YAML
  const updateTeamObject = (updates) => {
    try {
      let parsed = {};
      if (yaml?.trim()) {
        try {
          parsed = YAML.parse(yaml) || {};
        } catch {
          parsed = {};
        }
      }

      // Build team object
      const teamObj = {
        ...(parsed.team || {}),
        ...updates
      };

      // Clean up undefined/empty values
      Object.keys(teamObj).forEach(key => {
        if (teamObj[key] === undefined || teamObj[key] === '' ||
            (Array.isArray(teamObj[key]) && teamObj[key].length === 0)) {
          delete teamObj[key];
        }
      });

      // Set team object or delete if empty
      if (Object.keys(teamObj).length > 0) {
        parsed.team = teamObj;
      } else {
        delete parsed.team;
      }

      // Convert back to YAML
      const newYaml = YAML.stringify(parsed);
      setYaml(newYaml);
    } catch (error) {
      console.error('Error updating YAML:', error);
    }
  };

  // Update a team-level field
  const updateTeamField = (field, value) => {
    updateTeamObject({ [field]: value || undefined });
  };

  // Update members array
  const updateMembersArray = (members) => {
    updateTeamObject({ members: members && members.length > 0 ? members : undefined });
  };

  // Update a specific member
  const updateMember = (index, field, value) => {
    const updatedMembers = [...formData.members];
    updatedMembers[index] = {
      ...updatedMembers[index],
      [field]: value || undefined
    };
    updateMembersArray(updatedMembers);
  };

  // Add a new member
  const addMember = () => {
    const newMember = {
      username: '',
      name: '',
      role: ''
    };
    updateMembersArray([...formData.members, newMember]);
  };

  // Remove a member
  const removeMember = (index) => {
    const updatedMembers = formData.members.filter((_, i) => i !== index);
    updateMembersArray(updatedMembers);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-semibold leading-6 text-gray-900 mb-3">Team</h3>
            <p className="mt-1 text-xs leading-4 text-gray-500 mb-4">
              Team information and members.
            </p>

            <div className="space-y-4">
              {/* Team Name */}
              <div>
                <label className="block text-xs font-medium leading-4 text-gray-900 mb-1">
                  Team Name
                </label>
                {editorConfig?.teams && editorConfig.teams.length > 0 ? (
                  <select
                    value={formData.name}
                    onChange={(e) => updateTeamField('name', e.target.value)}
                    className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                  >
                    <option value="">Select a team...</option>
                    {editorConfig.teams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => updateTeamField('name', e.target.value)}
                    className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                    placeholder="Data Engineering Team"
                  />
                )}
              </div>

              {/* Team Description */}
              <div>
                <label className="block text-xs font-medium leading-4 text-gray-900 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateTeamField('description', e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                  placeholder="Description of the team..."
                  rows={3}
                />
              </div>

              {/* Team Tags */}
              <Tags
                label="Tags"
                value={formData.tags}
                onChange={(value) => updateTeamField('tags', value)}
                placeholder="Add a tag..."
              />

              {/* Team Custom Properties */}
              <CustomPropertiesEditor
                value={formData.customProperties}
                onChange={(value) => updateTeamField('customProperties', value)}
                helpText="Custom key-value properties for this team"
              />

              {/* Team Authoritative Definitions */}
              <AuthoritativeDefinitionsEditor
                value={formData.authoritativeDefinitions}
                onChange={(value) => updateTeamField('authoritativeDefinitions', value)}
              />

              {/* Team Members */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-medium leading-4 text-gray-900">
                    Team Members
                  </label>
                  <button
                    type="button"
                    onClick={addMember}
                    className="inline-flex items-center rounded-md bg-indigo-600 px-2 py-1 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    Add Member
                  </button>
                </div>

                {formData.members.length === 0 ? (
                  <div className="text-center py-4 text-xs text-gray-500 bg-gray-50 rounded-md border border-gray-200">
                    No team members added yet. Click "Add Member" to get started.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {formData.members.map((member, index) => (
                      <div key={index} className="border border-gray-300 rounded-md p-3 bg-gray-50">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs font-medium text-gray-700">Member {index + 1}</span>
                          <button
                            type="button"
                            onClick={() => removeMember(index)}
                            className="text-xs text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </div>
                        <div className="space-y-3">
                          {/* Basic Info Row */}
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div>
                              <div className="flex justify-between mb-1">
                                <label className="block text-xs font-medium leading-4 text-gray-900">
                                  Username
                                </label>
                                <span className="text-xs leading-4 text-gray-500">Required</span>
                              </div>
                              <input
                                type="text"
                                value={member.username || ''}
                                onChange={(e) => updateMember(index, 'username', e.target.value)}
                                className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                                placeholder="user@example.com"
                                data-1p-ignore
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium leading-4 text-gray-900 mb-1">
                                Full Name
                              </label>
                              <input
                                type="text"
                                value={member.name || ''}
                                onChange={(e) => updateMember(index, 'name', e.target.value)}
                                className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                                placeholder="John Doe"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium leading-4 text-gray-900 mb-1">
                                Role
                              </label>
                              <input
                                type="text"
                                value={member.role || ''}
                                onChange={(e) => updateMember(index, 'role', e.target.value)}
                                className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                                placeholder="e.g., owner, data steward"
                              />
                            </div>
                          </div>

                          {/* Description */}
                          <div>
                            <label className="block text-xs font-medium leading-4 text-gray-900 mb-1">
                              Description
                            </label>
                            <textarea
                              value={member.description || ''}
                              onChange={(e) => updateMember(index, 'description', e.target.value)}
                              className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                              placeholder="Description of the team member..."
                              rows={2}
                            />
                          </div>

                          {/* Date Fields Row */}
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                            <div>
                              <label className="block text-xs font-medium leading-4 text-gray-900 mb-1">
                                Date In
                              </label>
                              <input
                                type="date"
                                value={member.dateIn || ''}
                                onChange={(e) => updateMember(index, 'dateIn', e.target.value)}
                                className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium leading-4 text-gray-900 mb-1">
                                Date Out
                              </label>
                              <input
                                type="date"
                                value={member.dateOut || ''}
                                onChange={(e) => updateMember(index, 'dateOut', e.target.value)}
                                className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium leading-4 text-gray-900 mb-1">
                                Replaced By
                              </label>
                              <input
                                type="text"
                                value={member.replacedByUsername || ''}
                                onChange={(e) => updateMember(index, 'replacedByUsername', e.target.value)}
                                className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                                placeholder="successor@example.com"
                                data-1p-ignore
                              />
                            </div>
                          </div>

                          {/* Tags */}
                          <Tags
                            label="Tags"
                            value={member.tags || []}
                            onChange={(value) => updateMember(index, 'tags', value)}
                            placeholder="Add a tag..."
                          />

                          {/* Custom Properties */}
                          <CustomPropertiesEditor
                            value={member.customProperties || []}
                            onChange={(value) => updateMember(index, 'customProperties', value)}
                            helpText="Custom key-value properties for this team member"
                          />

                          {/* Authoritative Definitions */}
                          <AuthoritativeDefinitionsEditor
                            value={member.authoritativeDefinitions || []}
                            onChange={(value) => updateMember(index, 'authoritativeDefinitions', value)}
                          />
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
    </div>
  );
};

export default Team;
