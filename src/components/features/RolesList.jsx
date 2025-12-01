import { useRef, useEffect, useState } from 'react';
import { Tooltip } from '../ui/index.js';
import KeyValueEditor from '../ui/KeyValueEditor.jsx';
import ValidatedInput from '../ui/ValidatedInput.jsx';
import CustomPropertiesEditor from '../ui/CustomPropertiesEditor.jsx';
import QuestionMarkCircleIcon from '../ui/icons/QuestionMarkCircleIcon.jsx';

const RolesList = ({ roles = [], onUpdate, className = '', serverName = null }) => {
  const [lastAddedIndex, setLastAddedIndex] = useState(null);
  const roleInputRefs = useRef({});

  // Update a specific role
  const updateRole = (index, field, value) => {
    const updatedRoles = [...roles];
    updatedRoles[index] = {
      ...updatedRoles[index],
      [field]: value || undefined
    };
    onUpdate(updatedRoles);
  };

  // Add a new role
  const addRole = () => {
    // Determine the prefix based on context
    const prefix = serverName ? `${serverName}.` : '';
    const pattern = serverName
      ? new RegExp(`^${serverName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\.myrole(\\d+)$`)
      : /^myrole(\d+)$/;

    // Find the highest number in existing "myroleN" or "servername.myroleN" patterns
    let maxNumber = 0;
    roles.forEach(roleItem => {
      const match = roleItem.role?.match(pattern);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNumber) {
          maxNumber = num;
        }
      }
    });

    const newRole = {
      role: `${prefix}myrole${maxNumber + 1}`,
      description: ''
    };
    const newIndex = roles.length;
    setLastAddedIndex(newIndex);
    onUpdate([...roles, newRole]);
  };

  // Auto-focus and select the newly added role input
  useEffect(() => {
    if (lastAddedIndex !== null && roleInputRefs.current[lastAddedIndex]) {
      const input = roleInputRefs.current[lastAddedIndex];
      input.focus();
      input.select();
      setLastAddedIndex(null);
    }
  }, [lastAddedIndex, roles]);

  // Remove a role
  const removeRole = (index) => {
    const updatedRoles = roles.filter((_, i) => i !== index);
    onUpdate(updatedRoles);
  };

  return (
    <div className={className}>
      <label className="block text-xs font-medium text-gray-700 mb-1">
        Access Roles
      </label>

      {roles.length > 0 && (
        <div className="space-y-3 mb-2">
          {roles.map((roleItem, index) => (
              <RoleItem
                key={index}
                roleItem={roleItem}
                index={index}
                updateRole={updateRole}
                removeRole={removeRole}
                roleInputRefs={roleInputRefs}
              />
            )
          )}
        </div>
      )}

      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={addRole}
          className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
        >
          + Add Role
        </button>
      </div>
    </div>
  );
};

const RoleItem = ({ roleItem, index, updateRole, removeRole, roleInputRefs }) => {

  return (
              <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2 grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-11">
                      <ValidatedInput
                        ref={(el) => roleInputRefs.current[index] = el}
                        name={`role-${index}`}
                        label="Role"
                        value={roleItem.role || ''}
                        onChange={(e) => updateRole(index, 'role', e.target.value)}
                        required={true}
                        tooltip="IAM role name"
                        placeholder="arn:aws:iam::123456789:role/DataReader"
                        className="bg-white"
                        externalErrors={[]}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeRole(index)}
                      className="p-1 text-gray-400 cursor-pointer border border-gray-300 rounded hover:text-red-400 hover:border-red-400 transition-colors justify-self-end"
                      title="Remove"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <label className="block text-xs font-medium leading-4 text-gray-900">
                      Access
                    </label>
                    <Tooltip content="The type of access provided by the IAM role (e.g. read or write)">
                      <QuestionMarkCircleIcon />
                    </Tooltip>
                  </div>
                  <input
                    type="text"
                    value={roleItem.access || ''}
                    onChange={(e) => updateRole(index, 'access', e.target.value)}
                    className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                    placeholder="read"
                  />
                </div>
                <div className="sm:col-span-2">
                  <div className="flex items-center gap-1 mb-1">
                    <label className="block text-xs font-medium leading-4 text-gray-900">
                      Description
                    </label>
                    <Tooltip content="Permission scope explanation">
                      <QuestionMarkCircleIcon />
                    </Tooltip>
                  </div>
                  <textarea
                    rows={2}
                    value={roleItem.description || ''}
                    onChange={(e) => updateRole(index, 'description', e.target.value)}
                    className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                    placeholder="Permission scope explanation..."
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <label className="block text-xs font-medium leading-4 text-gray-900">
                      First Level Approvers
                    </label>
                    <Tooltip content="Primary approval authority">
                      <QuestionMarkCircleIcon />
                    </Tooltip>
                  </div>
                  <input
                    type="text"
                    value={roleItem.firstLevelApprovers || ''}
                    onChange={(e) => updateRole(index, 'firstLevelApprovers', e.target.value)}
                    className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                    placeholder="manager@example.com"
                    data-1p-ignore
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <label className="block text-xs font-medium leading-4 text-gray-900">
                      Second Level Approvers
                    </label>
                    <Tooltip content="Secondary approval authority">
                      <QuestionMarkCircleIcon />
                    </Tooltip>
                  </div>
                  <input
                    type="text"
                    value={roleItem.secondLevelApprovers || ''}
                    onChange={(e) => updateRole(index, 'secondLevelApprovers', e.target.value)}
                    className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                    placeholder="director@example.com"
                    data-1p-ignore
                  />
                </div>
                <div className="sm:col-span-2">
                  <CustomPropertiesEditor
                    value={roleItem.customProperties || []}
                    onChange={(customProperties) => updateRole(index, 'customProperties', customProperties)}
                    showDescription={true}
                  />
                </div>
              </div>
            </div>
  );
};

export default RolesList;
