import { useEffect } from 'react';
import { Header, SidebarNavigation, MainContent } from './layouts/index.js';
import { HashRouter } from 'react-router-dom'
import { useEditorStore, setFileStorageBackend } from './store.js';
import { LocalFileStorageBackend } from './services/LocalFileStorageBackend.js';
import { ToastContainer } from './components/ui/Toast.jsx';

/**
 * Main App component for the Data Contract Editor
 * @param {Object} props
 * @param {FileStorageBackend} [props.storageBackend] - Optional storage backend to use (defaults to LocalFileStorageBackend)
 */
function App({ storageBackend = null }) {
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
        <HashRouter>
            <div className="bg-white">
                <div className="h-screen flex flex-col">
                    <Header/>
                    <main className="flex flex-row w-full bg-white flex-1 overflow-hidden">
                        <SidebarNavigation/>
                        <MainContent/>
                    </main>
                </div>
                <ToastContainer />
            </div>
        </HashRouter>
    )
}

export default App
