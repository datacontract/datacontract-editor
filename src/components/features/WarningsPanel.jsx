import React from 'react';
import { useTranslation } from 'react-i18next';
import { useEditorStore } from '../../store';
import { getSchemaFilename } from '../../services/schemaRegistry.js';

/**
 * Footer naming the schema in use. The document's own ODCS version is edited under Fundamentals.
 */
const SchemaFooter = ({ schemaUrl }) => {
  const schemaFilename = getSchemaFilename(schemaUrl);
  if (!schemaFilename) return null;

  return (
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
      </div>
    </div>
  );
};

const WarningsPanel = ({ onMarkerClick }) => {
  const { t } = useTranslation();
  const markers = useEditorStore((state) => state.markers);
  const schemaUrl = useEditorStore((state) => state.schemaUrl);

  const handleMarkerClick = (marker) => {
    if (onMarkerClick) {
      onMarkerClick(marker.startLineNumber, marker.startColumn);
    }
  };

  const footer = <SchemaFooter schemaUrl={schemaUrl} />;

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
            <h3 className="mt-2 text-sm font-medium">{t('warnings.empty.title')}</h3>
            <p className="mt-1 text-sm">{t('warnings.empty.subtitle')}</p>
          </div>
        </div>
        {footer}
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Problems Section */}
      <div className="flex-1 overflow-y-auto p-4">
        <h2 className="text-lg font-bold mb-4 text-red-700 dark:text-red-400">
          {t('warnings.problems', { count: markers.length })}
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
                    {t('warnings.lineColumn', { line: marker.startLineNumber, column: marker.startColumn })}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
      {footer}
    </div>
  );
};

export default WarningsPanel;
