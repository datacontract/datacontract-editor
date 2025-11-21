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
      <div className="flex justify-between items-center mb-2">
        <label className="block text-xs font-medium leading-4 text-gray-900">
          Access Roles
        </label>
        <button
          type="button"
          onClick={addRole}
          className="inline-flex items-center rounded-md bg-indigo-600 px-2 py-1 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Add Role
        </button>
      </div>

      {roles.length === 0 ? (
        <div className="text-center py-4 text-xs text-gray-500 bg-gray-50 rounded-md border border-gray-200">
          No roles added yet. Click "Add Role" to get started.
        </div>
      ) : (
        <div className="space-y-3">
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
    </div>
  );
};

const RoleItem = ({ roleItem, index, updateRole, removeRole, roleInputRefs }) => {

  return (
              <div className="border border-gray-300 rounded-md p-3 bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-medium text-gray-700">Role {index + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeRole(index)}
                    className="text-xs text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <ValidatedInput
                    ref={(el) => roleInputRefs.current[index] = el}
                    name={`role-${index}`}
                    label="Role"
                    value={roleItem.role || ''}
                    onChange={(e) => updateRole(index, 'role', e.target.value)}
                    required={true}
                    tooltip="IAM role name"
                    placeholder="arn:aws:iam::123456789:role/DataReader"
                    externalErrors={[]}
                  />
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <label className="block text-xs font-medium leading-4 text-gray-900">
                      Access
                    </label>
                    <Tooltip content="The type of access provided by the IAM role (e.g. read or write)">
                      <QuestionMarkCircleIcon className="w-3.5 h-3.5 text-gray-400" />
                    </Tooltip>
                  </div>
                  <input
                    type="text"
                    value={roleItem.access || ''}
                    onChange={(e) => updateRole(index, 'access', e.target.value)}
                    className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                    placeholder="read"
                  />
                </div>
                <div className="sm:col-span-2">
                  <div className="flex items-center gap-1 mb-1">
                    <label className="block text-xs font-medium leading-4 text-gray-900">
                      Description
                    </label>
                    <Tooltip content="Permission scope explanation">
                      <QuestionMarkCircleIcon className="w-3.5 h-3.5 text-gray-400" />
                    </Tooltip>
                  </div>
                  <textarea
                    rows={2}
                    value={roleItem.description || ''}
                    onChange={(e) => updateRole(index, 'description', e.target.value)}
                    className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                    placeholder="Permission scope explanation..."
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <label className="block text-xs font-medium leading-4 text-gray-900">
                      First Level Approvers
                    </label>
                    <Tooltip content="Primary approval authority">
                      <QuestionMarkCircleIcon className="w-3.5 h-3.5 text-gray-400" />
                    </Tooltip>
                  </div>
                  <input
                    type="text"
                    value={roleItem.firstLevelApprovers || ''}
                    onChange={(e) => updateRole(index, 'firstLevelApprovers', e.target.value)}
                    className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
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
                      <QuestionMarkCircleIcon className="w-3.5 h-3.5 text-gray-400" />
                    </Tooltip>
                  </div>
                  <input
                    type="text"
                    value={roleItem.secondLevelApprovers || ''}
                    onChange={(e) => updateRole(index, 'secondLevelApprovers', e.target.value)}
                    className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                    placeholder="director@example.com"
                    data-1p-ignore
                  />
                </div>
                <div className="sm:col-span-2">
                  <CustomPropertiesEditor
                    value={roleItem.customProperties || []}
                    onChange={(customProperties) => updateRole(index, 'customProperties', customProperties)}
                    showDescription={true}
                    helpText="Add custom key-value properties for role-specific metadata"
                  />
                </div>
              </div>
            </div>
  );
};

export default RolesList;
