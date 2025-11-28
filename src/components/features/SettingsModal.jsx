import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { useEditorStore, setEditorConfig } from '../../store';

const SettingsModal = ({ isOpen, onClose }) => {
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
      title="Settings"
      onConfirm={handleSave}
      onCancel={handleCancel}
      confirmText="Save"
      cancelText="Cancel"
    >
      <div className="space-y-4">
        <div>
          <label htmlFor="api-server-url" className="block text-sm font-medium text-gray-700 mb-1">
            Data Contract CLI API Server URL
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
            Current: <span className="font-mono text-gray-600">{apiServerUrl || 'https://api.datacontract.com'}</span>
          </p>
          <p className="mt-1 text-xs text-gray-500">
            The base URL for the Data Contract CLI API server. Leave empty to use the default.
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
            placeholder="Enter your API key"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            Optional API key for authentication with the Data Contract CLI API server.
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default SettingsModal;
