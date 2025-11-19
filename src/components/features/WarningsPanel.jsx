import React from 'react';
import { useEditorStore } from '../../store';

const WarningsPanel = ({ onMarkerClick }) => {
  const markers = useEditorStore((state) => state.markers);
  const schemaUrl = useEditorStore((state) => state.schemaUrl);
  const schemaData = useEditorStore((state) => state.schemaData);

  const handleMarkerClick = (marker) => {
    if (onMarkerClick) {
      onMarkerClick(marker.startLineNumber, marker.startColumn);
    }
  };

  // Extract default apiVersion from schema
  const getSchemaApiVersion = () => {
    if (!schemaData) return null;

    // Try to find apiVersion in schema properties
    const apiVersionProp = schemaData?.properties?.apiVersion;
    if (apiVersionProp) {
      // Check for default value
      if (apiVersionProp.default) {
        return apiVersionProp.default;
      }
      // Check for const value
      if (apiVersionProp.const) {
        return apiVersionProp.const;
      }
      // Check for single enum value
      if (apiVersionProp.enum && apiVersionProp.enum.length === 1) {
        return apiVersionProp.enum[0];
      }
    }

    return null;
  };

  // Get schema filename from URL
  const getSchemaFilename = () => {
    if (schemaUrl) {
      const filename = schemaUrl.split('/').pop();
      return filename || 'schema.json';
    }
    return null;
  };

  const schemaApiVersion = getSchemaApiVersion();
  const schemaFilename = getSchemaFilename();

  if (markers.length === 0) {
    return (
      <div className="h-full bg-gray-50 dark:bg-gray-900 flex flex-col">
        <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium">No issues found</h3>
            <p className="mt-1 text-sm">Your YAML is valid with no errors or warnings.</p>
          </div>
        </div>

        {/* Schema Information Footer */}
        {schemaFilename && (
          <div className="p-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-xs">
              <a
                href={schemaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                {schemaFilename}
              </a>
              {schemaApiVersion && (
                <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                  {schemaApiVersion}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Problems Section */}
      <div className="flex-1 overflow-y-auto p-4">
        <h2 className="text-lg font-bold mb-4 text-red-700 dark:text-red-400">
          Problems ({markers.length})
        </h2>

        <div className="space-y-1">
          {markers.map((marker, index) => (
            <button
              key={index}
              onClick={() => handleMarkerClick(marker)}
              className="w-full text-left p-2 rounded transition-colors bg-red-50 dark:bg-red-900 hover:bg-red-100 dark:hover:bg-red-800"
            >
              <div className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-2 bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-100">
                  ✕
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 dark:text-gray-200 break-words">
                    {marker.message}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Line {marker.startLineNumber}, Column {marker.startColumn}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Schema Information Footer */}
      {schemaFilename && (
        <div className="p-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-xs">
            <a
              href={schemaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              {schemaFilename}
            </a>
            {schemaApiVersion && (
              <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                {schemaApiVersion}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WarningsPanel;
