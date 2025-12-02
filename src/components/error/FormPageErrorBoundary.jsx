import { memo, useCallback, useMemo } from 'react';
import ErrorBoundary from './ErrorBoundary.jsx';
import { useEditorStore } from '../../store.js';

/**
 * Specialized error boundary for form pages (Overview, Schema, Servers, etc.)
 * Provides context-specific error messaging and recovery options
 */

// const generateHash = (string) => {
// 	let hash = 0;
// 	for (const char of string) {
// 		hash = (hash << 5) - hash + char.charCodeAt(0);
// 		hash |= 0; // Constrain to 32bit integer
// 	}
// 	return hash;
// };

const FormPageErrorBoundary = memo(({ children, pageName = 'form' }) => {
  // Only subscribe to setView, and use shallow comparison to prevent unnecessary re-renders
  const setView = useEditorStore(useCallback((state) => state.setView, []));
  // const yaml = useEditorStore((state) => state.yaml);

  const fallback = useCallback(({ error, resetError }) => (
    <div className="flex items-center justify-center h-full p-4 bg-white">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-lg w-full">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <svg className="h-6 w-6 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-red-800">
              Form Error
            </h3>
            <p className="mt-1 text-xs text-red-700">
              The {pageName} form encountered an error and could not be displayed.
            </p>

            <div className="mt-2 text-xs text-red-600">
              <span className="font-medium">Error: </span>
              {error?.message || 'Unknown form error'}
            </div>

            <div className="mt-3 space-y-2">
              <p className="text-xs text-red-700 font-medium">What you can do:</p>
              <ul className="list-disc list-inside text-xs text-red-600 space-y-1">
                <li>Switch to YAML view to edit your data contract directly</li>
                <li>Check if your YAML structure is valid</li>
                <li>Try navigating to a different form page</li>
                <li>Your data is safe - the YAML has been preserved</li>
              </ul>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={resetError}
                className="inline-flex items-center px-3 py-1.5 border border-red-300 text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Retry Form
              </button>
              <button
                onClick={() => setView('yaml')}
                className="inline-flex items-center px-3 py-1.5 border border-indigo-600 text-xs font-medium rounded text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Edit YAML Directly
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <details className="mt-3">
                <summary className="cursor-pointer text-xs font-medium text-red-700">
                  Developer Details
                </summary>
                <pre className="mt-2 text-xs text-red-600 whitespace-pre-wrap overflow-auto max-h-32 bg-red-100 p-2 rounded">
                  {error?.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      </div>
    </div>
  ), [pageName, setView]);

  const onError = useCallback((error, errorInfo) => {
    console.error(`Form page (${pageName}) error:`, {
      error,
      errorInfo,
      pageName,
    });
  }, [pageName]);

  return (
    <ErrorBoundary
      fallback={fallback}
      // resetKeys={[generateHash(yaml)]}
      onError={onError}
    >
      {children}
    </ErrorBoundary>
  );
});

FormPageErrorBoundary.displayName = 'FormPageErrorBoundary';

export default FormPageErrorBoundary;
