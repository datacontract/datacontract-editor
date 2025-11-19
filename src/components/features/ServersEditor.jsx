import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEditorStore } from '../../store.js';
import * as YAML from 'yaml';
import serverIcons from '../../assets/server-icons/serverIcons.jsx';

const ServersEditor = () => {
  const yaml = useEditorStore((state) => state.yaml);
  const setYaml = useEditorStore((state) => state.setYaml);
  const navigate = useNavigate();

  // Parse servers from YAML
  const servers = useMemo(() => {
    if (!yaml?.trim()) {
      return [];
    }
    try {
      const parsed = YAML.parse(yaml);
      return parsed.servers || [];
    } catch {
      return [];
    }
  }, [yaml]);

  // Add a new server
  const addServer = () => {
    try {
      let parsed = {};
      if (yaml?.trim()) {
        try {
          parsed = YAML.parse(yaml) || {};
        } catch {
          parsed = {};
        }
      }

      if (!parsed.servers) {
        parsed.servers = [];
      }

      // Add new empty server
      parsed.servers.push({
        server: '',
        type: ''
      });

      const newYaml = YAML.stringify(parsed);
      setYaml(newYaml);

      // Navigate to the new server
      navigate(`/servers/${parsed.servers.length - 1}`);
    } catch (error) {
      console.error('Error adding server:', error);
    }
  };

  // Navigate to a server editor
  const editServer = (index) => {
    navigate(`/servers/${index}`);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-semibold leading-6 text-gray-900">Servers</h3>
            <button
              onClick={addServer}
              className="inline-flex items-center gap-x-1.5 rounded-md bg-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              <svg className="-ml-0.5 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
              </svg>
              Add Server
            </button>
          </div>

          {servers.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
              </svg>
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No servers</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new server.</p>
              <div className="mt-6">
                <button
                  onClick={addServer}
                  className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  <svg className="-ml-0.5 mr-1.5 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                  </svg>
                  New Server
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {servers.map((server, index) => {
                const IconComponent = serverIcons[server.type];
                return (
                  <div
                    key={index}
                    onClick={() => editServer(index)}
                    className="p-4 border border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 flex items-start gap-3">
                        {IconComponent && (
                          <div className="flex-shrink-0 mt-0.5">
                            <IconComponent />
                          </div>
                        )}
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-gray-900">
                            {server.server || `Server ${index + 1}`}
                          </h4>
                          {server.description && (
                            <p className="mt-1 text-xs text-gray-500 line-clamp-2">{server.description}</p>
                          )}
                          <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                            {server.type && (
                              <span>
                                <span className="font-medium">Type:</span> {server.type}
                              </span>
                            )}
                            {server.environment && (
                              <span>
                                <span className="font-medium">Environment:</span> {server.environment}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServersEditor;
