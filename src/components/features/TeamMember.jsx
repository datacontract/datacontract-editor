import Tags from '../ui/Tags.jsx';
import CustomPropertiesEditor from '../ui/CustomPropertiesEditor.jsx';
import AuthoritativeDefinitionsEditor from '../ui/AuthoritativeDefinitionsEditor.jsx';
import ValidatedInput from '../ui/ValidatedInput.jsx';

/**
 * TeamMember component for displaying and editing a single team member
 * @param {Object} member - The member data
 * @param {number} index - The index of the member in the array
 * @param {Function} onUpdate - Callback to update a member field (index, field, value)
 * @param {Function} onRemove - Callback to remove the member (index)
 */
const TeamMember = ({ member, index, onUpdate, onRemove }) => {
  return (
    <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
			<div className="relative -mt-5 text-xs bg-transparent">test</div>
      <div className="space-y-3">
        {/* Basic Info Row */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
          <div>
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
          </div>
				</div>

				<div className="flex flex-col gap-3">
					{/* Description */}
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

          <ValidatedInput
            name={`member-${index}-role`}
            label="Role"
            value={member.role || ''}
            onChange={(e) => onUpdate(index, 'role', e.target.value)}
            placeholder="e.g., owner, data steward"
						className="bg-white"
						data-1p-ignore
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
              onChange={(e) => onUpdate(index, 'dateIn', e.target.value)}
              className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
            />
          </div>
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

        {/* Custom Properties */}
        <CustomPropertiesEditor
          value={member.customProperties || []}
          onChange={(value) => onUpdate(index, 'customProperties', value)}
          showDescription={true}
          helpText="Add custom key-value properties for member-specific metadata"
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
