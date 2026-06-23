import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '../ui/Modal';
import { useEditorStore, setEditorConfig } from '../../store';

const SettingsModal = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const editorConfig = useEditorStore((state) => state.editorConfig);

  // Local state for form values
  const [apiServerUrl, setApiServerUrl] = useState('');
  const [apiKey, setApiKey] = useState('');

  // Initialize form values when modal opens
  useEffect(() => {
    if (isOpen) {
      setApiServerUrl(editorConfig?.tests?.dataContractCliApiServerUrl || '');
      setApiKey(editorConfig?.tests?.apiKey || '');
    }
  }, [isOpen, editorConfig]);

  const handleSave = () => {
    // Update the editor config
    setEditorConfig({
      tests: {
        enabled: true,
        dataContractCliApiServerUrl: apiServerUrl.trim() || null,
        apiKey: apiKey.trim() || null,
      },
    });
    onClose();
  };

  const handleCancel = () => {
    // Reset to original values
    setApiServerUrl(editorConfig?.tests?.dataContractCliApiServerUrl || '');
    setApiKey(editorConfig?.tests?.apiKey || '');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('settings.title')}
      onConfirm={handleSave}
      onCancel={handleCancel}
      confirmText={t('settings.save')}
      cancelText={t('settings.cancel')}
    >
      <div className="space-y-4">
        <div>
          <label htmlFor="api-server-url" className="block text-sm font-medium text-gray-700 mb-1">
            {t('settings.apiServerUrl.label')}
          </label>
          <input
            type="url"
            id="api-server-url"
            value={apiServerUrl}
            onChange={(e) => setApiServerUrl(e.target.value)}
            placeholder="https://api.datacontract.com"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            {t('settings.current')} <span className="font-mono text-gray-600">{apiServerUrl || 'https://api.datacontract.com'}</span>
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {t('settings.apiServerUrl.help')}
          </p>
        </div>
        <div>
          <label htmlFor="api-key" className="block text-sm font-medium text-gray-700 mb-1">
            X-API-KEY
          </label>
          <input
            type="password"
            id="api-key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={t('settings.apiKey.placeholder')}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            {t('settings.apiKey.help')}
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default SettingsModal;
