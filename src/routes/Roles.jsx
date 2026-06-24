import { useEditorStore } from '../store.js';
import RolesList from '../components/features/RolesList.jsx';
import {useShallow} from "zustand/react/shallow";
import {useTranslation} from 'react-i18next';

const Roles = () => {
  const { t } = useTranslation();
  const roles = useEditorStore(useShallow((state) => state.getValue('roles')));
	const setValue = useEditorStore(useShallow((state) => state.setValue));

  // Update YAML when form fields change
  const updateRoles = (value) => {
    try {
      setValue('roles', value && value.length > 0 ? value : undefined);
    } catch (error) {
      console.error('Error updating YAML:', error);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-semibold leading-6 text-gray-900">{t('roles.heading')}</h3>
            <p className="mt-1 text-xs leading-4 text-gray-500 mb-4">
              {t('roles.description')}
            </p>

            <RolesList roles={roles} onUpdate={updateRoles} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Roles;
