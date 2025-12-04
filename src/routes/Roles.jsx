import { useEditorStore } from '../store.js';
import RolesList from '../components/features/RolesList.jsx';
import {useShallow} from "zustand/react/shallow";

const Roles = () => {
  const roles = useEditorStore(useShallow((state) => state.getValue('roles')));
	const setValue = useEditorStore(useShallow((state) => state.setValue));

  // Update YAML when form fields change
  const updateRoles = (value) => {
    try {
      if (value && value.length > 0) {
				setValue('roles', value);
      }
    } catch (error) {
      console.error('Error updating YAML:', error);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-semibold leading-6 text-gray-900 mb-3">Roles</h3>
            <p className="mt-1 text-xs leading-4 text-gray-500 mb-4">
              A list of roles that will provide user access to the dataset.
            </p>

            <RolesList roles={roles} onUpdate={updateRoles} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Roles;
