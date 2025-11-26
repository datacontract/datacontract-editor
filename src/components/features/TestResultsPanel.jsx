import React, { useState, useEffect } from 'react';
import { useEditorStore } from '../../store';
import * as YAML from 'yaml';
import ChevronDownIcon from '../ui/icons/ChevronDownIcon';
import SettingsModal from './SettingsModal';

const TestResultsPanel = ({ onCheckClick }) => {
  const testResults = useEditorStore((state) => state.testResults);
  const runTest = useEditorStore((state) => state.runTest);
  const clearTestResults = useEditorStore((state) => state.clearTestResults);
  const isTestRunning = useEditorStore((state) => state.isTestRunning);
  const yaml = useEditorStore((state) => state.yaml);

  const editorConfig = useEditorStore((state) => state.editorConfig);
  const [selectedServer, setSelectedServer] = useState('');
  const [servers, setServers] = useState([]);
  const [showHelp, setShowHelp] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Get the configured API server URL
  const apiServerUrl = editorConfig?.tests?.dataContractCliApiServerUrl || 'http://localhost:4242';

  // Parse servers from YAML
  useEffect(() => {
    try {
      const parsed = YAML.parse(yaml);
      if (parsed && parsed.servers && Array.isArray(parsed.servers)) {
        const serverList = parsed.servers.map(server => ({
          name: server.server || server.name || 'Unnamed Server',
          ...server
        }));
        setServers(serverList);
        // Set first server as default if not already selected
        if (serverList.length > 0 && !selectedServer) {
          setSelectedServer(serverList[0].name);
        }
      } else {
        setServers([]);
      }
    } catch (error) {
      setServers([]);
    }
  }, [yaml]);

  const handleRunTest = async () => {
    try {
      await runTest(servers.length > 1 ? selectedServer : undefined);
    } catch (error) {
      // Error is already handled in the store
      console.error('Test failed:', error);
    }
  };

  const handleClearResults = () => {
    clearTestResults();
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const parseLogEntry = (logEntry) => {
    // Handle non-string log entries (objects, arrays, etc.)
    if (typeof logEntry !== 'string') {
      // If it's an object with level and message properties
      if (logEntry && typeof logEntry === 'object') {
        if (logEntry.level && logEntry.message) {
          return {
            level: logEntry.level.toUpperCase(),
            message: logEntry.message
          };
        }
        // Otherwise stringify it
        return {
          level: 'INFO',
          message: JSON.stringify(logEntry)
        };
      }
      // Convert to string
      logEntry = String(logEntry);
    }

    // Try to parse log format like "INFO: message" or "ERROR: message"
    const match = logEntry.match(/^(DEBUG|INFO|WARN|WARNING|ERROR|FATAL|TRACE):\s*(.+)$/i);
    if (match) {
      return {
        level: match[1].toUpperCase(),
        message: match[2]
      };
    }
    // If no level found, treat as INFO
    return {
      level: 'INFO',
      message: logEntry
    };
  };

  const getLogLevelColor = (level) => {
    switch (level) {
      case 'ERROR':
      case 'FATAL':
        return 'text-red-600 dark:text-red-400';
      case 'WARN':
      case 'WARNING':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'DEBUG':
      case 'TRACE':
        return 'text-gray-500 dark:text-gray-400';
      case 'INFO':
      default:
        return 'text-blue-600 dark:text-blue-400';
    }
  };

  const getLastTestStatus = () => {
    if (testResults.length === 0) return null;

    const lastResult = testResults[0];

    // If there's an error, it's a failure
    if (lastResult.error) {
      return { success: false, problemCount: 1 };
    }

    // Count checks that do NOT have result="passed"
    if (lastResult.data && Array.isArray(lastResult.data.checks)) {
      const problemChecks = lastResult.data.checks.filter(check =>
        check.result !== 'passed'
      );

      if (problemChecks.length > 0) {
        return { success: false, problemCount: problemChecks.length };
      }
    }

    // All good - either no checks or all passed
    return { success: true, problemCount: 0 };
  };

  const lastTestStatus = getLastTestStatus();
  const currentResult = testResults.length > 0 ? testResults[0] : null;

  const renderHelp = () => {
    return (
      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex items-start justify-between mb-2">
          <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-200">How to start the Data Contract CLI</h4>
          <button
            onClick={() => setShowHelp(false)}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
            title="Hide help"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="text-sm text-blue-800 dark:text-blue-300 space-y-2">
          <p>To run the <a
						href="https://cli.datacontract.com/"
						target="_blank"
						rel="noopener noreferrer"
						className="font-semibold underline hover:text-blue-600 dark:hover:text-blue-200">
						cli.datacontract.com/API
					</a> API server, use the following command:</p>
          <div className="bg-gray-900 text-gray-100 p-2 rounded font-mono text-xs">
            $ datacontract api
          </div>
          <p>The API runs at <span className="font-mono">{apiServerUrl}</span>.</p>
          <p>
            For more information, visit{' '}
            <a
              href="https://cli.datacontract.com/API"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold underline hover:text-blue-600 dark:hover:text-blue-200"
            >
              https://cli.datacontract.com/API
            </a>
          </p>
        </div>
      </div>
    );
  };

  const renderTestResult = (result) => {
    if (result.error) {
      return (
        <div className="space-y-3">
          <div className="text-sm text-red-700 dark:text-red-300">
            <p className="font-semibold">Error:</p>
            <p className="mt-1">{result.error}</p>
          </div>
          {result.isConnectionError && !showHelp && (
            <button
              onClick={() => setShowHelp(true)}
              className="inline-flex items-center px-3 py-2 text-sm font-semibold rounded-md transition-colors bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Show Help
            </button>
          )}
          {showHelp && renderHelp()}
        </div>
      );
    }

    if (result.data) {
      // Handle different response formats
      const data = result.data;

      // If data has a checks array (common test result format)
      if (Array.isArray(data.checks)) {
        return (
          <div className="space-y-3">
            <div className="space-y-2">
              {data.checks.map((check, idx) => {
                const isFailed = check.result !== 'passed' && check.result !== 'pass' && check.result !== true;
                return (
                  <div
                    key={idx}
                    onClick={() => isFailed && onCheckClick && onCheckClick(check)}
                    className={`flex items-start gap-2 ${isFailed && onCheckClick ? 'cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/40 p-2 -m-2 rounded transition-colors' : ''}`}
                  >
                    <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                      !isFailed
                        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                        : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                    }`}>
                      {!isFailed ? '✓' : '✕'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 dark:text-gray-200">
                        {check.name || check.type || check.message}
                      </p>
                      {check.reason && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {check.reason}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Display logs if available */}
            {data.logs && data.logs.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Logs</h4>
                <div className="bg-gray-100 dark:bg-gray-800 rounded p-2">
                  <div className="space-y-0.5">
                    {data.logs.map((log, idx) => {
                      const { level, message } = parseLogEntry(log);
                      return (
                        <div key={idx} className="flex gap-2 text-xs font-mono">
                          <span className={`font-semibold w-12 flex-shrink-0 ${getLogLevelColor(level)}`}>
                            {level}
                          </span>
                          <span className="text-gray-700 dark:text-gray-300 flex-1">
                            {message}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      }

      // Generic JSON display for other formats
      return (
        <div className="space-y-3">
          <pre className="text-xs text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 p-2 rounded">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      );
    }

    return (
      <div className="text-sm text-gray-600 dark:text-gray-400">
        No test data available
      </div>
    );
  };

  if (testResults.length === 0) {
    return (
      <div className="h-full bg-gray-50 dark:bg-gray-900 flex flex-col">
        {/* Run Test Button */}
        <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">Data Contract Tests</h2>
            {lastTestStatus && (
              <div className="flex items-center gap-1.5">
                {lastTestStatus.success ? (
                  <>
                    <span className="text-sm text-gray-700 dark:text-gray-300">Passed</span>
                    <span className="inline-flex items-center text-green-600" title="All tests passed">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                      </svg>
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-sm text-gray-700 dark:text-gray-300">Failed tests</span>
                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
                      {lastTestStatus.problemCount}
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
          {servers.length > 1 ? (
            <span className="inline-flex w-full">
              <div className="-mr-px grid grid-cols-1 flex-1">
                <select
                  id="server-select"
                  value={selectedServer}
                  onChange={(e) => setSelectedServer(e.target.value)}
                  aria-label="Select server"
                  disabled={isTestRunning}
                  className={`col-start-1 row-start-1 w-full appearance-none rounded-l-md bg-white py-2 pr-8 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 dark:bg-white/10 dark:text-white dark:outline-gray-700 dark:*:bg-gray-800 dark:focus:outline-indigo-500 ${
                    isTestRunning ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {servers.map((server, idx) => (
                    <option key={idx} value={server.name}>
                      {server.name}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon
                  aria-hidden="true"
                  className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4 dark:text-gray-400"
                />
              </div>
              <button
                onClick={handleRunTest}
                disabled={isTestRunning}
                className={`inline-flex items-center justify-center rounded-r-md btn--primary border-l border-indigo-700 dark:border-indigo-600 ${
                  isTestRunning
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
              >
                {isTestRunning ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </>
                )}
              </button>
            </span>
          ) : (
            <button
              onClick={handleRunTest}
              disabled={isTestRunning}
              className={`w-full inline-flex items-center justify-center btn--primary ${
                isTestRunning
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              }`}
            >
              {isTestRunning ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Test is currently running...
                </>
              ) : (
                <>
                  <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Run Test
                </>
              )}
            </button>
          )}
          <div className="mt-2 flex items-center justify-between">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Connected to Data Contract CLI via: <a href={apiServerUrl} target="_blank" rel="noopener noreferrer" className="font-mono text-blue-600 dark:text-blue-400 hover:underline">{apiServerUrl}</a>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSettings(true)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                title="Settings"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
              </button>
              <button
                onClick={() => setShowHelp(!showHelp)}
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 font-medium"
              >
                {showHelp ? 'Hide Help' : 'Show Help'}
              </button>
            </div>
          </div>
          {showHelp && renderHelp()}
        </div>

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
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium">No test results yet</h3>
            <p className="mt-1 text-sm">Click the Run Test button above to test your data contract.</p>
          </div>
        </div>

        {/* Settings Modal */}
        <SettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
        />
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Run Test Button */}
      <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">Data Contract Tests</h2>
          {lastTestStatus && (
            <div className="flex items-center gap-1.5">
              {lastTestStatus.success ? (
                <>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Passed</span>
                  <span className="inline-flex items-center text-green-600" title="All tests passed">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                    </svg>
                  </span>
                </>
              ) : (
                <>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Failed tests</span>
                  <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
                    {lastTestStatus.problemCount}
                  </span>
                </>
              )}
            </div>
          )}
        </div>
        {servers.length > 1 && (
          <div className="mb-3">
            <label htmlFor="server-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Server
            </label>
            <select
              id="server-select"
              value={selectedServer}
              onChange={(e) => setSelectedServer(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {servers.map((server, idx) => (
                <option key={idx} value={server.name}>
                  {server.name}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="flex gap-2 items-center">
          <button
            onClick={handleRunTest}
            disabled={isTestRunning}
            className={`flex-1 inline-flex items-center justify-center btn--primary ${
              isTestRunning
                ? 'opacity-50 cursor-not-allowed'
                : ''
            }`}
          >
            {isTestRunning ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Test is currently running...
              </>
            ) : (
              <>
                <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Run Test
              </>
            )}
          </button>
          {currentResult && (
            <button
              onClick={handleClearResults}
              className="px-4 py-2 text-sm font-semibold rounded-md transition-colors bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              title="Clear test results"
            >
              Clear
            </button>
          )}
        </div>
        <div className="mt-2 flex items-center justify-between">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Connected to Data Contract CLI via: <a href={apiServerUrl} target="_blank" rel="noopener noreferrer" className="font-mono text-blue-600 dark:text-blue-400 hover:underline">{apiServerUrl}</a>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(true)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              title="Settings"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
            </button>
            <button
              onClick={() => setShowHelp(!showHelp)}
              className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 font-medium"
            >
              {showHelp ? 'Hide Help' : 'Show Help'}
            </button>
          </div>
        </div>
        {showHelp && renderHelp()}
      </div>

      {/* Current Test Result */}
      {currentResult && (
        <div className="flex-1 overflow-y-auto p-4">
          <div
            className={`p-3 rounded-lg border ${
              currentResult.success
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  currentResult.success
                    ? 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-100'
                    : 'bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-100'
                }`}>
                  {currentResult.success ? '✓' : '✕'}
                </span>
                <div className="flex flex-col">
                  <span className={`text-sm font-semibold ${
                    currentResult.success
                      ? 'text-green-800 dark:text-green-200'
                      : 'text-red-800 dark:text-red-200'
                  }`}>
                    {currentResult.success ? 'Passed' : 'Failed'}
                  </span>
                  {currentResult.data && currentResult.data.server && (
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      Server: {currentResult.data.server}
                    </span>
                  )}
                </div>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatTimestamp(currentResult.timestamp)}
              </span>
            </div>

            <div className="mt-2">
              {renderTestResult(currentResult)}
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  );
};

export default TestResultsPanel;
