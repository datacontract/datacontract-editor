import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEditorStore } from '../../store.js';
import { stringifyYaml, parseYaml } from '../../utils/yaml.js';

const SchemasEditor = () => {
  const yaml = useEditorStore((state) => state.yaml);
  const setYaml = useEditorStore((state) => state.setYaml);
  const navigate = useNavigate();

  // Parse schemas from YAML
  const schemas = useMemo(() => {
    if (!yaml?.trim()) {
      return [];
    }
    try {
      const parsed = parseYaml(yaml);
      return parsed.schema || [];
    } catch {
      return [];
    }
  }, [yaml]);

  // Add a new schema
  const addSchema = () => {
    try {
      let parsed = {};
      if (yaml?.trim()) {
        try {
          parsed = parseYaml(yaml) || {};
        } catch {
          parsed = {};
        }
      }

      if (!parsed.schema) {
        parsed.schema = [];
      }

      // Add new empty schema
      parsed.schema.push({
        name: '',
        businessName: '',
        description: '',
        type: 'object',
        properties: []
      });

      const newYaml = stringifyYaml(parsed);
      setYaml(newYaml);

      // Navigate to the new schema
      navigate(`/schemas/${parsed.schema.length - 1}`);
    } catch (error) {
      console.error('Error adding schema:', error);
    }
  };

  // Navigate to a schema editor
  const editSchema = (index) => {
    navigate(`/schemas/${index}`);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-semibold leading-6 text-gray-900">Schemas</h3>
            <button
              onClick={addSchema}
              className="inline-flex items-center gap-x-1.5 rounded-md bg-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              <svg className="-ml-0.5 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
              </svg>
              Add Schema
            </button>
          </div>

          {schemas.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No schemas</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new schema.</p>
              <div className="mt-6">
                <button
                  onClick={addSchema}
                  className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  <svg className="-ml-0.5 mr-1.5 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                  </svg>
                  New Schema
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {schemas.map((schema, index) => (
                <div
                  key={index}
                  onClick={() => editSchema(index)}
                  className="p-4 border border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-gray-900">
                        {schema.businessName || schema.name || `Schema ${index + 1}`}
                      </h4>
                      {schema.description && (
                        <p className="mt-1 text-xs text-gray-500 line-clamp-2">{schema.description}</p>
                      )}
                      <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                        {schema.name && (
                          <span>
                            <span className="font-medium">Name:</span> {schema.name}
                          </span>
                        )}
                        {schema.type && (
                          <span>
                            <span className="font-medium">Type:</span> {schema.type}
                          </span>
                        )}
                        {schema.properties && schema.properties.length > 0 && (
                          <span>
                            <span className="font-medium">Properties:</span> {schema.properties.length}
                          </span>
                        )}
                      </div>
                    </div>
                    <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SchemasEditor;
