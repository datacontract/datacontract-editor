import { useMemo } from 'react';
import { useEditorStore } from '../../store.js';
import { Combobox, Tooltip } from '../ui/index.js';
import ValidatedInput from '../ui/ValidatedInput.jsx';
import ValidatedCombobox from '../ui/ValidatedCombobox.jsx';
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

      // If type is being changed, preserve server-level properties and reset type-specific fields
      if (field === 'type') {
        const currentServer = parsed.servers[serverIndex];

        // Server-level properties to preserve (common to all server types)
        const serverLevelProps = {
          server: currentServer.server,
          environment: currentServer.environment,
          description: currentServer.description,
          roles: currentServer.roles,
          type: value || undefined
        };

        // Remove undefined values
        Object.keys(serverLevelProps).forEach(key => {
          if (serverLevelProps[key] === undefined) {
            delete serverLevelProps[key];
          }
        });

        parsed.servers[serverIndex] = serverLevelProps;
      } else {
        parsed.servers[serverIndex] = {
          ...parsed.servers[serverIndex],
          [field]: value || undefined
        };
      }

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
                onClick={() => {
                  if (window.confirm('Are you sure you want to remove this server?')) {
                    removeServer();
                  }
                }}
                className="p-1 text-gray-400 cursor-pointer border border-gray-300 rounded hover:text-red-400 hover:border-red-400 transition-colors"
                title="Remove Server"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
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
                          <QuestionMarkCircleIcon />
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
                      <QuestionMarkCircleIcon />
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
                  <ValidatedCombobox
                    label="Type"
                    tooltip="Platform category (api, athena, bigquery, snowflake, postgres, etc.)"
                    required={true}
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
                      <ValidatedInput
												label={
													<label className="block text-xs font-medium leading-4 text-gray-900">
														Project
													</label>
												}
												required={true}
                        type="text"
                        value={server.project || ''}
                        onChange={(e) => updateServer('project', e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                        placeholder="my-project"
                      />
                    </div>
                    <div>
                      <ValidatedInput
												required={true}
												label={
													<label className="block text-xs font-medium leading-4 text-gray-900">
														Dataset
													</label>
												}
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
                      <ValidatedInput
												required={true}
												label={
													<label className="block text-xs font-medium leading-4 text-gray-900">
														Account
													</label>
												}
                        type="text"
                        value={server.account || ''}
                        onChange={(e) => updateServer('account', e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                        placeholder="account-name"
                      />
                    </div>
                    <div>
                      <ValidatedInput
												label={
													<label className="block text-xs font-medium leading-4 text-gray-900">
														Database
													</label>
												}
												required={true}
                        type="text"
                        value={server.database || ''}
                        onChange={(e) => updateServer('database', e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                        placeholder="MY_DATABASE"
                      />
                    </div>
                    <div>
                      <ValidatedInput
												label={
													<label className="block text-xs font-medium leading-4 text-gray-900">
														Project
													</label>
												}
												required={true}
                        type="text"
                        value={server.schema || ''}
                        onChange={(e) => updateServer('schema', e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                        placeholder="MY_SCHEMA"
                      />
                    </div>
                  </>
                )}

                {(server.type === 'postgres' || server.type === 'postgresql') && (
                  <>
                    <ValidatedInput
                      name="host"
                      label="Host"
                      value={server.host || ''}
                      onChange={(e) => updateServer('host', e.target.value)}
                      required={true}
                      placeholder="localhost"
                    />
                    <ValidatedInput
                      name="port"
                      label="Port"
                      type="number"
                      value={server.port || ''}
                      onChange={(e) => updateServer('port', parseInt(e.target.value) || undefined)}
                      required={true}
                      placeholder="5432"
                    />
                    <ValidatedInput
                      name="database"
                      label="Database"
                      value={server.database || ''}
                      onChange={(e) => updateServer('database', e.target.value)}
                      required={true}
                      placeholder="mydb"
                    />
                    <ValidatedInput
                      name="schema"
                      label="Schema"
                      value={server.schema || ''}
                      onChange={(e) => updateServer('schema', e.target.value)}
                      required={true}
                      placeholder="public"
                    />
                  </>
                )}

                {server.type === 's3' && (
                  <>
                    <div className="sm:col-span-2">
                      <ValidatedInput
                        name="location"
                        label="Location"
                        value={server.location || ''}
                        onChange={(e) => updateServer('location', e.target.value)}
                        required={true}
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
                    <ValidatedInput
                      name="database"
                      label="Database"
                      value={server.database || ''}
                      onChange={(e) => updateServer('database', e.target.value)}
                      required={true}
                      placeholder="mydb"
                    />
                    <ValidatedInput
                      name="schema"
                      label="Schema"
                      value={server.schema || ''}
                      onChange={(e) => updateServer('schema', e.target.value)}
                      required={true}
                      placeholder="public"
                    />
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
                    <ValidatedInput
                      name="catalog"
                      label="Catalog"
                      value={server.catalog || ''}
                      onChange={(e) => updateServer('catalog', e.target.value)}
                      required={true}
                      placeholder="hive_metastore"
                    />
                    <ValidatedInput
                      name="schema"
                      label="Schema"
                      value={server.schema || ''}
                      onChange={(e) => updateServer('schema', e.target.value)}
                      required={true}
                      placeholder="default"
                    />
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
                    <ValidatedInput
                      name="location"
                      label="Location"
                      value={server.location || ''}
                      onChange={(e) => updateServer('location', e.target.value)}
                      required={true}
                      placeholder="abfss://container@storage.dfs.core.windows.net/path"
                    />
                    <ValidatedInput
                      name="format"
                      label="Format"
                      value={server.format || ''}
                      onChange={(e) => updateServer('format', e.target.value)}
                      required={true}
                      placeholder="parquet"
                    />
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
                    <ValidatedInput
                      name="account"
                      label="Account"
                      value={server.account || ''}
                      onChange={(e) => updateServer('account', e.target.value)}
                      required={true}
                      placeholder="123456789012"
                    />
                    <ValidatedInput
                      name="database"
                      label="Database"
                      value={server.database || ''}
                      onChange={(e) => updateServer('database', e.target.value)}
                      required={true}
                      placeholder="my_database"
                    />
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
                    <ValidatedInput
                      name="stagingDir"
                      label="Staging Dir"
                      value={server.stagingDir || ''}
                      onChange={(e) => updateServer('stagingDir', e.target.value)}
                      required={true}
                      placeholder="s3://bucket/athena-results/"
                    />
                    <ValidatedInput
                      name="schema"
                      label="Schema"
                      value={server.schema || ''}
                      onChange={(e) => updateServer('schema', e.target.value)}
                      required={true}
                      placeholder="default"
                    />
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
                    <ValidatedInput
                      name="host"
                      label="Host"
                      value={server.host || ''}
                      onChange={(e) => updateServer('host', e.target.value)}
                      required={true}
                      placeholder="broker:9092"
                    />
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
                    <ValidatedInput
                      name="host"
                      label="Host"
                      value={server.host || ''}
                      onChange={(e) => updateServer('host', e.target.value)}
                      required={true}
                      placeholder="workspace.sql.azuresynapse.net"
                    />
                    <ValidatedInput
                      name="port"
                      label="Port"
                      type="number"
                      value={server.port || ''}
                      onChange={(e) => updateServer('port', parseInt(e.target.value) || undefined)}
                      required={true}
                      placeholder="1433"
                    />
                    <ValidatedInput
                      name="database"
                      label="Database"
                      value={server.database || ''}
                      onChange={(e) => updateServer('database', e.target.value)}
                      required={true}
                      placeholder="mydb"
                    />
                  </>
                )}

                {server.type === 'api' && (
                  <>
                    <div className="sm:col-span-2">
                      <ValidatedInput
                        name="location"
                        label="Location"
                        value={server.location || ''}
                        onChange={(e) => updateServer('location', e.target.value)}
                        required={true}
                        placeholder="https://api.example.com/v1"
                      />
                    </div>
                  </>
                )}

                {server.type === 'clickhouse' && (
                  <>
                    <ValidatedInput
                      name="host"
                      label="Host"
                      value={server.host || ''}
                      onChange={(e) => updateServer('host', e.target.value)}
                      required={true}
                      placeholder="localhost"
                    />
                    <ValidatedInput
                      name="port"
                      label="Port"
                      type="number"
                      value={server.port || ''}
                      onChange={(e) => updateServer('port', parseInt(e.target.value) || undefined)}
                      required={true}
                      placeholder="9000"
                    />
                    <ValidatedInput
                      name="database"
                      label="Database"
                      value={server.database || ''}
                      onChange={(e) => updateServer('database', e.target.value)}
                      required={true}
                      placeholder="default"
                    />
                  </>
                )}

                {server.type === 'cloudsql' && (
                  <>
                    <ValidatedInput
                      name="host"
                      label="Host"
                      value={server.host || ''}
                      onChange={(e) => updateServer('host', e.target.value)}
                      required={true}
                      placeholder="localhost"
                    />
                    <ValidatedInput
                      name="port"
                      label="Port"
                      type="number"
                      value={server.port || ''}
                      onChange={(e) => updateServer('port', parseInt(e.target.value) || undefined)}
                      required={true}
                      placeholder="3306"
                    />
                    <ValidatedInput
                      name="database"
                      label="Database"
                      value={server.database || ''}
                      onChange={(e) => updateServer('database', e.target.value)}
                      required={true}
                      placeholder="mydb"
                    />
                    <ValidatedInput
                      name="schema"
                      label="Schema"
                      value={server.schema || ''}
                      onChange={(e) => updateServer('schema', e.target.value)}
                      required={true}
                      placeholder="public"
                    />
                  </>
                )}

                {server.type === 'db2' && (
                  <>
                    <ValidatedInput
                      name="host"
                      label="Host"
                      value={server.host || ''}
                      onChange={(e) => updateServer('host', e.target.value)}
                      required={true}
                      placeholder="localhost"
                    />
                    <ValidatedInput
                      name="port"
                      label="Port"
                      type="number"
                      value={server.port || ''}
                      onChange={(e) => updateServer('port', parseInt(e.target.value) || undefined)}
                      required={true}
                      placeholder="50000"
                    />
                    <ValidatedInput
                      name="database"
                      label="Database"
                      value={server.database || ''}
                      onChange={(e) => updateServer('database', e.target.value)}
                      required={true}
                      placeholder="mydb"
                    />
                  </>
                )}

                {server.type === 'denodo' && (
                  <>
                    <ValidatedInput
                      name="host"
                      label="Host"
                      value={server.host || ''}
                      onChange={(e) => updateServer('host', e.target.value)}
                      required={true}
                      placeholder="localhost"
                    />
                    <ValidatedInput
                      name="port"
                      label="Port"
                      type="number"
                      value={server.port || ''}
                      onChange={(e) => updateServer('port', parseInt(e.target.value) || undefined)}
                      required={true}
                      placeholder="9999"
                    />
                  </>
                )}

                {server.type === 'dremio' && (
                  <>
                    <ValidatedInput
                      name="host"
                      label="Host"
                      value={server.host || ''}
                      onChange={(e) => updateServer('host', e.target.value)}
                      required={true}
                      placeholder="localhost"
                    />
                    <ValidatedInput
                      name="port"
                      label="Port"
                      type="number"
                      value={server.port || ''}
                      onChange={(e) => updateServer('port', parseInt(e.target.value) || undefined)}
                      required={true}
                      placeholder="31010"
                    />
                  </>
                )}

                {server.type === 'duckdb' && (
                  <>
                    <ValidatedInput
                      name="database"
                      label="Database"
                      value={server.database || ''}
                      onChange={(e) => updateServer('database', e.target.value)}
                      required={true}
                      placeholder="/path/to/database.duckdb"
                    />
                  </>
                )}

                {server.type === 'informix' && (
                  <>
                    <ValidatedInput
                      name="host"
                      label="Host"
                      value={server.host || ''}
                      onChange={(e) => updateServer('host', e.target.value)}
                      required={true}
                      placeholder="localhost"
                    />
                    <ValidatedInput
                      name="database"
                      label="Database"
                      value={server.database || ''}
                      onChange={(e) => updateServer('database', e.target.value)}
                      required={true}
                      placeholder="mydb"
                    />
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
                    <ValidatedInput
                      name="path"
                      label="Path"
                      value={server.path || ''}
                      onChange={(e) => updateServer('path', e.target.value)}
                      required={true}
                      placeholder="/path/to/data"
                    />
                    <ValidatedInput
                      name="format"
                      label="Format"
                      value={server.format || ''}
                      onChange={(e) => updateServer('format', e.target.value)}
                      required={true}
                      placeholder="csv"
                    />
                  </>
                )}

                {server.type === 'mysql' && (
                  <>
                    <ValidatedInput
                      name="host"
                      label="Host"
                      value={server.host || ''}
                      onChange={(e) => updateServer('host', e.target.value)}
                      required={true}
                      placeholder="localhost"
                    />
                    <ValidatedInput
                      name="port"
                      label="Port"
                      type="number"
                      value={server.port || ''}
                      onChange={(e) => updateServer('port', parseInt(e.target.value) || undefined)}
                      required={true}
                      placeholder="3306"
                    />
                    <ValidatedInput
                      name="database"
                      label="Database"
                      value={server.database || ''}
                      onChange={(e) => updateServer('database', e.target.value)}
                      required={true}
                      placeholder="mydb"
                    />
                  </>
                )}

                {server.type === 'oracle' && (
                  <>
                    <ValidatedInput
                      name="host"
                      label="Host"
                      value={server.host || ''}
                      onChange={(e) => updateServer('host', e.target.value)}
                      required={true}
                      placeholder="localhost"
                    />
                    <ValidatedInput
                      name="port"
                      label="Port"
                      type="number"
                      value={server.port || ''}
                      onChange={(e) => updateServer('port', parseInt(e.target.value) || undefined)}
                      required={true}
                      placeholder="1521"
                    />
                    <ValidatedInput
                      name="serviceName"
                      label="Service Name"
                      value={server.serviceName || ''}
                      onChange={(e) => updateServer('serviceName', e.target.value)}
                      required={true}
                      placeholder="ORCL"
                    />
                  </>
                )}


                {server.type === 'presto' && (
                  <>
                    <ValidatedInput
                      name="host"
                      label="Host"
                      value={server.host || ''}
                      onChange={(e) => updateServer('host', e.target.value)}
                      required={true}
                      placeholder="localhost"
                    />
                  </>
                )}

                {server.type === 'pubsub' && (
                  <>
                    <ValidatedInput
                      name="project"
                      label="Project"
                      value={server.project || ''}
                      onChange={(e) => updateServer('project', e.target.value)}
                      required={true}
                      placeholder="my-project"
                    />
                  </>
                )}

                {server.type === 'sftp' && (
                  <>
                    <div className="sm:col-span-2">
                      <ValidatedInput
                        name="location"
                        label="Location"
                        value={server.location || ''}
                        onChange={(e) => updateServer('location', e.target.value)}
                        required={true}
                        placeholder="sftp://host/path/to/file"
                      />
                    </div>
                  </>
                )}

                {server.type === 'trino' && (
                  <>
                    <ValidatedInput
                      name="host"
                      label="Host"
                      value={server.host || ''}
                      onChange={(e) => updateServer('host', e.target.value)}
                      required={true}
                      placeholder="localhost"
                    />
                    <ValidatedInput
                      name="port"
                      label="Port"
                      type="number"
                      value={server.port || ''}
                      onChange={(e) => updateServer('port', parseInt(e.target.value) || undefined)}
                      required={true}
                      placeholder="8080"
                    />
                    <ValidatedInput
                      name="catalog"
                      label="Catalog"
                      value={server.catalog || ''}
                      onChange={(e) => updateServer('catalog', e.target.value)}
                      required={true}
                      placeholder="hive"
                    />
                    <ValidatedInput
                      name="schema"
                      label="Schema"
                      value={server.schema || ''}
                      onChange={(e) => updateServer('schema', e.target.value)}
                      required={true}
                      placeholder="default"
                    />
                  </>
                )}

                {server.type === 'vertica' && (
                  <>
                    <ValidatedInput
                      name="host"
                      label="Host"
                      value={server.host || ''}
                      onChange={(e) => updateServer('host', e.target.value)}
                      required={true}
                      placeholder="localhost"
                    />
                    <ValidatedInput
                      name="port"
                      label="Port"
                      type="number"
                      value={server.port || ''}
                      onChange={(e) => updateServer('port', parseInt(e.target.value) || undefined)}
                      required={true}
                      placeholder="5433"
                    />
                    <ValidatedInput
                      name="database"
                      label="Database"
                      value={server.database || ''}
                      onChange={(e) => updateServer('database', e.target.value)}
                      required={true}
                      placeholder="mydb"
                    />
                    <ValidatedInput
                      name="schema"
                      label="Schema"
                      value={server.schema || ''}
                      onChange={(e) => updateServer('schema', e.target.value)}
                      required={true}
                      placeholder="public"
                    />
                  </>
                )}

                {server.type === 'custom' && (
                  <>
                    <div>
                      <label className="block text-xs font-medium leading-4 text-gray-900 mb-1">
                        Host
                      </label>
                      <input
                        type="text"
                        value={server.host || ''}
                        onChange={(e) => updateServer('host', e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                        placeholder="hostname or IP"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium leading-4 text-gray-900 mb-1">
                        Port
                      </label>
                      <input
                        type="number"
                        value={server.port || ''}
                        onChange={(e) => updateServer('port', parseInt(e.target.value) || undefined)}
                        className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                        placeholder="port number"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium leading-4 text-gray-900 mb-1">
                        Account
                      </label>
                      <input
                        type="text"
                        value={server.account || ''}
                        onChange={(e) => updateServer('account', e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                        placeholder="account name"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium leading-4 text-gray-900 mb-1">
                        Project
                      </label>
                      <input
                        type="text"
                        value={server.project || ''}
                        onChange={(e) => updateServer('project', e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                        placeholder="project name"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium leading-4 text-gray-900 mb-1">
                        Database
                      </label>
                      <input
                        type="text"
                        value={server.database || ''}
                        onChange={(e) => updateServer('database', e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                        placeholder="database name"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium leading-4 text-gray-900 mb-1">
                        Dataset
                      </label>
                      <input
                        type="text"
                        value={server.dataset || ''}
                        onChange={(e) => updateServer('dataset', e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                        placeholder="dataset name"
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
                        placeholder="catalog name"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium leading-4 text-gray-900 mb-1">
                        Schema
                      </label>
                      <input
                        type="text"
                        value={server.schema || ''}
                        onChange={(e) => updateServer('schema', e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                        placeholder="schema name"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium leading-4 text-gray-900 mb-1">
                        Warehouse
                      </label>
                      <input
                        type="text"
                        value={server.warehouse || ''}
                        onChange={(e) => updateServer('warehouse', e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                        placeholder="warehouse or cluster name"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium leading-4 text-gray-900 mb-1">
                        Service Name
                      </label>
                      <input
                        type="text"
                        value={server.serviceName || ''}
                        onChange={(e) => updateServer('serviceName', e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                        placeholder="service name"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium leading-4 text-gray-900 mb-1">
                        Location
                      </label>
                      <input
                        type="text"
                        value={server.location || ''}
                        onChange={(e) => updateServer('location', e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                        placeholder="https://example.com/data or s3://bucket/path"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium leading-4 text-gray-900 mb-1">
                        Endpoint URL
                      </label>
                      <input
                        type="text"
                        value={server.endpointUrl || ''}
                        onChange={(e) => updateServer('endpointUrl', e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                        placeholder="https://api.example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium leading-4 text-gray-900 mb-1">
                        Path
                      </label>
                      <input
                        type="text"
                        value={server.path || ''}
                        onChange={(e) => updateServer('path', e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                        placeholder="/path/to/data"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium leading-4 text-gray-900 mb-1">
                        Staging Dir
                      </label>
                      <input
                        type="text"
                        value={server.stagingDir || ''}
                        onChange={(e) => updateServer('stagingDir', e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                        placeholder="staging directory"
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
                        placeholder="parquet, json, csv"
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
                        placeholder="delimiter character"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium leading-4 text-gray-900 mb-1">
                        Region
                      </label>
                      <input
                        type="text"
                        value={server.region || ''}
                        onChange={(e) => updateServer('region', e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                        placeholder="cloud region"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium leading-4 text-gray-900 mb-1">
                        Region Name
                      </label>
                      <input
                        type="text"
                        value={server.regionName || ''}
                        onChange={(e) => updateServer('regionName', e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                        placeholder="region name"
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
