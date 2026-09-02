import { useTranslation } from 'react-i18next';
import { useEditorStore } from '../store.js';
import { useShallow } from 'zustand/react/shallow';
import ContextEditor from '../components/ui/ContextEditor.jsx';

/**
 * Root-level `context` section (ODCS 3.2.0+): AI and consumer guidance for the whole contract.
 * Only navigable when the active schema defines `context` (the sidebar hides it otherwise).
 */
const Context = () => {
  const { t } = useTranslation();
  const context = useEditorStore(useShallow((state) => state.getValue('context')));
  const setValue = useEditorStore(useShallow((state) => state.setValue));

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-semibold leading-6 text-gray-900">{t('context.heading')}</h3>
            <p className="mt-1 text-xs leading-4 text-gray-500 mb-4">{t('context.description')}</p>
            <ContextEditor value={context} onChange={(value) => setValue('context', value)} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Context;
