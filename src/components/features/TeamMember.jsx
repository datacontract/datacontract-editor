import { useMemo, useCallback } from 'react';
import Tags from '../ui/Tags.jsx';
import CustomPropertiesEditor from '../ui/CustomPropertiesEditor.jsx';
import AuthoritativeDefinitionsEditor from '../ui/AuthoritativeDefinitionsEditor.jsx';
import ValidatedInput from '../ui/ValidatedInput.jsx';
import { useEditorStore } from '../../store.js';
import { useCustomization, useIsPropertyHidden } from '../../hooks/useCustomization.js';
import { CustomSections, UngroupedCustomProperties } from '../ui/CustomSection.jsx';

/**
 * TeamMember component for displaying and editing a single team member
 * @param {Object} member - The member data
 * @param {number} index - The index of the member in the array
 * @param {Function} onUpdate - Callback to update a member field (index, field, value)
 * @param {Function} onRemove - Callback to remove the member (index)
 */
const TeamMember = ({ member, index, onUpdate, onRemove }) => {
  const yamlParts = useEditorStore((state) => state.yamlParts);

  // Get customization config for team.members level
  const { customProperties: customPropertyConfigs, customSections } = useCustomization('team.members');

  // Check hidden status for standard properties
  const isUsernameHidden = useIsPropertyHidden('team.members', 'username');
  const isNameHidden = useIsPropertyHidden('team.members', 'name');
  const isRoleHidden = useIsPropertyHidden('team.members', 'role');
  const isDescriptionHidden = useIsPropertyHidden('team.members', 'description');
  const isDateInHidden = useIsPropertyHidden('team.members', 'dateIn');
  const isDateOutHidden = useIsPropertyHidden('team.members', 'dateOut');

  // Convert array format to object lookup for UI components
  const customPropertiesLookup = useMemo(() => {
    const cp = member.customProperties;
    if (!Array.isArray(cp)) return cp || {};
    return cp.reduce((acc, item) => {
      if (item?.property !== undefined) {
        acc[item.property] = item.value;
      }
      return acc;
    }, {});
  }, [member.customProperties]);

  // Build context for condition evaluation
  const memberContext = useMemo(() => ({
    username: member.username,
    name: member.name,
    role: member.role,
    description: member.description,
    dateIn: member.dateIn,
    dateOut: member.dateOut,
    ...customPropertiesLookup,
  }), [member, customPropertiesLookup]);

  // Handle custom property changes - stores as array format per ODCS standard
  const updateCustomProperty = useCallback((propName, value) => {
    // Convert object format to array format if needed
    let currentArray;
    const cp = member.customProperties;
    if (Array.isArray(cp)) {
      currentArray = cp;
    } else if (cp && typeof cp === 'object') {
      currentArray = Object.entries(cp).map(([k, v]) => ({ property: k, value: v }));
    } else {
      currentArray = [];
    }

    if (value === undefined) {
      const updated = currentArray.filter(item => item.property !== propName);
      onUpdate(index, 'customProperties', updated.length > 0 ? updated : undefined);
    } else {
      const existingIndex = currentArray.findIndex(item => item.property === propName);
      if (existingIndex >= 0) {
        const updated = [...currentArray];
        updated[existingIndex] = { property: propName, value };
        onUpdate(index, 'customProperties', updated);
      } else {
        onUpdate(index, 'customProperties', [...currentArray, { property: propName, value }]);
      }
    }
  }, [member.customProperties, index, onUpdate]);

  return (
    <div className="border border-gray-200 rounded-lg p-3 pt-4 bg-gray-50 relative">
			<div className="absolute -top-2 left-2 text-xs text-gray-700 font-medium px-1 bg-linear-[180deg,white_0%,#f9fafb_40%]">
				<div className="flex items-center gap-1">
					<div className="size-3">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" ><path d="M11.352 1.20156C9.911520000000001 1.358952 8.484192 2.10636 7.554048000000001 3.190296C6.794688000000001 4.0752239999999995 6.326424 5.080872 6.156312 6.192C6.101832 6.547872 6.083016000000001 7.245264000000001 6.117744 7.621704000000001C6.343968 10.074311999999999 8.067096000000001 12.125904 10.44912 12.778751999999999C10.609632 12.822743999999998 10.827143999999999 12.872784 10.93248 12.889992L11.124 12.92124 10.728 12.977352C8.021735999999999 13.360824000000001 5.657760000000001 14.896199999999999 4.200048000000001 17.21724C3.334968 18.594672 2.834088 20.276112 2.822976 21.84C2.8202160000000003 22.230864 2.82384 22.268496000000003 2.875392 22.382376C2.940336 22.525848 3.0880080000000003 22.677144 3.24 22.755984L3.348 22.812 12 22.812L20.652 22.812 20.76 22.755984C20.911992 22.677144 21.059664 22.525848 21.124608000000002 22.382376C21.176160000000003 22.268496000000003 21.179784 22.230864 21.177024 21.84C21.161256 19.620648000000003 20.210808 17.351015999999998 18.600648000000003 15.687792C17.169144 14.209104000000002 15.324624 13.270680000000002 13.272 12.976776C12.889152000000001 12.921936 12.880392 12.91944 13.008000000000001 12.901584000000001C13.0806 12.891408000000002 13.280472 12.847392 13.452143999999999 12.803736C15.143616000000002 12.373752 16.55976 11.217264 17.32308 9.642576C18.174096000000002 7.886976000000001 18.08592 5.764728 17.092176 4.085424C16.193016 2.565912 14.702664 1.544424 12.948 1.244976C12.616824000000001 1.188456 11.70012 1.1635199999999999 11.352 1.20156M11.688 2.689032C10.305432 2.775768 8.993664 3.572016 8.249856000000001 4.776C7.9922640000000005 5.192976 7.797792 5.682048 7.688256 6.188424C7.613112000000001 6.535728 7.584552 7.252752 7.631088 7.622568000000001C7.856928000000001 9.416736 9.177528 10.904712 10.93968 11.350464C11.58204 11.512944000000001 12.417959999999999 11.512944000000001 13.060319999999999 11.350464C14.822304 10.90476 16.143168 9.41592 16.369104 7.6209359999999995C16.415448 7.2528 16.386696 6.534912 16.311743999999997 6.188424C16.124232 5.32164 15.727584 4.591032 15.108287999999998 3.971712C14.721792 3.585216 14.365535999999999 3.3338880000000004 13.868496000000002 3.097008C13.414632 2.88072 12.849264 2.726112 12.414888000000001 2.699496C12.298896 2.6923920000000003 12.15 2.683224 12.084 2.679144C12.018 2.675064 11.8398 2.679504 11.688 2.689032M11.286912000000001 14.426304C10.196808 14.52348 9.004656 14.912880000000001 8.064 15.479088C6.782903999999999 16.250184 5.752848 17.368655999999998 5.112432 18.684C4.805832 19.313712000000002 4.605528 19.892184 4.476648 20.52C4.4094240000000005 20.847528 4.3453919999999995 21.305400000000002 4.364184000000001 21.324192C4.370688 21.330672 7.806792000000001 21.336000000000002 12 21.336000000000002C16.193208 21.336000000000002 19.629312000000002 21.330672 19.635816000000002 21.324192C19.654608 21.305400000000002 19.590576 20.847528 19.523352 20.52C19.30272 19.44516 18.814152 18.359592 18.157752 17.485656C16.834560000000003 15.723984000000002 14.847432000000001 14.615160000000001 12.672 14.4246C12.353208 14.396664 11.609136 14.397576 11.286912000000001 14.426304" stroke="none" fill="currentColor" fillRule="evenodd" strokeWidth={0.024} /></svg>
					</div>
					Team Member
				</div>
			</div>
      <div className="space-y-3">
        {/* Basic Info Row */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {!isUsernameHidden && (
            <ValidatedInput
              name={`member-${index}-username`}
              label="Username"
              value={member.username || ''}
              onChange={(e) => onUpdate(index, 'username', e.target.value)}
              placeholder="user@example.com"
              required={true}
              className="bg-white"
              data-1p-ignore
            />
          )}
          <div>
            {!isNameHidden && (
              <>
                <label className="block text-xs font-medium leading-4 text-gray-900 mb-1">
                  Full Name
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={member.name || ''}
                    onChange={(e) => onUpdate(index, 'name', e.target.value)}
                    className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                    placeholder="John Doe"
                  />
                  <button
                    type="button"
                    onClick={() => onRemove(index)}
                    className="p-1.5 text-gray-400 cursor-pointer border border-gray-300 rounded hover:text-red-400 hover:border-red-400 transition-colors flex-shrink-0"
                    title="Remove member"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </>
            )}
            {isNameHidden && (
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="p-1.5 text-gray-400 cursor-pointer border border-gray-300 rounded hover:text-red-400 hover:border-red-400 transition-colors flex-shrink-0"
                title="Remove member"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
				</div>

				<div className="flex flex-col gap-3">
					{/* Description */}
					{!isDescriptionHidden && (
            <div>
              <label className="block text-xs font-medium leading-4 text-gray-900 mb-1">
                Description
              </label>
              <textarea
                value={member.description || ''}
                onChange={(e) => onUpdate(index, 'description', e.target.value)}
                className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                placeholder="Description of the team member..."
                rows={2}
              />
            </div>
          )}

          {!isRoleHidden && (
            <ValidatedInput
              name={`member-${index}-role`}
              label="Role"
              value={member.role || ''}
              onChange={(e) => onUpdate(index, 'role', e.target.value)}
              placeholder="e.g., owner, data steward"
              className="bg-white"
              data-1p-ignore
            />
          )}
        </div>


        {/* Date Fields Row */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {!isDateInHidden && (
            <div>
              <label className="block text-xs font-medium leading-4 text-gray-900 mb-1">
                Date In
              </label>
              <input
                type="date"
                value={member.dateIn || ''}
                onChange={(e) => onUpdate(index, 'dateIn', e.target.value)}
                className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
              />
            </div>
          )}
          {!isDateOutHidden && (
            <div>
              <label className="block text-xs font-medium leading-4 text-gray-900 mb-1">
                Date Out
              </label>
              <input
                type="date"
                value={member.dateOut || ''}
                onChange={(e) => onUpdate(index, 'dateOut', e.target.value)}
                className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
              />
            </div>
          )}
          <ValidatedInput
            name={`member-${index}-replacedByUsername`}
            label="Replaced By"
            value={member.replacedByUsername || ''}
            onChange={(e) => onUpdate(index, 'replacedByUsername', e.target.value)}
            placeholder="successor@example.com"
						className="bg-white"
            data-1p-ignore
          />
        </div>

        {/* Tags */}
        <Tags
          label="Tags"
          value={member.tags || []}
          onChange={(value) => onUpdate(index, 'tags', value)}
          placeholder="Add a tag..."
        />

        {/* Custom Sections from Customization */}
        <CustomSections
          customSections={customSections}
          customProperties={customPropertyConfigs}
          values={customPropertiesLookup}
          onPropertyChange={updateCustomProperty}
          context={memberContext}
          yamlParts={yamlParts}
        />

        {/* Ungrouped Custom Properties */}
        <UngroupedCustomProperties
          customProperties={customPropertyConfigs}
          customSections={customSections}
          values={customPropertiesLookup}
          onPropertyChange={updateCustomProperty}
          context={memberContext}
          yamlParts={yamlParts}
        />

        {/* Custom Properties (raw key-value editor) */}
        <CustomPropertiesEditor
          value={member.customProperties || []}
          onChange={(value) => onUpdate(index, 'customProperties', value)}
          showDescription={true}
        />

        {/* Authoritative Definitions */}
        <AuthoritativeDefinitionsEditor
          value={member.authoritativeDefinitions || []}
          onChange={(value) => onUpdate(index, 'authoritativeDefinitions', value)}
        />
      </div>
    </div>
  );
};

export default TeamMember;
