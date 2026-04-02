import { useMemo, useCallback, useEffect } from 'react';
import { useEditorStore } from '../store.js';
import { isSafeKey } from '../utils/safeProperty.js';
import TagsInput from '../components/ui/TagsInput.jsx';
import AuthoritativeDefinitionsEditor from '../components/ui/AuthoritativeDefinitionsEditor.jsx';
import CustomPropertiesEditor from '../components/ui/CustomPropertiesEditor.jsx';
import TeamMember from '../components/features/TeamMember.jsx';
import {useShallow} from "zustand/react/shallow";
import { useCustomization, useIsPropertyHidden, useStandardPropertyOverride, convertEnumToOptions } from '../hooks/useCustomization.js';
import { CustomSections, UngroupedCustomProperties } from '../components/ui/CustomSection.jsx';
import ValidatedInput from '../components/ui/ValidatedInput.jsx';
import { ValidatedCombobox } from '../components/ui/index.js';

const Team = () => {
	const team = useEditorStore(useShallow((state) => state.getValue('team')))
	const setValue = useEditorStore(useShallow((state) => state.setValue))
  const editorConfig = useEditorStore((state) => state.editorConfig);
  const yamlParts = useEditorStore((state) => state.yamlParts);

	const members = team && !Array.isArray(team) && team?.members ? team.members : [];

  // Get customization config for team level
  const { customProperties: customPropertyConfigs, customSections } = useCustomization('team');

  // Check hidden status for standard properties
  const isNameHidden = useIsPropertyHidden('team', 'name');
  const isDescriptionHidden = useIsPropertyHidden('team', 'description');

  // Get standard property overrides
  const nameOverride = useStandardPropertyOverride('team', 'name');
  const nameOptions = convertEnumToOptions(nameOverride?.enum);

  // Convert array format to object lookup for UI components
  const customPropertiesLookup = useMemo(() => {
    const cp = team?.customProperties;
    if (!Array.isArray(cp)) return cp || {};
    return cp.reduce((acc, item) => {
      if (item?.property !== undefined && isSafeKey(item.property)) {
        acc[item.property] = item.value;
      }
      return acc;
    }, {});
  }, [team?.customProperties]);

  // Build context for condition evaluation
  const teamContext = useMemo(() => ({
    name: team?.name,
    description: team?.description,
    ...customPropertiesLookup,
  }), [team, customPropertiesLookup]);

	// Handle old flat team structure
	useEffect(() => {
		if(team && Array.isArray(team)) {
			setValue('team', {
				members: team,
			})
		}
	}, [])

  // Update team object in YAML
  const updateTeamObject = (updates) => {
    try {

      // Build team object
      const teamObj = {
        ...(team || {}),
        ...updates
      };

      // Clean up undefined/empty values
      Object.keys(teamObj).forEach(key => {
        if (teamObj[key] === undefined || teamObj[key] === '' ||
            (Array.isArray(teamObj[key]) && teamObj[key].length === 0)) {
          delete teamObj[key];
        }
      });

      // Update in store/yaml
      if (Object.keys(teamObj).length > 0) {
        setValue('team', teamObj);
      }

    } catch (error) {
      console.error('Error updating YAML:', error);
    }
  };

  // Update a team-level field
  const updateTeamField = (field, value) => {
    updateTeamObject({ [field]: value || undefined });
  };

  // Handle custom property changes - stores as array format per ODCS standard
  const updateCustomProperty = useCallback((propName, value) => {
    // Convert object format to array format if needed
    let currentArray;
    const cp = team?.customProperties;
    if (Array.isArray(cp)) {
      currentArray = cp;
    } else if (cp && typeof cp === 'object') {
      currentArray = Object.entries(cp).map(([k, v]) => ({ property: k, value: v }));
    } else {
      currentArray = [];
    }

    if (value === undefined) {
      const updated = currentArray.filter(item => item.property !== propName);
      updateTeamField('customProperties', updated.length > 0 ? updated : undefined);
    } else {
      const existingIndex = currentArray.findIndex(item => item.property === propName);
      if (existingIndex >= 0) {
        const updated = [...currentArray];
        updated[existingIndex] = { property: propName, value };
        updateTeamField('customProperties', updated);
      } else {
        updateTeamField('customProperties', [...currentArray, { property: propName, value }]);
      }
    }
  }, [team?.customProperties, updateTeamField]);

  // Update members array
  const updateMembersArray = (members) => {
    updateTeamObject({ members: members && members.length > 0 ? members : undefined });
  };

  // Update a specific member
  const updateMember = (index, field, value) => {
    const updatedMembers = [...members];
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
    updateMembersArray([...members, newMember]);
  };

  // Remove a member
  const removeMember = (index) => {
    const updatedMembers = members.filter((_, i) => i !== index);
    updateMembersArray(updatedMembers);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-semibold leading-6 text-gray-900">Team</h3>
            <p className="mt-1 text-xs leading-4 text-gray-500 mb-4">
              Team information and members.
            </p>

            <div className="space-y-4">
              {/* Team Name */}
              {!isNameHidden && (
                (() => {
                  // Build options from customization enum or editorConfig.teams
                  const teamOptions = nameOptions ||
                    (editorConfig?.teams?.length > 0
                      ? editorConfig.teams.map(t => ({ id: t.id, name: t.name }))
                      : null);

                  return teamOptions ? (
                    <ValidatedCombobox
                      name="teamName"
                      label={nameOverride?.title || 'Team Name'}
                      options={teamOptions}
                      value={team?.name || ''}
                      onChange={(selectedValue) => updateTeamField('name', selectedValue || undefined)}
                      placeholder={nameOverride?.placeholder || "Select a team..."}
                      tooltip={nameOverride?.description}
                      required={nameOverride?.required}
                      pattern={nameOverride?.pattern}
                      patternMessage={nameOverride?.patternMessage}
                      acceptAnyInput={false}
                      allowCustomValue={false}
                    />
                  ) : (
                    <ValidatedInput
                      name="teamName"
                      label={nameOverride?.title || 'Team Name'}
                      value={team?.name || ''}
                      onChange={(e) => updateTeamField('name', e.target.value)}
                      placeholder={nameOverride?.placeholder || "Data Engineering Team"}
                      required={nameOverride?.required}
                      tooltip={nameOverride?.description}
                      pattern={nameOverride?.pattern}
                      patternMessage={nameOverride?.patternMessage}
                      minLength={nameOverride?.minLength}
                      maxLength={nameOverride?.maxLength}
                    />
                  );
                })()
              )}

              {/* Team Description */}
              {!isDescriptionHidden && (
                <div>
                  <label className="block text-xs font-medium leading-4 text-gray-900 mb-1">
                    Description
                  </label>
                  <textarea
                    value={team?.description}
                    onChange={(e) => updateTeamField('description', e.target.value)}
                    className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                    placeholder="Description of the team..."
                    rows={3}
                  />
                </div>
              )}

              {/* Team Tags */}
              <TagsInput
                label="Tags"
                value={team?.tags}
                onChange={(value) => updateTeamField('tags', value)}
                placeholder="Add a tag..."
              />

              {/* Custom Sections from Customization */}
              <CustomSections
                customSections={customSections}
                customProperties={customPropertyConfigs}
                values={customPropertiesLookup}
                onPropertyChange={updateCustomProperty}
                context={teamContext}
                yamlParts={yamlParts}
                validationKeyPrefix="team"
                validationSection="Team"
              />

              {/* Ungrouped Custom Properties */}
              <UngroupedCustomProperties
                customProperties={customPropertyConfigs}
                customSections={customSections}
                values={customPropertiesLookup}
                onPropertyChange={updateCustomProperty}
                context={teamContext}
                yamlParts={yamlParts}
                validationKeyPrefix="team"
                validationSection="Team"
              />

              {/* Team Custom Properties (raw key-value editor) */}
              <CustomPropertiesEditor
                value={team?.customProperties}
                onChange={(value) => updateTeamField('customProperties', value)}
                managedProperties={customPropertyConfigs.map(c => c.property)}
              />

              {/* Team Authoritative Definitions */}
              <AuthoritativeDefinitionsEditor
                value={team?.authoritativeDefinitions}
                onChange={(value) => updateTeamField('authoritativeDefinitions', value)}
              />

              {/* Team Members */}
              <div>
                {/* Display existing members */}
                {members.length > 0 && (
                  <div className="space-y-3 mb-2">
                    {members.map((member, index) => (
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
