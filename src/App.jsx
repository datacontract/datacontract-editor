import { useEffect } from 'react';
import { Header, SidebarNavigation, MainContent } from './layouts/index.js';
import { HashRouter } from 'react-router-dom'
import { useEditorStore, setFileStorageBackend, setEditorConfig } from './store.js';
import { LocalFileStorageBackend } from './services/LocalFileStorageBackend.js';
import { ToastContainer } from './components/ui/Toast.jsx';
import { ErrorBoundary } from './components/error/index.js';
import { AiFloatingActionButton, AiSidebar } from './ai/index.js';

/**
 * Main App component for the Data Contract Editor
 * @param {Object} props
 * @param {FileStorageBackend} [props.storageBackend] - Optional storage backend to use (defaults to LocalFileStorageBackend)
 * @param {Object} [props.editorConfig] - Optional editor configuration (tests, mode, etc.)
 */
function App({ storageBackend = null, editorConfig = null }) {
    const setYaml = useEditorStore((state) => state.setYaml);

    useEffect(() => {
        // Configure storage backend if provided
        if (storageBackend) {
            setFileStorageBackend(storageBackend);
            console.log(`Using storage backend: ${storageBackend.getBackendName()}`);
        } else {
            // Default to LocalFileStorageBackend if no backend provided
            setFileStorageBackend(new LocalFileStorageBackend());
            console.log('Using default storage backend: Local File Storage');
        }
    }, [storageBackend]);

    useEffect(() => {
        // Apply editor configuration if provided
        if (editorConfig) {
            setEditorConfig(editorConfig);
            console.log('Applied editor configuration:', editorConfig);
        }
    }, [editorConfig]);

    useEffect(() => {
        // Check if there's a shared data contract in the URL
        const urlParams = new URLSearchParams(window.location.search);
        const encodedData = urlParams.get('data');

        if (encodedData) {
            try {
                // Decode base64 YAML
                const decodedYaml = decodeURIComponent(escape(atob(encodedData)));
                setYaml(decodedYaml);

                // Remove the query parameter from URL to clean it up
                const newUrl = window.location.pathname + window.location.hash;
                window.history.replaceState({}, '', newUrl);
            } catch (error) {
                console.error('Failed to load shared data contract:', error);
                alert('Failed to load shared data contract. The link may be invalid.');
            }
        }
    }, [setYaml]);

    return (
        <ErrorBoundary
            fallback={({ error, resetError }) => (
                <div className="h-full flex items-center justify-center bg-gray-50">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-lg">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0">
                                <svg className="h-8 w-8 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h1 className="text-lg font-bold text-red-800">Application Error</h1>
                                <p className="mt-2 text-sm text-red-700">
                                    The Data Contract Editor encountered a critical error and cannot continue.
                                </p>
                                <div className="mt-3 text-sm text-red-600">
                                    <span className="font-medium">Error: </span>
                                    {error?.message || 'Unknown error'}
                                </div>
                                <div className="mt-4 flex gap-3">
                                    <button
                                        onClick={resetError}
                                        className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded text-red-700 bg-white hover:bg-red-50"
                                    >
                                        Try Again
                                    </button>
                                    <button
                                        onClick={() => window.location.reload()}
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded text-white bg-red-600 hover:bg-red-700"
                                    >
                                        Reload Application
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        >
            <HashRouter>
                <div className="bg-white h-full">
                    <div className="h-full flex flex-row">
                        {/* Main app content */}
                        <div className="flex flex-col flex-1 min-w-0 h-full">
                            <Header/>
                            <main className="flex flex-row w-full bg-white flex-1 overflow-hidden min-w-0">
                                {/* Desktop sidebar - hidden on mobile */}
                                <div className="hidden md:block">
                                    <SidebarNavigation/>
                                </div>
                                {/* Mobile sidebar overlay */}
                                <SidebarNavigation isMobile={true}/>
                                <MainContent/>
                            </main>
                        </div>
                        {/* AI Panel - full height sidebar on far right */}
                        <AiSidebar />
                    </div>
                    <ToastContainer />
                    <AiFloatingActionButton />
                </div>
            </HashRouter>
        </ErrorBoundary>
    )
}

export default App
