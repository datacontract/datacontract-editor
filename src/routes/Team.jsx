import { useMemo } from 'react';
import { useEditorStore } from '../store.js';
import { Tooltip } from '../components/ui/index.js';
import QuestionMarkCircleIcon from '../components/ui/icons/QuestionMarkCircleIcon.jsx';
import Tags from '../components/ui/Tags.jsx';
import KeyValueEditor from '../components/ui/KeyValueEditor.jsx';
import AuthoritativeDefinitionsEditor from '../components/ui/AuthoritativeDefinitionsEditor.jsx';
import CustomPropertiesEditor from '../components/ui/CustomPropertiesEditor.jsx';
import TeamMember from '../components/features/TeamMember.jsx';
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
                    className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
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
                    className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
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
                  className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
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
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Team Members
                </label>

                {/* Display existing members */}
                {formData.members.length > 0 && (
                  <div className="space-y-3 mb-2">
                    {formData.members.map((member, index) => (
                      <TeamMember
                        key={index}
                        member={member}
                        index={index}
                        onUpdate={updateMember}
                        onRemove={removeMember}
                      />
                    ))}
                  </div>
                )}

                {/* Always show add button */}
                <button
                  type="button"
                  onClick={addMember}
                  className="w-full px-2 py-1 border-2 border-dashed border-gray-300 rounded text-xs text-gray-600 hover:border-indigo-400 hover:text-indigo-600"
                >
                  + Add Team Member
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Team;
