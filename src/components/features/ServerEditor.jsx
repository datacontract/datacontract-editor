import { useMemo } from 'react';
import { useEditorStore } from '../../store.js';
import { Combobox, Tooltip } from '../ui/index.js';
import KeyValueEditor from '../ui/KeyValueEditor.jsx';
import ValidatedInput from '../ui/ValidatedInput.jsx';
import CustomPropertiesEditor from '../ui/CustomPropertiesEditor.jsx';
import QuestionMarkCircleIcon from '../ui/icons/QuestionMarkCircleIcon.jsx';
import serverIcons from '../../assets/server-icons/serverIcons.jsx';
import RolesList from '../features/RolesList.jsx';
import * as YAML from 'yaml';

const ServerEditor = ({ serverIndex }) => {
  const yaml = useEditorStore((state) => state.yaml);
  const setYaml = useEditorStore((state) => state.setYaml);
  const currentView = useEditorStore((state) => state.currentView);

  const typeOptions = [
    { id: 'api', name: 'api' },
    { id: 'athena', name: 'athena' },
    { id: 'azure', name: 'azure' },
    { id: 'bigquery', name: 'bigquery' },
    { id: 'clickhouse', name: 'clickhouse' },
    { id: 'cloudsql', name: 'cloudsql' },
    { id: 'custom', name: 'custom' },
    { id: 'databricks', name: 'databricks' },
    { id: 'db2', name: 'db2' },
    { id: 'denodo', name: 'denodo' },
    { id: 'dremio', name: 'dremio' },
    { id: 'duckdb', name: 'duckdb' },
    { id: 'glue', name: 'glue' },
    { id: 'informix', name: 'informix' },
    { id: 'kafka', name: 'kafka' },
    { id: 'kinesis', name: 'kinesis' },
    { id: 'local', name: 'local' },
    { id: 'mysql', name: 'mysql' },
    { id: 'oracle', name: 'oracle' },
    { id: 'postgres', name: 'postgres' },
    { id: 'postgresql', name: 'postgresql' },
    { id: 'presto', name: 'presto' },
    { id: 'pubsub', name: 'pubsub' },
    { id: 'redshift', name: 'redshift' },
    { id: 's3', name: 's3' },
    { id: 'sftp', name: 'sftp' },
    { id: 'snowflake', name: 'snowflake' },
    { id: 'synapse', name: 'synapse' },
    { id: 'trino', name: 'trino' },
    { id: 'vertica', name: 'vertica' }
  ];

  const environmentOptions = [
    { id: 'prod', name: 'prod' },
    { id: 'preprod', name: 'preprod' },
    { id: 'dev', name: 'dev' },
    { id: 'uat', name: 'uat' }
  ];

  // Parse current YAML to extract the specific server
  const server = useMemo(() => {
    if (!yaml?.trim()) {
      return null;
    }

    try {
      const parsed = YAML.parse(yaml);
      const servers = parsed.servers || [];
      return (serverIndex >= 0 && serverIndex < servers.length) ? servers[serverIndex] : null;
    } catch {
      return null;
    }
  }, [yaml, serverIndex]);

  // Update a specific field of the server
  const updateServer = (field, value) => {
    try {
      let parsed = {};
      if (yaml?.trim()) {
        try {
          parsed = YAML.parse(yaml) || {};
        } catch {
          parsed = {};
        }
      }

      if (!parsed.servers || !parsed.servers[serverIndex]) {
        return;
      }

      parsed.servers[serverIndex] = {
        ...parsed.servers[serverIndex],
        [field]: value || undefined
      };

      // Convert back to YAML
      const newYaml = YAML.stringify(parsed);
      setYaml(newYaml);
    } catch (error) {
      console.error('Error updating server:', error);
    }
  };

  // Remove the server
  const removeServer = () => {
    try {
      let parsed = {};
      if (yaml?.trim()) {
        try {
          parsed = YAML.parse(yaml) || {};
        } catch {
          return;
        }
      }

      if (!parsed.servers || !parsed.servers[serverIndex]) {
        return;
      }

      parsed.servers.splice(serverIndex, 1);

      if (parsed.servers.length === 0) {
        delete parsed.servers;
      }

      const newYaml = YAML.stringify(parsed);
      setYaml(newYaml);
    } catch (error) {
      console.error('Error removing server:', error);
    }
  };

  if (!server) {
    return (
      <div className="h-full flex flex-col bg-white">
        <div className="flex-1 overflow-y-auto p-4">
          <div className="text-center py-6 text-gray-500">
            <p className="text-xs">Server not found at index {serverIndex}.</p>
            <p className="text-xs mt-1">It may have been deleted.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-base font-semibold leading-6 text-gray-900">
                {server.server || `Server ${serverIndex + 1}`}
              </h3>
              <button
                type="button"
                onClick={removeServer}
                className="text-xs text-red-600 hover:text-red-800"
              >
                Remove Server
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <ValidatedInput
                  name="server"
                  label="Server"
                  value={server.server || ''}
                  onChange={(e) => updateServer('server', e.target.value)}
                  required={true}
                  placeholder="production-server"
                />
                <div>
                  <Combobox
                    label={
                      <div className="flex items-center gap-1">
                        <span>Environment</span>
                        <Tooltip content="Deployment stage (prod, preprod, dev, uat)">
                          <QuestionMarkCircleIcon className="w-3.5 h-3.5 text-gray-400" />
                        </Tooltip>
                      </div>
                    }
                    options={environmentOptions}
                    value={server.environment || ''}
                    onChange={(selectedValue) => updateServer('environment', selectedValue || '')}
                    placeholder="Select environment..."
                    acceptAnyInput={true}
                  />
                </div>
                <div className="sm:col-span-2">
                  <div className="flex items-center gap-1 mb-1">
                    <label className="block text-xs font-medium leading-4 text-gray-900">
                      Description
                    </label>
                    <Tooltip content="Server details">
                      <QuestionMarkCircleIcon className="w-3.5 h-3.5 text-gray-400" />
                    </Tooltip>
                  </div>
                  <textarea
                    rows={2}
                    value={server.description || ''}
                    onChange={(e) => updateServer('description', e.target.value)}
                    className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                    placeholder="Describe this server..."
                  />
                </div>
                <div className="sm:col-span-2">
                  <Combobox
                    label={
                      <div className="flex justify-between">
                        <div className="flex items-center gap-1">
                          <span>Type</span>
                          <Tooltip content="Platform category (api, athena, bigquery, snowflake, postgres, etc.)">
                            <QuestionMarkCircleIcon className="w-3.5 h-3.5 text-gray-400" />
                          </Tooltip>
                        </div>
                        <span className="text-xs leading-4 text-gray-500">Required</span>
                      </div>
                    }
                    options={typeOptions}
                    value={server.type || ''}
                    onChange={(selectedValue) => updateServer('type', selectedValue || '')}
                    placeholder="Select server type..."
                    acceptAnyInput={true}
                    renderSelectedIcon={(value) => {
                      const IconComponent = serverIcons[value];
                      return IconComponent ? (
                        <div className="flex items-center justify-center w-5 h-5">
                          <IconComponent />
                        </div>
                      ) : null;
                    }}
                    renderOption={(option) => {
                      const IconComponent = serverIcons[option.id];
                      return (
                        <div className="flex items-center gap-2">
                          {IconComponent && (
                            <div className="flex items-center justify-center w-5 h-5 flex-shrink-0">
                              <IconComponent />
                            </div>
                          )}
                          <span className="block truncate">{option.name}</span>
                        </div>
                      );
                    }}
                  />
                </div>

                {/* Type-specific fields */}
                {server.type === 'bigquery' && (
                  <>
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="block text-xs font-medium leading-4 text-gray-900">
                          Project
                        </label>
                        <span className="text-xs leading-4 text-gray-500">Required</span>
                      </div>
                      <input
                        type="text"
                        value={server.project || ''}
                        onChange={(e) => updateServer('project', e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                        placeholder="my-project"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="block text-xs font-medium leading-4 text-gray-900">
                          Dataset
                        </label>
                        <span className="text-xs leading-4 text-gray-500">Required</span>
                      </div>
                      <input
                        type="text"
                        value={server.dataset || ''}
                        onChange={(e) => updateServer('dataset', e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                        placeholder="my_dataset"
                      />
                    </div>
                  </>
                )}

                {server.type === 'snowflake' && (
                  <>
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="block text-xs font-medium leading-4 text-gray-900">
                          Account
                        </label>
                        <span className="text-xs leading-4 text-gray-500">Required</span>
                      </div>
                      <input
                        type="text"
                        value={server.account || ''}
                        onChange={(e) => updateServer('account', e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                        placeholder="account-name"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="block text-xs font-medium leading-4 text-gray-900">
                          Database
                        </label>
                        <span className="text-xs leading-4 text-gray-500">Required</span>
                      </div>
                      <input
                        type="text"
                        value={server.database || ''}
                        onChange={(e) => updateServer('database', e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                        placeholder="MY_DATABASE"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="block text-xs font-medium leading-4 text-gray-900">
                          Schema
                        </label>
                        <span className="text-xs leading-4 text-gray-500">Required</span>
                      </div>
                      <input
                        type="text"
                        value={server.schema || ''}
                        onChange={(e) => updateServer('schema', e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                        placeholder="MY_SCHEMA"
                      />
                    </div>
                  </>
                )}

                {server.type === 'postgres' && (
                  <>
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="block text-xs font-medium leading-4 text-gray-900">
                          Host
                        </label>
                        <span className="text-xs leading-4 text-gray-500">Required</span>
                      </div>
                      <input
                        type="text"
                        value={server.host || ''}
                        onChange={(e) => updateServer('host', e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                        placeholder="localhost"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="block text-xs font-medium leading-4 text-gray-900">
                          Port
                        </label>
                        <span className="text-xs leading-4 text-gray-500">Required</span>
                      </div>
                      <input
                        type="number"
                        value={server.port || ''}
                        onChange={(e) => updateServer('port', parseInt(e.target.value) || undefined)}
                        className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                        placeholder="5432"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="block text-xs font-medium leading-4 text-gray-900">
                          Database
                        </label>
                        <span className="text-xs leading-4 text-gray-500">Required</span>
                      </div>
                      <input
                        type="text"
                        value={server.database || ''}
                        onChange={(e) => updateServer('database', e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                        placeholder="mydb"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="block text-xs font-medium leading-4 text-gray-900">
                          Schema
                        </label>
                        <span className="text-xs leading-4 text-gray-500">Required</span>
                      </div>
                      <input
                        type="text"
                        value={server.schema || ''}
                        onChange={(e) => updateServer('schema', e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                        placeholder="public"
                      />
                    </div>
                  </>
                )}

                {server.type === 's3' && (
                  <>
                    <div className="sm:col-span-2">
                      <div className="flex justify-between mb-1">
                        <label className="block text-xs font-medium leading-4 text-gray-900">
                          Location
                        </label>
                        <span className="text-xs leading-4 text-gray-500">Required</span>
                      </div>
                      <input
                        type="text"
                        value={server.location || ''}
                        onChange={(e) => updateServer('location', e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                        placeholder="s3://bucket-name/path"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium leading-4 text-gray-900 mb-1">
                        Format
                      </label>
                      <input
                        type="text"
                        value={server.format || ''}
                        onChange={(e) => updateServer('format', e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                        placeholder="parquet"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium leading-4 text-gray-900 mb-1">
                        Delimiter
                      </label>
                      <input
                        type="text"
                        value={server.delimiter || ''}
                        onChange={(e) => updateServer('delimiter', e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                        placeholder=","
                      />
                    </div>
                  </>
                )}

                {server.type === 'redshift' && (
                  <>
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="block text-xs font-medium leading-4 text-gray-900">
                          Database
                        </label>
                        <span className="text-xs leading-4 text-gray-500">Required</span>
                      </div>
                      <input
                        type="text"
                        value={server.database || ''}
                        onChange={(e) => updateServer('database', e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                        placeholder="mydb"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="block text-xs font-medium leading-4 text-gray-900">
                          Schema
                        </label>
                        <span className="text-xs leading-4 text-gray-500">Required</span>
                      </div>
                      <input
                        type="text"
                        value={server.schema || ''}
                        onChange={(e) => updateServer('schema', e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                        placeholder="public"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium leading-4 text-gray-900 mb-1">
                        Host
                      </label>
                      <input
                        type="text"
                        value={server.host || ''}
                        onChange={(e) => updateServer('host', e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                        placeholder="cluster.region.redshift.amazonaws.com"
                      />
                    </div>
                  </>
                )}

                {server.type === 'databricks' && (
                  <>
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="block text-xs font-medium leading-4 text-gray-900">
                          Catalog
                        </label>
                        <span className="text-xs leading-4 text-gray-500">Required</span>
                      </div>
                      <input
                        type="text"
                        value={server.catalog || ''}
                        onChange={(e) => updateServer('catalog', e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                        placeholder="hive_metastore"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="block text-xs font-medium leading-4 text-gray-900">
                          Schema
                        </label>
                        <span className="text-xs leading-4 text-gray-500">Required</span>
                      </div>
                      <input
                        type="text"
                        value={server.schema || ''}
                        onChange={(e) => updateServer('schema', e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                        placeholder="default"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium leading-4 text-gray-900 mb-1">
                        Host
                      </label>
                      <input
                        type="text"
                        value={server.host || ''}
                        onChange={(e) => updateServer('host', e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                        placeholder="workspace.databricks.com"
                      />
                    </div>
                  </>
                )}

                {server.type === 'azure' && (
                  <>
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="block text-xs font-medium leading-4 text-gray-900">
                          Location
                        </label>
                        <span className="text-xs leading-4 text-gray-500">Required</span>
                      </div>
                      <input
                        type="text"
                        value={server.location || ''}
                        onChange={(e) => updateServer('location', e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                        placeholder="abfss://container@storage.dfs.core.windows.net/path"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="block text-xs font-medium leading-4 text-gray-900">
                          Format
                        </label>
                        <span className="text-xs leading-4 text-gray-500">Required</span>
                      </div>
                      <input
                        type="text"
                        value={server.format || ''}
                        onChange={(e) => updateServer('format', e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                        placeholder="parquet"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium leading-4 text-gray-900 mb-1">
                        Delimiter
                      </label>
                      <input
                        type="text"
                        value={server.delimiter || ''}
                        onChange={(e) => updateServer('delimiter', e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                        placeholder=","
                      />
                    </div>
                  </>
                )}

                {server.type === 'glue' && (
                  <>
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="block text-xs font-medium leading-4 text-gray-900">
                          Account
                        </label>
                        <span className="text-xs leading-4 text-gray-500">Required</span>
                      </div>
                      <input
                        type="text"
                        value={server.account || ''}
                        onChange={(e) => updateServer('account', e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                        placeholder="123456789012"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="block text-xs font-medium leading-4 text-gray-900">
                          Database
                        </label>
                        <span className="text-xs leading-4 text-gray-500">Required</span>
                      </div>
                      <input
                        type="text"
                        value={server.database || ''}
                        onChange={(e) => updateServer('database', e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                        placeholder="my_database"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium leading-4 text-gray-900 mb-1">
                        Location
                      </label>
                      <input
                        type="text"
                        value={server.location || ''}
                        onChange={(e) => updateServer('location', e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                        placeholder="s3://bucket-name/path"
                      />
                    </div>
                  </>
                )}

                {server.type === 'athena' && (
                  <>
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="block text-xs font-medium leading-4 text-gray-900">
                          Staging Dir
                        </label>
                        <span className="text-xs leading-4 text-gray-500">Required</span>
                      </div>
                      <input
                        type="text"
                        value={server.stagingDir || ''}
                        onChange={(e) => updateServer('stagingDir', e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                        placeholder="s3://bucket/athena-results/"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="block text-xs font-medium leading-4 text-gray-900">
                          Schema
                        </label>
                        <span className="text-xs leading-4 text-gray-500">Required</span>
                      </div>
                      <input
                        type="text"
                        value={server.schema || ''}
                        onChange={(e) => updateServer('schema', e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                        placeholder="default"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium leading-4 text-gray-900 mb-1">
                        Catalog
                      </label>
                      <input
                        type="text"
                        value={server.catalog || ''}
                        onChange={(e) => updateServer('catalog', e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                        placeholder="AwsDataCatalog"
                      />
                    </div>
                  </>
                )}

                {server.type === 'kafka' && (
                  <>
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="block text-xs font-medium leading-4 text-gray-900">
                          Host
                        </label>
                        <span className="text-xs leading-4 text-gray-500">Required</span>
                      </div>
                      <input
                        type="text"
                        value={server.host || ''}
                        onChange={(e) => updateServer('host', e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                        placeholder="broker:9092"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium leading-4 text-gray-900 mb-1">
                        Format
                      </label>
                      <input
                        type="text"
                        value={server.format || ''}
                        onChange={(e) => updateServer('format', e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                        placeholder="json"
                      />
                    </div>
                  </>
                )}

                {server.type === 'synapse' && (
                  <>
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="block text-xs font-medium leading-4 text-gray-900">
                          Host
                        </label>
                        <span className="text-xs leading-4 text-gray-500">Required</span>
                      </div>
                      <input
                        type="text"
                        value={server.host || ''}
                        onChange={(e) => updateServer('host', e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                        placeholder="workspace.sql.azuresynapse.net"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="block text-xs font-medium leading-4 text-gray-900">
                          Port
                        </label>
                        <span className="text-xs leading-4 text-gray-500">Required</span>
                      </div>
                      <input
                        type="number"
                        value={server.port || ''}
                        onChange={(e) => updateServer('port', parseInt(e.target.value) || undefined)}
                        className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                        placeholder="1433"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="block text-xs font-medium leading-4 text-gray-900">
                          Database
                        </label>
                        <span className="text-xs leading-4 text-gray-500">Required</span>
                      </div>
                      <input
                        type="text"
                        value={server.database || ''}
                        onChange={(e) => updateServer('database', e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                        placeholder="mydb"
                      />
                    </div>
                  </>
                )}

                {server.type === 'api' && (
                  <>
                    <div className="sm:col-span-2">
                      <div className="flex justify-between mb-1">
                        <label className="block text-xs font-medium leading-4 text-gray-900">
                          Location
                        </label>
                        <span className="text-xs leading-4 text-gray-500">Required</span>
                      </div>
                      <input
                        type="text"
                        value={server.location || ''}
                        onChange={(e) => updateServer('location', e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                        placeholder="https://api.example.com/v1"
                      />
                    </div>
                  </>
                )}

                {server.type === 'clickhouse' && (
                  <>
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="block text-xs font-medium leading-4 text-gray-900">
                          Host
                        </label>
                        <span className="text-xs leading-4 text-gray-500">Required</span>
                      </div>
                      <input
                        type="text"
                        value={server.host || ''}
                        onChange={(e) => updateServer('host', e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                        placeholder="localhost"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="block text-xs font-medium leading-4 text-gray-900">
                          Port
                        </label>
                        <span className="text-xs leading-4 text-gray-500">Required</span>
                      </div>
                      <input
                        type="number"
                        value={server.port || ''}
                        onChange={(e) => updateServer('port', parseInt(e.target.value) || undefined)}
                        className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                        placeholder="9000"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="block text-xs font-medium leading-4 text-gray-900">
                          Database
                        </label>
                        <span className="text-xs leading-4 text-gray-500">Required</span>
                      </div>
                      <input
                        type="text"
                        value={server.database || ''}
                        onChange={(e) => updateServer('database', e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                        placeholder="default"
                      />
                    </div>
                  </>
                )}

                {server.type === 'cloudsql' && (
                  <>
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="block text-xs font-medium leading-4 text-gray-900">
                          Host
                        </label>
                        <span className="text-xs leading-4 text-gray-500">Required</span>
                      </div>
                      <input
                        type="text"
                        value={server.host || ''}
                        onChange={(e) => updateServer('host', e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                        placeholder="localhost"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="block text-xs font-medium leading-4 text-gray-900">
                          Port
                        </label>
                        <span className="text-xs leading-4 text-gray-500">Required</span>
                      </div>
                      <input
                        type="number"
                        value={server.port || ''}
                        onChange={(e) => updateServer('port', parseInt(e.target.value) || undefined)}
                        className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                        placeholder="3306"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="block text-xs font-medium leading-4 text-gray-900">
                          Database
                        </label>
                        <span className="text-xs leading-4 text-gray-500">Required</span>
                      </div>
                      <input
                        type="text"
                        value={server.database || ''}
                        onChange={(e) => updateServer('database', e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                        placeholder="mydb"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="block text-xs font-medium leading-4 text-gray-900">
                          Schema
                        </label>
                        <span className="text-xs leading-4 text-gray-500">Required</span>
                      </div>
                      <input
                        type="text"
                        value={server.schema || ''}
                        onChange={(e) => updateServer('schema', e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                        placeholder="public"
                      />
                    </div>
                  </>
                )}

                {server.type === 'db2' && (
                  <>
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="block text-xs font-medium leading-4 text-gray-900">
                          Host
                        </label>
                        <span className="text-xs leading-4 text-gray-500">Required</span>
                      </div>
                      <input
                        type="text"
                        value={server.host || ''}
                        onChange={(e) => updateServer('host', e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                        placeholder="localhost"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="block text-xs font-medium leading-4 text-gray-900">
                          Port
                        </label>
                        <span className="text-xs leading-4 text-gray-500">Required</span>
                      </div>
                      <input
                        type="number"
                        value={server.port || ''}
                        onChange={(e) => updateServer('port', parseInt(e.target.value) || undefined)}
                        className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                        placeholder="50000"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="block text-xs font-medium leading-4 text-gray-900">
                          Database
                        </label>
                        <span className="text-xs leading-4 text-gray-500">Required</span>
                      </div>
                      <input
                        type="text"
                        value={server.database || ''}
                        onChange={(e) => updateServer('database', e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                        placeholder="mydb"
                      />
                    </div>
                  </>
                )}

                {server.type === 'denodo' && (
                  <>
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="block text-xs font-medium leading-4 text-gray-900">
                          Host
                        </label>
                        <span className="text-xs leading-4 text-gray-500">Required</span>
                      </div>
                      <input
                        type="text"
                        value={server.host || ''}
                        onChange={(e) => updateServer('host', e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                        placeholder="localhost"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="block text-xs font-medium leading-4 text-gray-900">
                          Port
                        </label>
                        <span className="text-xs leading-4 text-gray-500">Required</span>
                      </div>
                      <input
                        type="number"
                        value={server.port || ''}
                        onChange={(e) => updateServer('port', parseInt(e.target.value) || undefined)}
                        className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                        placeholder="9999"
                      />
                    </div>
                  </>
                )}

                {server.type === 'dremio' && (
                  <>
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="block text-xs font-medium leading-4 text-gray-900">
                          Host
                        </label>
                        <span className="text-xs leading-4 text-gray-500">Required</span>
                      </div>
                      <input
                        type="text"
                        value={server.host || ''}
                        onChange={(e) => updateServer('host', e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                        placeholder="localhost"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="block text-xs font-medium leading-4 text-gray-900">
                          Port
                        </label>
                        <span className="text-xs leading-4 text-gray-500">Required</span>
                      </div>
                      <input
                        type="number"
                        value={server.port || ''}
                        onChange={(e) => updateServer('port', parseInt(e.target.value) || undefined)}
                        className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                        placeholder="31010"
                      />
                    </div>
                  </>
                )}

                {server.type === 'duckdb' && (
                  <>
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="block text-xs font-medium leading-4 text-gray-900">
                          Database
                        </label>
                        <span className="text-xs leading-4 text-gray-500">Required</span>
                      </div>
                      <input
                        type="text"
                        value={server.database || ''}
                        onChange={(e) => updateServer('database', e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                        placeholder="/path/to/database.duckdb"
                      />
                    </div>
                  </>
                )}

                {server.type === 'informix' && (
                  <>
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="block text-xs font-medium leading-4 text-gray-900">
                          Host
                        </label>
                        <span className="text-xs leading-4 text-gray-500">Required</span>
                      </div>
                      <input
                        type="text"
                        value={server.host || ''}
                        onChange={(e) => updateServer('host', e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                        placeholder="localhost"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="block text-xs font-medium leading-4 text-gray-900">
                          Database
                        </label>
                        <span className="text-xs leading-4 text-gray-500">Required</span>
                      </div>
                      <input
                        type="text"
                        value={server.database || ''}
                        onChange={(e) => updateServer('database', e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                        placeholder="mydb"
                      />
                    </div>
                  </>
                )}

                {server.type === 'kinesis' && (
                  <>
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="block text-xs font-medium leading-4 text-gray-900">
                          Stream
                        </label>
                        <span className="text-xs leading-4 text-gray-500">Required</span>
                      </div>
                      <input
                        type="text"
                        value={server.stream || ''}
                        onChange={(e) => updateServer('stream', e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                        placeholder="my-stream"
                      />
                    </div>
                  </>
                )}

                {server.type === 'local' && (
                  <>
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="block text-xs font-medium leading-4 text-gray-900">
                          Path
                        </label>
                        <span className="text-xs leading-4 text-gray-500">Required</span>
                      </div>
                      <input
                        type="text"
                        value={server.path || ''}
                        onChange={(e) => updateServer('path', e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                        placeholder="/path/to/data"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="block text-xs font-medium leading-4 text-gray-900">
                          Format
                        </label>
                        <span className="text-xs leading-4 text-gray-500">Required</span>
                      </div>
                      <input
                        type="text"
                        value={server.format || ''}
                        onChange={(e) => updateServer('format', e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                        placeholder="csv"
                      />
                    </div>
                  </>
                )}

                {server.type === 'mysql' && (
                  <>
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="block text-xs font-medium leading-4 text-gray-900">
                          Host
                        </label>
                        <span className="text-xs leading-4 text-gray-500">Required</span>
                      </div>
                      <input
                        type="text"
                        value={server.host || ''}
                        onChange={(e) => updateServer('host', e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                        placeholder="localhost"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="block text-xs font-medium leading-4 text-gray-900">
                          Database
                        </label>
                        <span className="text-xs leading-4 text-gray-500">Required</span>
                      </div>
                      <input
                        type="text"
                        value={server.database || ''}
                        onChange={(e) => updateServer('database', e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                        placeholder="mydb"
                      />
                    </div>
                  </>
                )}

                {server.type === 'oracle' && (
                  <>
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="block text-xs font-medium leading-4 text-gray-900">
                          Host
                        </label>
                        <span className="text-xs leading-4 text-gray-500">Required</span>
                      </div>
                      <input
                        type="text"
                        value={server.host || ''}
                        onChange={(e) => updateServer('host', e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                        placeholder="localhost"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="block text-xs font-medium leading-4 text-gray-900">
                          Port
                        </label>
                        <span className="text-xs leading-4 text-gray-500">Required</span>
                      </div>
                      <input
                        type="number"
                        value={server.port || ''}
                        onChange={(e) => updateServer('port', parseInt(e.target.value) || undefined)}
                        className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                        placeholder="1521"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="block text-xs font-medium leading-4 text-gray-900">
                          Service Name
                        </label>
                        <span className="text-xs leading-4 text-gray-500">Required</span>
                      </div>
                      <input
                        type="text"
                        value={server.serviceName || ''}
                        onChange={(e) => updateServer('serviceName', e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                        placeholder="ORCL"
                      />
                    </div>
                  </>
                )}

                {server.type === 'postgresql' && (
                  <>
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="block text-xs font-medium leading-4 text-gray-900">
                          Host
                        </label>
                        <span className="text-xs leading-4 text-gray-500">Required</span>
                      </div>
                      <input
                        type="text"
                        value={server.host || ''}
                        onChange={(e) => updateServer('host', e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                        placeholder="localhost"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="block text-xs font-medium leading-4 text-gray-900">
                          Database
                        </label>
                        <span className="text-xs leading-4 text-gray-500">Required</span>
                      </div>
                      <input
                        type="text"
                        value={server.database || ''}
                        onChange={(e) => updateServer('database', e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                        placeholder="mydb"
                      />
                    </div>
                  </>
                )}

                {server.type === 'presto' && (
                  <>
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="block text-xs font-medium leading-4 text-gray-900">
                          Host
                        </label>
                        <span className="text-xs leading-4 text-gray-500">Required</span>
                      </div>
                      <input
                        type="text"
                        value={server.host || ''}
                        onChange={(e) => updateServer('host', e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                        placeholder="localhost"
                      />
                    </div>
                  </>
                )}

                {server.type === 'pubsub' && (
                  <>
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="block text-xs font-medium leading-4 text-gray-900">
                          Project
                        </label>
                        <span className="text-xs leading-4 text-gray-500">Required</span>
                      </div>
                      <input
                        type="text"
                        value={server.project || ''}
                        onChange={(e) => updateServer('project', e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                        placeholder="my-project"
                      />
                    </div>
                  </>
                )}

                {server.type === 'sftp' && (
                  <>
                    <div className="sm:col-span-2">
                      <div className="flex justify-between mb-1">
                        <label className="block text-xs font-medium leading-4 text-gray-900">
                          Location
                        </label>
                        <span className="text-xs leading-4 text-gray-500">Required</span>
                      </div>
                      <input
                        type="text"
                        value={server.location || ''}
                        onChange={(e) => updateServer('location', e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                        placeholder="sftp://host/path/to/file"
                      />
                    </div>
                  </>
                )}

                {server.type === 'trino' && (
                  <>
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="block text-xs font-medium leading-4 text-gray-900">
                          Host
                        </label>
                        <span className="text-xs leading-4 text-gray-500">Required</span>
                      </div>
                      <input
                        type="text"
                        value={server.host || ''}
                        onChange={(e) => updateServer('host', e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                        placeholder="localhost"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="block text-xs font-medium leading-4 text-gray-900">
                          Port
                        </label>
                        <span className="text-xs leading-4 text-gray-500">Required</span>
                      </div>
                      <input
                        type="number"
                        value={server.port || ''}
                        onChange={(e) => updateServer('port', parseInt(e.target.value) || undefined)}
                        className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                        placeholder="8080"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="block text-xs font-medium leading-4 text-gray-900">
                          Catalog
                        </label>
                        <span className="text-xs leading-4 text-gray-500">Required</span>
                      </div>
                      <input
                        type="text"
                        value={server.catalog || ''}
                        onChange={(e) => updateServer('catalog', e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                        placeholder="hive"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="block text-xs font-medium leading-4 text-gray-900">
                          Schema
                        </label>
                        <span className="text-xs leading-4 text-gray-500">Required</span>
                      </div>
                      <input
                        type="text"
                        value={server.schema || ''}
                        onChange={(e) => updateServer('schema', e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                        placeholder="default"
                      />
                    </div>
                  </>
                )}

                {server.type === 'vertica' && (
                  <>
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="block text-xs font-medium leading-4 text-gray-900">
                          Host
                        </label>
                        <span className="text-xs leading-4 text-gray-500">Required</span>
                      </div>
                      <input
                        type="text"
                        value={server.host || ''}
                        onChange={(e) => updateServer('host', e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                        placeholder="localhost"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="block text-xs font-medium leading-4 text-gray-900">
                          Port
                        </label>
                        <span className="text-xs leading-4 text-gray-500">Required</span>
                      </div>
                      <input
                        type="number"
                        value={server.port || ''}
                        onChange={(e) => updateServer('port', parseInt(e.target.value) || undefined)}
                        className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                        placeholder="5433"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="block text-xs font-medium leading-4 text-gray-900">
                          Database
                        </label>
                        <span className="text-xs leading-4 text-gray-500">Required</span>
                      </div>
                      <input
                        type="text"
                        value={server.database || ''}
                        onChange={(e) => updateServer('database', e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                        placeholder="mydb"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="block text-xs font-medium leading-4 text-gray-900">
                          Schema
                        </label>
                        <span className="text-xs leading-4 text-gray-500">Required</span>
                      </div>
                      <input
                        type="text"
                        value={server.schema || ''}
                        onChange={(e) => updateServer('schema', e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                        placeholder="public"
                      />
                    </div>
                  </>
                )}

                {/* Roles */}
                <div className="sm:col-span-2">
                  <RolesList
                    roles={server.roles || []}
                    onUpdate={(roles) => updateServer('roles', roles.length > 0 ? roles : undefined)}
                    serverName={server.server}
                  />
                </div>

                {/* Custom Properties */}
                <div className="sm:col-span-2">
                  <CustomPropertiesEditor
                    value={server.customProperties || []}
                    onChange={(customProperties) => updateServer('customProperties', customProperties)}
                    showDescription={true}
                    helpText="Add custom key-value properties for server-specific metadata"
                  />
                </div>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServerEditor;
