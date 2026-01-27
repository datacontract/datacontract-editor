import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {useEditorStore, getFileStorageBackend, initialYaml} from "../store.js";
import { stringifyYaml, parseYaml } from '../utils/yaml.js';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { FileSelectionModal } from '../components/ui/FileSelectionModal.jsx';
import exampleYaml from '../example.yaml?raw';

// Hamburger menu icon component
const HamburgerIcon = () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const saveToFile = useEditorStore((state) => state.saveToFile);
    const loadFromFile = useEditorStore((state) => state.loadFromFile);
    const togglePreview = useEditorStore((state) => state.togglePreview);
    const toggleWarnings = useEditorStore((state) => state.toggleWarnings);
    const toggleTestResults = useEditorStore((state) => state.toggleTestResults);
    const toggleMobileSidebar = useEditorStore((state) => state.toggleMobileSidebar);
    const isPreviewVisible = useEditorStore((state) => state.isPreviewVisible);
    const isWarningsVisible = useEditorStore((state) => state.isWarningsVisible);
    const isTestResultsVisible = useEditorStore((state) => state.isTestResultsVisible);
    const testResults = useEditorStore((state) => state.testResults);
    const markers = useEditorStore((state) => state.markers);
    const currentView = useEditorStore((state) => state.currentView);
    const setView = useEditorStore((state) => state.setView);
    const yaml = useEditorStore((state) => state.yaml);
    const yamlCursorLine = useEditorStore((state) => state.yamlCursorLine);
    const editorConfig = useEditorStore((state) => state.editorConfig);

    // Check if we're in server mode
    const backend = getFileStorageBackend();
    const isServerMode = backend.getBackendName() === 'Server Storage';

    // Get editor mode from config
    const editorMode = editorConfig?.mode || 'SERVER';
    const isEmbeddedMode = editorMode === 'EMBEDDED';

    // Calculate problem count
    const totalCount = markers.length;

    // Calculate test problem count from checks
    const getTestProblemCount = () => {
        if (testResults.length === 0) return 0;

        const lastResult = testResults[0];
        if (!lastResult.data || !Array.isArray(lastResult.data.checks)) return 0;

        // Count all checks that do NOT have result="passed"
        return lastResult.data.checks.filter(check =>
            check.result !== 'passed'
        ).length;
    };

    const testProblemCount = getTestProblemCount();
    const hasTestPassed = testResults.length > 0 && testResults[0].success;

    const handleClose = () => {
        if (window.confirm('Are you sure you want to leave this page?')) {
            // Handle navigation away
            console.log('Closing wizard');
        }
    };

    const handleSave = async () => {
        try {
            // Parse YAML to check for required fields
            let parsedYaml;
            try {
                parsedYaml = parseYaml(yaml);
            } catch (parseError) {
                alert('Cannot save: YAML is invalid. Please fix syntax errors first.');
                return;
            }

            // Check for all required fundamental fields
            const requiredFields = [
                { field: 'name', label: 'Name' },
                { field: 'version', label: 'Version' },
                { field: 'status', label: 'Status' },
                { field: 'id', label: 'ID' }
            ];

            const missingFields = requiredFields.filter(({ field }) =>
                !parsedYaml[field] || parsedYaml[field].trim() === ''
            );

            if (missingFields.length > 0) {
                const missingFieldsList = missingFields.map(({ label }) => label).join(', ');
                alert(`Cannot save: Missing required fields: ${missingFieldsList}\n\nPlease fill in all required fields in the Overview section.`);
                return;
            }

            await saveToFile();
        } catch (error) {
            // Handle different types of errors
            if (error.name === 'AbortError' || error.message === 'File selection cancelled') {
                // User cancelled - no need to show error
                return;
            }
            console.error('Error saving file:', error);
            alert(`Failed to save file: ${error.message}`);
        }
    };

    const handleCancel = () => {
        if (editorConfig?.onCancel) {
            editorConfig.onCancel();
        }
    };

    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete this data contract? This action cannot be undone.')) {
            if (editorConfig?.onDelete) {
                editorConfig.onDelete();
            }
        }
    };

    const handleNew = () => {
        if (window.confirm('Create a new data contract? Any unsaved changes will be lost.')) {
            // Clear the YAML and reset to a valid template with all required fields
            const newYaml = initialYaml;

            const store = useEditorStore.getState();
            store.setYaml(newYaml);
            store.setView('form');
            if (!store.isPreviewVisible) {
                store.togglePreview();
            }
            // Clear test results and save info when creating a new data contract
            store.clearTestResults();
            store.clearSaveInfo();
            navigate('/overview');
        }
    };

    const handleExample = () => {
        if (window.confirm('Load an example data contract? Any unsaved changes will be lost.')) {
            const store = useEditorStore.getState();
            store.loadYaml(exampleYaml);
            // Clear save info when loading example - it's a new unsaved document
            store.clearSaveInfo();
            navigate('/overview');
        }
    };

    const handleOpen = async () => {
        // Use browser file picker
        try {
            await loadFromFile();
            navigate('/overview');
        } catch (error) {
            if (error.name === 'AbortError' || error.message === 'File selection cancelled') {
                return; // User cancelled
            }
            console.error('Error opening file:', error);
            alert(`Failed to open file: ${error.message}`);
        }
    };

    // Determine which form to navigate to based on cursor position in YAML
    const determineFormFromYamlLine = (lineNumber) => {
        if (!yaml || lineNumber < 1) {
            return '/overview';
        }

        const lines = yaml.split('\n');

        // Find which top-level section contains this line
        // Track the current section as we scan through the lines
        let currentSection = null;
        let currentIndent = -1;

        for (let i = 0; i < Math.min(lineNumber, lines.length); i++) {
            const line = lines[i];
            const trimmedLine = line.trim();

            // Skip empty lines and comments
            if (!trimmedLine || trimmedLine.startsWith('#')) {
                continue;
            }

            // Calculate indentation level
            const indent = line.search(/\S/);

            // Check if this is a top-level property (0 indentation or root level)
            if (indent === 0 && trimmedLine.includes(':')) {
                const propertyName = trimmedLine.split(':')[0].trim();
                currentSection = propertyName;
                currentIndent = indent;
            } else if (indent <= currentIndent && indent === 0) {
                // Reset if we're back at root level
                currentSection = null;
                currentIndent = -1;
            }
        }

        // Map YAML sections to form routes
        const sectionToRoute = {
            'info': '/overview',
            'schema': '/schemas/0', // Default to first schema, could be improved
            'support': '/support',
            'team': '/team',
            'roles': '/roles',
            'servers': '/servers',
            'pricing': '/pricing',
            'slaProperties': '/sla',
            'customProperties': '/custom-properties'
        };

        // If cursor is in schema section, find which schema by scanning upward
        if (currentSection === 'schema') {
            // Scan upward from cursor to find the nearest `- ` line (start of current item)
            let itemStartLine = -1;
            let schemaName = '';
            for (let i = lineNumber - 1; i >= 0; i--) {
                const line = lines[i];
                if (line.match(/^\s*- name:\s/)) {
                    itemStartLine = i;
                    schemaName = line.split(':').slice(1).join(':').trim();
                    break;
                }
                // Stop if we hit the section header
                if (line.trim().startsWith('schema:')) {
                    break;
                }
            }
            const parsed = parseYaml(yaml);
            let schemaIndex = 0;
            for(let i = 0; i < parsed?.schema?.length; i++){
                if(parsed.schema[i].name === schemaName) {
                    schemaIndex = i;
                }
            }

            return `/schemas/${schemaIndex}`;
        }

        // If cursor is in servers section, find which server by scanning upward
        if (currentSection === 'servers') {
            // Scan upward from cursor to find the nearest `- ` line (start of current item)
            let itemStartLine = -1;
						let serverName = '';
            for (let i = lineNumber - 1; i >= 0; i--) {
                const line = lines[i];
                if (line.match(/^\s*- server:\s/)) {
                    itemStartLine = i;
										serverName = line.split(':').slice(1).join(':').trim();
                    break;
                }
                // Stop if we hit the section header
                if (line.trim().startsWith('servers:')) {
                    break;
                }
            }
						const parsed = parseYaml(yaml);
						console.log(parsed);
						console.log(serverName);
						let serverIndex = 0;
						for(let i = 0;i<parsed?.servers.length;i++){
							if(parsed.servers[i].server === serverName) {
								serverIndex = i;
								break;
							}
						}

            return `/servers/${serverIndex}`;
        }

        return sectionToRoute[currentSection] || '/overview';
    };

    const handleFormViewSwitch = () => {
        if (currentView === 'yaml') {
            // Determine which form to open based on cursor position
            const formRoute = determineFormFromYamlLine(yamlCursorLine);
            console.log('[Header] YAML→Form navigation:', {
                cursorLine: yamlCursorLine,
                targetRoute: formRoute
            });
            navigate(formRoute);
            setView('form');
        } else if (currentView === 'diagram') {
            // When switching from diagram to form, navigate to the selected schema or overview
            const selectedSchemaIndex = useEditorStore.getState().selectedDiagramSchemaIndex;
            const targetRoute = selectedSchemaIndex !== null ? `/schemas/${selectedSchemaIndex}` : '/overview';
            navigate(targetRoute);
            setView('form');
        } else {
            setView('form');
        }
    };

    // Find the line number for a specific YAML section
    const findYamlSectionLine = (sectionName) => {
        if (!yaml) return 1;

        const lines = yaml.split('\n');
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmedLine = line.trim();

            // Check if this is a top-level property (0 indentation)
            const indent = line.search(/\S/);
            if (indent === 0 && trimmedLine.startsWith(sectionName + ':')) {
                return i + 1; // Line numbers start at 1
            }
        }

        return 1; // Default to first line if not found
    };

    // Find the line number for a specific array item in a section
    const findYamlArrayItemLine = (sectionName, itemIndex) => {
        if (!yaml) return 1;

        const lines = yaml.split('\n');
        let inSection = false;
        let arrayItemCount = 0;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmedLine = line.trim();
            const indent = line.search(/\S/);

            // Check if we're entering the section
            if (indent === 0 && trimmedLine.startsWith(sectionName + ':')) {
                inSection = true;
                continue;
            }

            // If we're in the section
            if (inSection) {
                // Check for array items (lines starting with -)
                if (line.match(/^\s*-\s/)) {
                    if (arrayItemCount === itemIndex) {
                        return i + 1; // Found the item, return line number
                    }
                    arrayItemCount++;
                }

                // If we hit another top-level property, exit
                if (indent === 0 && trimmedLine.includes(':') && !trimmedLine.startsWith(sectionName + ':')) {
                    break;
                }
            }
        }

        // Fallback to section start if item not found
        return findYamlSectionLine(sectionName);
    };

    const handleYamlViewSwitch = () => {
        if (currentView === 'form') {
            // Determine which YAML section to scroll to based on current route
            const path = location.pathname;
            let scrollToLine = 1;

            // Map routes to YAML sections
            if (path.includes('/overview')) {
                scrollToLine = findYamlSectionLine('info');
            } else if (path.includes('/schemas')) {
                // Check if we're on a specific schema
                const schemaMatch = path.match(/\/schemas\/(\d+)/);
                if (schemaMatch) {
                    const schemaIndex = parseInt(schemaMatch[1], 10);
                    scrollToLine = findYamlArrayItemLine('schema', schemaIndex);
                } else {
                    scrollToLine = findYamlSectionLine('schema');
                }
            } else if (path.includes('/support')) {
                scrollToLine = findYamlSectionLine('support');
            } else if (path.includes('/team')) {
                scrollToLine = findYamlSectionLine('team');
            } else if (path.includes('/roles')) {
                scrollToLine = findYamlSectionLine('roles');
            } else if (path.includes('/servers')) {
                // Check if we're on a specific server
                const serverMatch = path.match(/\/servers\/(\d+)/);
                if (serverMatch) {
                    const serverIndex = parseInt(serverMatch[1], 10);
                    scrollToLine = findYamlArrayItemLine('servers', serverIndex);
                } else {
                    scrollToLine = findYamlSectionLine('servers');
                }
            } else if (path.includes('/pricing')) {
                scrollToLine = findYamlSectionLine('pricing');
            } else if (path.includes('/sla')) {
                scrollToLine = findYamlSectionLine('slaProperties');
            } else if (path.includes('/custom-properties')) {
                scrollToLine = findYamlSectionLine('customProperties');
            }

            setView('yaml');
            // Navigate with state to trigger scroll
            navigate(location.pathname, { state: { scrollToLine }, replace: true });
        } else {
            setView('yaml');
        }
    };

    return (
        <>
            <nav className="border-b border-gray-300 bg-white text-gray-700">
                <div className="w-full px-2 md:px-4">
                    <div className="flex w-full h-14 md:h-16 justify-between items-center gap-2">
                        {/* Mobile hamburger menu */}
                        <button
                            onClick={toggleMobileSidebar}
                            className="md:hidden p-2 -ml-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                            aria-label="Open menu"
                        >
                            <HamburgerIcon />
                        </button>

                        {/* Logo - hidden on mobile to save space */}
                        <div className="hidden md:flex flex-row flex-1 justify-start items-center gap-2">
                    <svg className="h-8 w-auto" viewBox="0 0 530 587" xmlns="http://www.w3.org/2000/svg" style={{fillRule:"evenodd",clipRule:"evenodd",strokeLinejoin:"round",strokeMiterlimit:2}}>
                        <path d="M508.5,119.94L307.4,3.84C288.5,-7.06 264.9,6.54 264.9,28.34L264.9,132.14L376.1,196.34C389.3,203.94 397.4,217.94 397.4,233.14L397.4,514.44L508.6,450.24C521.8,442.64 529.9,428.64 529.9,413.44L529.9,156.64C529.9,141.44 521.8,127.44 508.6,119.84L508.5,119.94Z" style={{fill:"url(#_Linear1)",fillRule:"nonzero"}}/>
                        <path d="M376,196.44L174.9,80.34C156,69.44 132.4,83.04 132.4,104.84L132.4,208.64L206,251.14L243.6,272.84C245.2,273.74 246.8,274.84 248.3,275.94C249.8,277.04 251.2,278.34 252.5,279.64C260.3,287.54 264.9,298.24 264.9,309.64L264.9,586.54C269.8,586.54 274.7,585.24 279.1,582.74L397.4,514.44L397.4,233.14C397.4,217.94 389.3,203.94 376.1,196.34L376,196.44Z" style={{fill:"url(#_Linear2)",fillRule:"nonzero"}}/>
                        <path d="M262.9,586.54C261.3,586.44 259.6,586.14 258,585.74C259.6,586.14 261.2,586.44 262.9,586.54Z" style={{fill:"rgb(77,155,58)",fillRule:"nonzero"}}/>
                        <path d="M264.9,309.74C264.9,298.34 260.3,287.64 252.5,279.74C251.2,278.44 249.8,277.24 248.3,276.04C246.8,274.84 245.3,273.84 243.6,272.94L206,251.24L42.5,156.84C23.6,145.94 0,159.54 0,181.34L0,413.54C0,428.74 8.1,442.74 21.3,450.34L132.5,514.54L250.8,582.84C255.2,585.34 260.1,586.64 265,586.64L265,309.74L264.9,309.74Z" style={{fill:"url(#_Linear3)",fillRule:"nonzero"}}/>
                        <defs>
                            <linearGradient id="_Linear1" x1="0" y1="0" x2="1" y2="0" gradientUnits="userSpaceOnUse" gradientTransform="matrix(3.15004e-14,-514.44,514.44,3.15004e-14,397.4,514.44)"><stop offset="0" style={{stopColor:"rgb(134,25,143)",stopOpacity:1}}/><stop offset="1" style={{stopColor:"rgb(134,25,143)",stopOpacity:1}}/></linearGradient>
                            <linearGradient id="_Linear2" x1="0" y1="0" x2="1" y2="0" gradientUnits="userSpaceOnUse" gradientTransform="matrix(3.12309e-14,-510.04,510.04,3.12309e-14,264.9,586.54)"><stop offset="0" style={{stopColor:"rgb(192,38,211)",stopOpacity:1}}/><stop offset="1" style={{stopColor:"rgb(217,70,239)",stopOpacity:1}}/></linearGradient>
                            <linearGradient id="_Linear3" x1="0" y1="0" x2="1" y2="0" gradientUnits="userSpaceOnUse" gradientTransform="matrix(2.65528e-14,-433.64,433.64,2.65528e-14,132.5,586.64)"><stop offset="0" style={{stopColor:"rgb(217,70,239)",stopOpacity:1}}/><stop offset="0.39" style={{stopColor:"rgb(229,112,247)",stopOpacity:1}}/><stop offset="1" style={{stopColor:"rgb(232,121,249)",stopOpacity:1}}/></linearGradient>
                        </defs>
                    </svg>
                    <span className="text-md leading-tight text-gray-900">
                        Data Contract Editor
                    </span>
                </div>
                {/* View tabs - centered, responsive */}
                <div className="flex flex-row flex-1 justify-center items-center">
              <span className="isolate inline-flex rounded-md shadow-xs">
                <button type="button"
                        onClick={() => setView('diagram')}
                        className={`relative inline-flex items-center gap-1 md:gap-1.5 rounded-l-md px-2 md:px-3 py-1.5 text-xs font-semibold inset-ring-1 inset-ring-gray-300 hover:bg-gray-50 hover:cursor-pointer focus:z-10 ${
                          currentView === 'diagram'
                            ? 'bg-gray-100'
                            : 'bg-white'
                        }`}>
                    <div className="size-3 md:size-3">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" ><path d="M9.441696 0.480096C8.711016 0.55884 8.168232 1.057776 8.005848 1.8C7.97016 1.9631760000000003 7.967112000000001 2.3110559999999998 7.973400000000001 5.5200000000000005C7.979903999999999 8.84196 7.982976000000001 9.06888 8.023344 9.204C8.157912 9.654456 8.450712 10.006992 8.856 10.206479999999999C9.26304 10.406832 9.184488 10.399464 11.022 10.409688000000001L12.648 10.41876 12.648 10.596888L12.648 10.77504 8.646 10.78152L4.644 10.788 4.476 10.844112C3.910896 11.032896000000001 3.476088 11.488224 3.335328 12.038616C3.293688 12.201431999999999 3.2880000000000003 12.305448 3.2880000000000003 12.903839999999999L3.2880000000000003 13.584 2.7053760000000002 13.584C1.8507120000000001 13.584 1.608792 13.625160000000001 1.26 13.829832000000001C0.8196 14.088287999999999 0.5382720000000001 14.559047999999999 0.47940000000000005 15.136056C0.46089600000000003 15.317328 0.455664 16.412760000000002 0.46207200000000004 18.756C0.47016 21.716064 0.475752 22.133136 0.50904 22.26C0.600624 22.609199999999998 0.6987599999999999 22.781688 0.9465840000000001 23.029128C1.2510480000000002 23.333112 1.567344 23.477424 2.0253840000000003 23.521248C2.204544 23.538408 3.390288 23.543808 5.64 23.537760000000002C9.207840000000001 23.528136000000003 9.06204 23.53284 9.372 23.41776C9.493056 23.372808 9.695736 23.253576 9.821616 23.153232C10.03992 22.979208 10.26756 22.600800000000003 10.358952 22.26C10.402056 22.099248 10.404 21.939072000000003 10.404 18.552C10.404 14.599800000000002 10.41552 14.87748 10.236216 14.508672C10.072608 14.172144 9.818808 13.926312000000001 9.463968 13.760664C9.102384 13.591872 9.215904 13.599383999999999 6.882000000000001 13.590264L4.776 13.582032 4.776 13.032576C4.776 12.477528000000001 4.788408 12.380376000000002 4.866936 12.320712000000002C4.927776000000001 12.274488 19.072224000000002 12.274488 19.133064 12.320712000000002C19.211592 12.380376000000002 19.224 12.477528000000001 19.224 13.03248L19.224 13.581816 17.106 13.589616000000001C15.006936 13.597368000000001 14.98632 13.597895999999999 14.799503999999999 13.65036C14.138304 13.836072000000001 13.689744 14.382864 13.606560000000002 15.104496000000001C13.589592 15.251807999999999 13.584024 16.444752 13.589664 18.732C13.597392 21.8742 13.601280000000001 22.152 13.639655999999999 22.293888000000003C13.791576000000001 22.855800000000002 14.169216 23.248872 14.74872 23.448240000000002C15.02136 23.542056 15.262704000000001 23.547528000000003 18.756 23.539056L22.116 23.530896 22.305287999999997 23.477591999999998C22.626768000000002 23.387040000000002 22.787736000000002 23.292264 23.028000000000002 23.052C23.25048 22.829520000000002 23.346144 22.676064 23.449368 22.376016C23.542104000000002 22.106472 23.547552 21.859728 23.537904 18.36C23.527872 14.722944 23.535336 14.935392 23.405832 14.599632C23.34204 14.434272 23.159472 14.162808 23.038656 14.053656C22.83624 13.870776 22.585392 13.736376000000002 22.284 13.649280000000001C22.137432 13.606944 22.02648 13.599383999999999 21.414 13.589976L20.712 13.579199999999998 20.712 12.90144C20.712 12.305448 20.706288 12.20136 20.664672 12.038616C20.523912 11.488224 20.089104000000003 11.032896000000001 19.524 10.844112L19.356 10.788 16.758 10.78128L14.16 10.774560000000001 14.16 10.597392L14.16 10.420224 15.342 10.410408L16.524 10.400568000000002 16.728 10.337712C17.021808 10.247184 17.194944 10.14444 17.40204 9.937728C17.6034 9.736728 17.720976 9.545832 17.824416 9.252L17.892 9.06 17.898456 5.485056C17.904816 1.974432 17.904048 1.9066560000000001 17.856744 1.717056C17.779824 1.4088720000000001 17.658648000000003 1.193928 17.434848 0.968664C17.274432 0.807216 17.201496000000002 0.754272 17.014392 0.663528C16.582536 0.454032 16.91448 0.470568 13.044 0.46588799999999997C11.156400000000001 0.463608 9.535368 0.46999199999999997 9.441696 0.480096M9.564 1.9965359999999999C9.5376 2.011584 9.508056 2.035632 9.49836 2.04996C9.488664 2.064288 9.480576000000001 3.5886240000000003 9.48036 5.437416C9.480048 8.303016 9.485016 8.805696 9.514056 8.845416C9.547512 8.89116 9.61008 8.892 12.936 8.892C16.26192 8.892 16.324488000000002 8.89116 16.357944 8.845416C16.409112 8.775408 16.409112 2.0965920000000002 16.357944 2.026584C16.324536 1.980912 16.258992 1.9799039999999999 12.967944000000001 1.9746000000000001C10.49124 1.9705920000000001 9.599424 1.976352 9.564 1.9965359999999999M10.367856000000002 3.310416C10.18908 3.3648 10.0062 3.5262960000000003 9.909816 3.714888C9.86172 3.808968 9.852192 3.8623200000000004 9.853152 4.032C9.854568 4.2822960000000005 9.918168 4.424376 10.103376 4.5908880000000005C10.324056 4.789296 10.134672 4.777464 12.973176 4.770336L15.492 4.764 15.60288 4.709376C15.742680000000002 4.640496000000001 15.887471999999999 4.49532 15.962184 4.349112C16.044072 4.188912 16.045199999999998 3.8791680000000004 15.964488000000001 3.71532C15.891192000000002 3.566472 15.736368 3.414048 15.588000000000001 3.3446160000000003L15.468 3.2884800000000003 12.948 3.2903040000000003C11.562 3.291312 10.400928 3.30036 10.367856000000002 3.310416M2.036664 15.141888000000002L1.98 15.187752 1.98 18.561024C1.98 21.767352 1.9821119999999999 21.936408 2.022864 21.977136C2.0635920000000003 22.017888000000003 2.232648 22.02 5.438976 22.02L8.812248 22.02 8.858112 21.963336C8.9028 21.908160000000002 8.904 21.81936 8.904 18.560256000000003L8.904 15.213816 8.845080000000001 15.15492L8.786184 15.096 5.439744 15.096C2.18064 15.096 2.09184 15.097199999999999 2.036664 15.141888000000002M15.15492 15.15492L15.096 15.213816 15.096 18.560256000000003C15.096 21.81936 15.097199999999999 21.908160000000002 15.141888000000002 21.963336L15.187752 22.02 18.561024 22.02C21.767352 22.02 21.936408 22.017888000000003 21.977136 21.977136C22.017888000000003 21.936408 22.02 21.767352 22.02 18.561024L22.02 15.187752 21.963336 15.141888000000002C21.908160000000002 15.097199999999999 21.81936 15.096 18.560256000000003 15.096L15.213816 15.096 15.15492 15.15492M2.956872 16.418328C2.73708 16.455672 2.555736 16.586136000000003 2.43264 16.795560000000002C2.377776 16.888872 2.3648160000000003 16.943328 2.35644 17.115672C2.347488 17.299775999999998 2.3532960000000003 17.338512 2.407512 17.456952C2.487864 17.63244 2.653776 17.791752 2.821608 17.854536C2.951976 17.903328 2.9879520000000004 17.904 5.430912 17.903856C7.044696 17.903784 7.938792 17.895167999999998 7.996368 17.879184000000002C8.136672 17.840232 8.308512 17.70804 8.404728 17.565072C8.664336 17.179344 8.505696 16.658160000000002 8.066928 16.455288C7.9560960000000005 16.404048 7.953816 16.404 5.5200000000000005 16.400376C4.168200000000001 16.39836 3.027432 16.406352 2.956872 16.418328M16.091064 16.41576C15.939264 16.438056 15.839640000000001 16.489224 15.703224 16.61496C15.51372 16.789632 15.439944 17.016744 15.483744 17.290608C15.524568 17.54604 15.758784 17.811192000000002 16.003632 17.879184000000002C16.061208 17.895167999999998 16.955304 17.903784 18.569088 17.903856C21.012048 17.904 21.048024 17.903328 21.178392 17.854536C21.345936000000002 17.791848 21.512112 17.632512 21.592056 17.457888C21.644664 17.342976 21.651672 17.298792000000002 21.6444 17.128584C21.638088 16.981224 21.621936 16.904952 21.579888 16.824C21.461208 16.595424 21.272928 16.45776 21.024 16.41756C20.844336000000002 16.388544 16.287672 16.386864 16.091064 16.41576" stroke="none" fill="currentColor" fillRule="evenodd" strokeWidth={0.024} /></svg>                    </div>
                  Diagram
                </button>
                <button type="button"
                        onClick={handleFormViewSwitch}
                        className={`relative -ml-px inline-flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1.5 text-xs font-semibold inset-ring-1 inset-ring-gray-300 hover:bg-gray-50 hover:cursor-pointer focus:z-10 ${
                          currentView === 'form'
                            ? 'bg-gray-100'
                            : 'bg-white'
                        }`}>
                  <div className="size-3 md:size-4">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" ><path d="M18.555528000000002 1.152504C18.498048 1.164528 18.406248 1.201008 18.351528000000002 1.2336C18.296784 1.266216 16.34544 3.2024880000000002 14.015232 5.53644L9.77844 9.78 8.74788 12.192C7.766472 14.488895999999999 7.716864 14.612015999999999 7.708512 14.772C7.683384 15.253104000000002 8.092968 15.62496 8.565719999999999 15.550224000000002C8.655888 15.535968 12.960984000000002 13.720752 13.44 13.495008C13.49052 13.4712 15.209208 11.77152 17.753016 9.229704000000002C22.486632 4.499784 22.116384 4.898136 22.115616000000003 4.5360000000000005C22.114872 4.190712 22.162536 4.248792 20.584872 2.671128C19.386167999999998 1.472424 19.169232 1.265712 19.055784 1.2140160000000002C18.904416 1.145064 18.707232 1.1208 18.555528000000002 1.152504M18.401904 3.2820959999999997L18.072167999999998 3.6124560000000003 18.864096 4.404096L19.656024 5.19576 19.985927999999998 4.865856L20.315856 4.535928 19.523736 3.743832L18.731640000000002 2.951712 18.401904 3.2820959999999997M14.256 7.428L11.508096 10.176 12.300096 10.968L13.092096000000002 11.76 15.84 9.012L18.587903999999998 6.264 17.795904 5.472L17.003904 4.68 14.256 7.428M1.932 9.854832C1.9056000000000002 9.860136 1.8246000000000002 9.876096 1.752 9.89028C1.6794 9.904488 1.5336 9.957744 1.428 10.008647999999999C0.9739440000000001 10.227552000000001 0.635232 10.640184 0.51048 11.1264C0.470784 11.281152 0.468 11.522952 0.468 14.82L0.468 18.348 0.5232720000000001 18.540984C0.6063839999999999 18.831144 0.7440960000000001 19.059863999999997 0.9703680000000001 19.283640000000002C1.187304 19.498176 1.351176 19.604448 1.6119600000000003 19.699704L1.788 19.764 12 19.764L22.212 19.764 22.38804 19.699704C22.649616 19.604136 22.81332 19.497744 23.027544 19.284C23.3412 18.971064000000002 23.4774 18.683880000000002 23.522688 18.240000000000002C23.536920000000002 18.100344 23.542848 16.705392 23.537928 14.64C23.53056 11.531496 23.526696 11.255976 23.488344 11.114112C23.361336 10.644288 23.0256 10.231992 22.596 10.018296C22.250808 9.8466 22.3638 9.855144 20.319528000000002 9.846143999999999C18.276432 9.837168 18.322368 9.834144 18.115584000000002 9.991007999999999C17.700192 10.306152 17.716512 10.928016 18.147672 11.213088C18.218256 11.259744 18.33324 11.310096000000001 18.403176 11.324976000000001C18.490608 11.343552 19.058088 11.352 20.218512 11.352C21.844896 11.352 21.90876 11.35368 21.963336 11.397888L22.02 11.443752 22.02624 14.792256000000002L22.032504 18.140736 21.974328 18.208368L21.916152 18.276 12 18.276L2.083848 18.276 2.025672 18.208368L1.967496 18.140736 1.97376 14.792256000000002L1.98 11.443752 2.036664 11.397888C2.091672 11.353344 2.16996 11.352 4.724664 11.351616C7.593552000000001 11.351208 7.527431999999999 11.354256 7.7314799999999995 11.21388C8.209104 10.885248 8.157336 10.1748 7.637136 9.919344L7.5 9.852 4.74 9.848592C3.222 9.846696 1.9584 9.849504000000001 1.932 9.854832M10.29048 12.424680000000002C10.071192 12.936768 9.894792 13.358784 9.898488 13.362504C9.90636 13.370351999999999 11.715408 12.59988 11.741496 12.577560000000002C11.75112 12.569328 11.518296 12.32208 11.224104 12.028104L10.689216 11.493624 10.29048 12.424680000000002" stroke="none" fill="currentColor" fillRule="evenodd" strokeWidth={0.024} /></svg>
                  </div>
                  Form
                </button>
                <button type="button"
                        onClick={handleYamlViewSwitch}
                        className={`relative -ml-px inline-flex items-center gap-1 md:gap-1.5 rounded-r-md px-2 md:px-3 py-1.5 text-xs font-semibold inset-ring-1 inset-ring-gray-300 hover:bg-gray-50 hover:cursor-pointer focus:z-10 ${
                          currentView === 'yaml'
                            ? 'bg-gray-100 '
                            : 'bg-white'
                        }`}>
                  <div className="size-3 md:size-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </div>
                  YAML
                </button>
              </span>
                    {/* Preview/Validation/Tests - icons only on md, full labels on xl */}
                    <span className="hidden md:inline-flex isolate rounded-md shadow-xs ml-2 xl:ml-4">
                <button type="button"
                        onClick={togglePreview}
                        title="Preview"
                        className={`relative inline-flex items-center rounded-l-md px-2 xl:px-3 py-1.5 text-xs font-semibold inset-ring-1 inset-ring-gray-300 hover:bg-gray-50 hover:cursor-pointer focus:z-10 transition-colors ${
                          isPreviewVisible
                            ? 'bg-gray-100'
                            : 'bg-white'
                        }`}>
                    <div className="size-4 lg:mr-1.5">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" version="1.1">
  <path d="M11.187048 5.184312C9.187968 5.35056 7.124544 6.119808 5.088 7.458072C3.75876 8.331552 2.653728 9.24552 1.463952 10.455528C0.580176 11.354328 0.48057600000000006 11.510784 0.48057600000000006 12C0.48057600000000006 12.489696 0.58272 12.650304 1.46328 13.545096000000001C3.8247600000000004 15.944784 6.417312 17.624544 8.92956 18.38268C9.519143999999999 18.560616 10.122864 18.68616 10.86 18.784104000000003C11.306352 18.843408 12.693648000000001 18.843408 13.14 18.784104000000003C14.649672 18.583488 15.878231999999999 18.198552 17.292 17.48316C19.101888000000002 16.56732 20.874816 15.2346 22.548432000000002 13.531872C23.419152 12.646008 23.519424 12.487800000000002 23.519424 12C23.519424 11.510304 23.41728 11.349696 22.53672 10.454903999999999C20.174568 8.054544 17.583408000000002 6.375672000000001 15.07044 5.61732C14.479848 5.4390719999999995 13.856712000000002 5.309616 13.152000000000001 5.218704C12.801816 5.173536 11.57484 5.152056 11.187048 5.184312M11.772 6.665280000000001C9.892224 6.71124 7.88832 7.417608 5.867208000000001 8.746751999999999C5.002536 9.315384 4.253952 9.89952 3.432 10.646976C2.9851680000000003 11.053296 2.088 11.956512 2.088 12C2.088 12.043368000000001 2.9871119999999998 12.948936 3.42 13.341552C4.797096 14.590560000000002 6.08808 15.491616 7.5 16.189248C8.805311999999999 16.8342 9.960384000000001 17.17932 11.232000000000001 17.304336C11.785584 17.358768 12.664248 17.332079999999998 13.272 17.242368C15.637991999999999 16.893144 18.159216 15.545471999999998 20.592 13.329552000000001C21.040488 12.921047999999999 21.912 12.043224 21.912 12C21.912 11.956776000000001 21.040488 11.078952 20.592 10.670448C19.535784 9.708384 18.48624 8.925552000000001 17.388 8.2806C16.976280000000003 8.038848 16.002288 7.55772 15.612 7.403352000000001C14.27664 6.875159999999999 13.02528 6.6346560000000006 11.772 6.665280000000001M11.544 7.994616C10.323576000000001 8.132832 9.226152 8.828136 8.574624 9.875928C7.57404 11.485056 7.840152 13.601136000000002 9.206952 14.904216C11.070143999999999 16.680552000000002 14.068560000000002 16.304351999999998 15.425544 14.124C16.05096 13.11912 16.200768 11.856576 15.827184 10.739328C15.218088 8.917824000000001 13.441920000000001 7.779648 11.544 7.994616M11.491824000000001 9.527280000000001C11.019912 9.626808 10.621776 9.835104 10.27488 10.164C9.754007999999999 10.657824000000002 9.48 11.289024 9.48 11.995128000000001C9.48 12.659400000000002 9.713472000000001 13.249920000000001 10.164 13.72512C10.65924 14.247504 11.288640000000001 14.52 12 14.52C13.219488 14.52 14.253984 13.660992 14.481984000000002 12.459048C14.629824000000001 11.679696 14.385888000000001 10.854887999999999 13.836 10.27488C13.460184 9.878447999999999 13.023792 9.634224 12.500231999999999 9.527327999999999C12.201288 9.466296 11.781144 9.466272 11.491824000000001 9.527280000000001" stroke="none" fill="currentColor" fillRule="evenodd" strokeWidth="0.024"></path>
</svg>                    </div>
                    <span className="hidden lg:inline">Preview</span>
                </button>
                <button type="button"
                        onClick={toggleWarnings}
                        title="Validation"
                        className={`relative -ml-px inline-flex items-center px-2 xl:px-3 py-1.5 text-xs font-semibold inset-ring-1 inset-ring-gray-300 hover:bg-gray-50 hover:cursor-pointer focus:z-10 transition-colors ${
                          isWarningsVisible
                            ? 'bg-gray-100'
                            : 'bg-white'
                        }`}>
                    <span className="inline-flex items-center justify-center">
                      <div className="size-4 lg:mr-1.5">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" ><path d="M1.9521600000000001 0.480384C1.570008 0.52116 1.2737280000000002 0.6692400000000001 0.970032 0.9712320000000001C0.792312 1.147944 0.733584 1.22568 0.652152 1.3920000000000001C0.597192 1.5042 0.53328 1.6662 0.51012 1.752C0.47028 1.8995760000000002 0.468 2.452632 0.468 12C0.468 21.547368000000002 0.47028 22.100424 0.51012 22.248C0.53328 22.3338 0.597192 22.495800000000003 0.652152 22.608C0.733224 22.773576000000002 0.793104 22.853064 0.970032 23.029968C1.146936 23.206896 1.226424 23.266776 1.3920000000000001 23.347848C1.8018 23.548536 1.3589040000000001 23.532 6.324 23.532C10.626792 23.532 10.743072 23.530824000000003 10.859928 23.485752C11.019264000000002 23.424312 11.212896 23.238312 11.281416 23.080848C11.35536 22.911024 11.357232000000002 22.643112 11.28564 22.48236C11.212488 22.318152 11.030088 22.145688 10.863672000000001 22.083432000000002L10.7262 22.032 6.43224 22.032C3.336384 22.032 2.1219360000000003 22.02456 2.079768 22.00536C2.047608 21.990696 2.009304 21.952392 1.99464 21.920232C1.9566000000000001 21.836712000000002 1.9566000000000001 2.163288 1.99464 2.079768C2.009304 2.047608 2.047608 2.009304 2.079768 1.99464C2.1221520000000003 1.975344 3.859416 1.968 8.390328 1.968C13.771560000000001 1.968 14.6514 1.9728 14.707199999999998 2.0023920000000004C14.758632 2.02968 18.24948 5.500824 18.269280000000002 5.544384C18.272184 5.550768000000001 18.280296 6.317400000000001 18.287280000000003 7.248L18.3 8.94 18.356088 9.048C18.516408000000002 9.35664 18.834336 9.51492 19.169544000000002 9.452952C19.417728 9.407064 19.605696000000002 9.256752 19.718928 9.01356L19.77552 8.892 19.775351999999998 7.152C19.775136000000003 5.197872 19.776912 5.22144 19.604712000000003 4.872C19.504224 4.668048000000001 19.50372 4.66752 17.546088 2.7087120000000002L15.588000000000001 0.749448 15.384 0.6509520000000001C14.96664 0.44947200000000004 15.680064 0.468744 8.508000000000001 0.465192C4.9967999999999995 0.463464 2.046672 0.470304 1.9521600000000001 0.480384M4.690176 5.2093679999999996C4.546968 5.2644720000000005 4.369368 5.426112 4.291416 5.572296000000001C4.21692 5.712024 4.210872 6.085104 4.281 6.216C4.370616 6.383352 4.487544 6.5007600000000005 4.638624 6.5751360000000005L4.788 6.648648 8.28 6.642336L11.772 6.636 11.88 6.571968C12.142944 6.416088 12.273624 6.194304 12.273624 5.904C12.273624 5.599728 12.120887999999999 5.359464 11.844 5.22828L11.700000000000001 5.160048000000001 8.256 5.161272C4.89876 5.162472 4.808928000000001 5.163672 4.690176 5.2093679999999996M4.755336000000001 7.995456C4.556640000000001 8.052864 4.343808 8.249592 4.271568 8.442624C4.1041680000000005 8.890080000000001 4.37124 9.37008 4.834416 9.454152C4.932816 9.472007999999999 6.3498719999999995 9.48 9.42 9.48C12.490128 9.48 13.907184 9.472007999999999 14.005584 9.454152C14.184023999999999 9.421752 14.319768000000002 9.343968 14.443824000000001 9.20304C14.565648000000001 9.064632 14.616072 8.91768 14.61576 8.701728000000001C14.615376000000001 8.41764 14.454264 8.166312 14.188680000000002 8.035512L14.076 7.98 9.456 7.976064C6.527376 7.973592 4.8064800000000005 7.980672 4.755336000000001 7.995456M4.764 10.809576C4.603752 10.86024 4.52328 10.912392 4.408824 11.039712C4.267152 11.197296 4.216104 11.348400000000002 4.227768 11.575824C4.242192 11.857392 4.41036 12.105048 4.665624 12.220608L4.788 12.276 7.692 12.2832C9.798792 12.288408000000002 10.63536 12.28284 10.739328 12.262944000000001C11.140368 12.186143999999999 11.410008 11.783928000000001 11.327592000000001 11.385504000000001C11.271528 11.11452 11.02992 10.858704000000001 10.776 10.801512C10.604448 10.762848 4.887456 10.770528 4.764 10.809576M16.601544 10.801392C13.663056 11.06232 11.278008 13.31124 10.847208 16.227240000000002C10.592112 17.954088 11.050583999999999 19.681776 12.139248 21.096C12.354168 21.375192000000002 12.994584000000001 22.007952000000003 13.272 22.215192000000002C14.232552 22.932816 15.234744 23.34204 16.38228 23.485224000000002C16.750584 23.53116 17.498904 23.537304 17.844 23.4972C19.326648000000002 23.32488 20.622816 22.701576 21.661152 21.661608C22.015104 21.307104000000002 22.192752 21.08952 22.481664 20.656752C22.932216 19.981872 23.274456 19.139952 23.421120000000002 18.345624C23.573184 17.522088 23.561496 16.602719999999998 23.38884 15.806280000000001C23.089872 14.427216000000001 22.32624 13.166544 21.240000000000002 12.258816C19.957536 11.18712 18.260928 10.654032 16.601544 10.801392M16.608 12.31452C15.528984000000001 12.436224000000001 14.491224 12.938544 13.714872 13.714872C12.487992 14.941752 12.015384000000001 16.683696 12.445512 18.393432C12.561672000000002 18.855192000000002 12.830448 19.454616 13.101263999999999 19.855944C13.579368 20.564472 14.262312000000001 21.162167999999998 15.010056 21.526536C16.092024 22.053744 17.286552 22.165632 18.456 21.849312C19.56348 21.549744 20.581584 20.808864 21.22272 19.836000000000002C22.047888 18.583848 22.248816 17.015328 21.766488000000003 15.591287999999999C21.237312000000003 14.029008000000001 19.92492 12.821616 18.332472 12.431952C17.79432 12.300264 17.133408000000003 12.255264 16.608 12.31452M4.8216719999999995 13.607904C4.486176 13.665864 4.224072 13.982424 4.224024 14.329728000000001C4.224 14.416464000000001 4.241352 14.53836 4.262544 14.600567999999999C4.311503999999999 14.744280000000002 4.495344 14.946792 4.6472880000000005 15.024384L4.764 15.084 6.84 15.084L8.916 15.084 9.028632 15.028512C9.500615999999999 14.796047999999999 9.612912 14.178312000000002 9.249288 13.814712000000002C9.197976 13.7634 9.0966 13.6932 9.024000000000001 13.658712000000001L8.892 13.596 6.912 13.592424C5.823 13.590456 4.882344000000001 13.597439999999999 4.8216719999999995 13.607904M19.49784 14.786232C19.443863999999998 14.798928 19.341264 14.84412 19.26984 14.886648000000001C19.1508 14.957568 19.026576000000002 15.11484 17.777376 16.776C17.027952000000003 17.7726 16.404744 18.6042 16.392456 18.624C16.37484 18.65244 16.214784 18.505056 15.631079999999999 17.922864C14.795568 17.089560000000002 14.782079999999999 17.079743999999998 14.472 17.079743999999998C14.256504 17.079743999999998 14.118072000000002 17.133167999999998 13.96284 17.276256C13.813512 17.413895999999998 13.743408000000002 17.565863999999998 13.732152000000001 17.776176C13.71384 18.118296 13.69596 18.093408 14.645064000000001 19.046784C15.259008000000001 19.663512 15.523752 19.913136 15.632040000000002 19.977432C16.164936 20.2938 16.866816 20.232672 17.327351999999998 19.829808C17.410656 19.756944 17.94648 19.063248 18.860568 17.844888C19.633392 16.814808 20.289888 15.9288 20.31948 15.876C20.487696 15.57564 20.421816 15.203376000000002 20.158272 14.965296C19.980312 14.80452 19.72008 14.73396 19.49784 14.786232M4.856663999999999 16.416048C4.619952 16.450704 4.407264 16.606944000000002 4.29216 16.830672C4.214016 16.982616 4.204176 17.251896 4.2703679999999995 17.427288C4.33812 17.606832 4.519512 17.7894 4.6956240000000005 17.855304C4.8226320000000005 17.902824000000003 4.874832 17.904 6.840648 17.904C8.771712 17.904 8.860536000000002 17.902079999999998 8.977152 17.857775999999998C9.507168 17.656392 9.63732 16.979496 9.21876 16.601352C9.088776000000001 16.483895999999998 9.009624 16.446504 8.829191999999999 16.417224C8.651784 16.388424 5.052504 16.387368000000002 4.856663999999999 16.416048" stroke="none" fill="currentColor" fillRule="evenodd" strokeWidth={0.024} /></svg>
                      </div>
                      <span className="hidden lg:inline">Validation</span>
                      {totalCount === 0 ? (
                        <span className="lg:ml-1 inline-flex items-center text-green-600" title="Valid">
                          <div className="size-4">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </span>
                      ) : (
                        <span className="lg:ml-1.5 inline-flex items-center rounded-full px-1.5 py-[1.5px] text-[0.6rem] font-medium bg-red-100 text-red-700">
                          {totalCount}
                        </span>
                      )}
                    </span>
                </button>
                <button type="button"
                        onClick={toggleTestResults}
                        title="Tests"
                        className={`relative -ml-px inline-flex items-center rounded-r-md px-2 xl:px-3 py-1.5 text-xs font-semibold inset-ring-1 inset-ring-gray-300 hover:bg-gray-50 hover:cursor-pointer focus:z-10 transition-colors ${
                          isTestResultsVisible
                            ? 'bg-gray-100'
                            : 'bg-white'
                        }`}>
                    <span className="inline-flex items-center justify-center">
                      <div className="size-4 lg:mr-1.5">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" ><path d="M4.764 0.481416C3.23016 0.49128 2.647344 0.5026320000000001 2.568 0.524208C2.159088 0.635304 1.8360720000000001 0.786504 1.547424 1.001856C1.023912 1.3924320000000001 0.664104 1.969272 0.5418 2.614056C0.507408 2.795376 0.503592 3.499968 0.503592 9.66C0.503592 15.684936 0.50796 16.527552 0.540072 16.696896C0.730176 17.698968 1.464672 18.486743999999998 2.467056 18.763656L2.7 18.828 6.271968 18.834456L9.843960000000001 18.840912 9.9828 18.778608000000002C10.151064 18.70308 10.299024 18.55752 10.371672 18.396C10.446840000000002 18.228816000000002 10.446840000000002 17.963184000000002 10.371672 17.796C10.30812 17.654712 10.154856 17.489088 10.02 17.416008C9.925896 17.365032 9.901392 17.363856000000002 8.778 17.357112L7.632000000000001 17.350224 7.632000000000001 15.287111999999999L7.632000000000001 13.224 9.142824000000001 13.224C10.171776000000001 13.224 10.694208 13.215384 10.780824 13.196976000000001C10.850760000000001 13.182096000000001 10.965744 13.131744 11.036328 13.085088C11.4672 12.800208 11.483808000000002 12.178152 11.068944 11.863416C10.867992000000001 11.710968 10.880952 11.712 9.175632 11.712L7.632000000000001 11.712 7.632000000000001 9.66L7.632000000000001 7.6080000000000005 9.683016 7.6080000000000005L11.734056 7.6080000000000005 11.741016 9.186L11.748000000000001 10.764 11.811624 10.89972C11.886744 11.05992 12.030696 11.207352 12.187368000000001 11.284512C12.35784 11.368488000000001 12.635856 11.36364 12.819408000000001 11.273520000000001C12.992351999999999 11.18856 13.131696 11.037048 13.196760000000001 10.863144C13.247160000000001 10.72848 13.248000000000001 10.700304000000001 13.248000000000001 9.167088L13.248000000000001 7.6080000000000005 15.311328 7.6080000000000005L17.374632 7.6080000000000005 17.381328 8.742L17.388 9.876 17.444015999999998 9.984C17.523096000000002 10.136496 17.674512 10.283952 17.817624 10.347864C17.988648 10.424232 18.252912000000002 10.424448 18.42 10.348343999999999C18.618648 10.257888 18.787560000000003 10.06992 18.843192000000002 9.877392C18.855048 9.836400000000001 18.864384 8.26188 18.864336 6.309336C18.864264 3.226968 18.8598 2.7911520000000003 18.826392 2.615088C18.619536 1.5245760000000002 17.722392 0.6574559999999999 16.643424 0.5052C16.426655999999998 0.474624 8.34024 0.458424 4.764 0.481416M2.94192 1.9945680000000001C2.627208 2.0404560000000003 2.291376 2.28012 2.13768 2.56848C1.99632 2.833704 1.992864 2.881104 1.992408 4.566L1.992 6.096 4.056 6.096L6.12 6.096 6.12 4.032L6.12 1.968 4.602 1.970928C3.7670879999999998 1.9725359999999998 3.020064 1.9831680000000003 2.94192 1.9945680000000001M7.632000000000001 4.032L7.632000000000001 6.096 9.684000000000001 6.096L11.736 6.096 11.736 4.032L11.736 1.968 9.684000000000001 1.968L7.632000000000001 1.968 7.632000000000001 4.032M13.248000000000001 4.032L13.248000000000001 6.096 15.312000000000001 6.096L17.376 6.096 17.375591999999997 4.566C17.375256 3.3297600000000003 17.368560000000002 3.0048 17.340744 2.87352C17.243807999999998 2.4161040000000003 16.864272 2.0593920000000003 16.404 1.993128C16.305768 1.978992 15.615576 1.9687440000000003 14.742 1.96848L13.248000000000001 1.968 13.248000000000001 4.032M1.992 9.66L1.992 11.712 4.056 11.712L6.12 11.712 6.12 9.66L6.12 7.6080000000000005 4.056 7.6080000000000005L1.992 7.6080000000000005 1.992 9.66M16.587264 10.802568C14.096471999999999 11.023992000000002 11.922984 12.754680000000002 11.135184 15.144C10.899912 15.857544 10.816104 16.391616000000003 10.817016 17.172C10.817664 17.747568 10.86348 18.154032 10.983408 18.648C11.612664 21.240000000000002 13.793591999999999 23.175384 16.433136 23.484144C17.049 23.556192000000003 17.892456 23.520599999999998 18.48648 23.397503999999998C19.722672 23.141328 20.911512000000002 22.481544 21.784608000000002 21.567072000000003C22.741560000000003 20.56476 23.31648 19.363272000000002 23.513064 17.954832000000003C23.572152 17.531472 23.565432 16.695024 23.499456000000002 16.26C23.285880000000002 14.852064 22.675608 13.630824 21.696216 12.651408000000002C20.347776 11.302968 18.496152000000002 10.632888 16.587264 10.802568M16.6158 12.31428C16.068408 12.378072000000001 15.513312 12.549528000000002 14.976 12.820800000000002C13.576968 13.52712 12.6408 14.813424 12.368160000000001 16.404C12.303503999999998 16.78116 12.309936 17.5596 12.381 17.961144C12.587184 19.12596 13.180416 20.154888 14.075784 20.90064C14.679048 21.403104000000003 15.44016 21.768432 16.205856 21.923064C17.641920000000002 22.213104 19.113912 21.854112 20.246760000000002 20.9376C21.742056 19.727856000000003 22.381800000000002 17.758584000000003 21.8862 15.891C21.531552 14.554560000000002 20.627712000000002 13.441824 19.392 12.820368C18.836376 12.540936 18.305328 12.379415999999999 17.724 12.313056C17.473656 12.284472000000001 16.86588 12.285143999999999 16.6158 12.31428M1.992408 14.754C1.9927440000000003 15.99024 1.99944 16.3152 2.027256 16.44648C2.128224 16.922976000000002 2.5146 17.272368 3.002568 17.32848C3.1133520000000003 17.341224 3.8600879999999997 17.351712000000003 4.662 17.351808L6.12 17.352 6.12 15.288L6.12 13.224 4.056 13.224L1.992 13.224 1.992408 14.754M19.4592 14.80488C19.38396 14.82972 19.279824 14.883792000000001 19.227768 14.925024C19.173744 14.967792000000001 18.547632 15.78324 17.769408000000002 16.824312000000003L16.40568 18.648648 15.69684 17.943096C15.306984000000002 17.555064 14.9448 17.210976000000002 14.892 17.178456C14.290655999999998 16.808256 13.557552000000001 17.421312 13.803072000000002 18.089088C13.850256000000002 18.21744 13.915439999999998 18.289608 14.661072 19.03896C15.168192000000001 19.548624 15.523224 19.885968000000002 15.616632 19.946904C16.178376 20.313336 16.91628 20.243208 17.401248000000002 19.77732C17.597231999999998 19.58904 20.319096000000002 15.95496 20.387591999999998 15.790104000000001C20.453471999999998 15.631584000000002 20.445696 15.375696 20.369976 15.210312000000002C20.212224000000003 14.86572 19.813008 14.688 19.4592 14.80488" stroke="none" fill="currentColor" fillRule="evenodd" strokeWidth={0.024} /></svg>
                      </div>
                      <span className="hidden lg:inline">Tests</span>
                      {testResults.length > 0 && (
                        hasTestPassed ? (
                          <span className="lg:ml-1.5 inline-flex items-center text-green-600" title="Tests passed">
                            <div className="size-4">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </span>
                        ) : testProblemCount > 0 ? (
                          <span className="lg:ml-1.5 inline-flex items-center rounded-full px-1.5 py-[1.5px] text-[0.6rem] font-medium bg-red-100 text-red-700">
                            {testProblemCount}
                          </span>
                        ) : (
                          <span className="lg:ml-1.5 inline-flex items-center text-red-600" title="Tests failed">
                            <div className="size-4">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </span>
                        )
                      )}
                    </span>
                </button>
              </span>
                </div>


                {/* Action buttons - responsive */}
                <div className="flex flex-row flex-shrink-0 md:flex-1 pr-0 justify-end items-center gap-1 md:gap-2 text-xs">
                    {isEmbeddedMode ? (
                        // Embedded mode: Cancel link, Delete (if enabled), Save (primary)
                        <>
                            <button
                                className="hidden md:block text-sm font-semibold text-gray-900 hover:text-gray-700 hover:cursor-pointer"
                                onClick={handleCancel}
                            >
                                Cancel
                            </button>
                            {editorConfig?.showDelete !== false && (
                                <button
                                    className="hidden md:inline-flex items-center justify-center gap-2 rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-red-600 shadow-xs ring-1 ring-inset ring-red-300 hover:bg-red-50 hover:cursor-pointer"
                                    onClick={handleDelete}
                                >
                                    Delete
                                </button>
                            )}
                            <button
                                className="inline-flex items-center justify-center gap-1 md:gap-2 rounded-md bg-indigo-600 px-2 md:px-3 py-1.5 text-xs font-semibold text-white shadow-sm ring-1 ring-inset ring-indigo-600 hover:bg-indigo-500 hover:cursor-pointer"
                                onClick={handleSave}
                            >
                                {editorConfig?.saveLabel || 'Save'}
                            </button>
                        </>
                    ) : (
                        // Server/Desktop mode: Save button + burger menu
                        <>
                            <button
                                className="inline-flex items-center justify-center gap-1 md:gap-2 rounded-md bg-indigo-600 px-2 md:px-3 py-1.5 text-xs font-semibold text-white shadow-sm ring-1 ring-inset ring-indigo-600 hover:bg-indigo-500"
                                onClick={handleSave}
                            >
                                Save
                            </button>
                            {!isServerMode && (
                                <Menu as="div" className="relative inline-block">
                                  <MenuButton className="inline-flex items-center justify-center rounded-md bg-white px-2 md:px-3 py-1.5 text-xs font-semibold shadow-xs text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                                    <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                  </MenuButton>

                                  <MenuItems
                                    transition
                                    className="absolute right-0 z-10 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg outline outline-1 outline-black/5 transition data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
                                  >
                                    <div className="py-1">
                                      <MenuItem>
                                        <button
                                          onClick={handleNew}
                                          className="group flex w-full items-center px-4 py-2 text-xs text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900 data-[focus]:outline-none"
                                        >
                                          <svg className="mr-3 h-5 w-5 text-gray-400 group-data-[focus]:text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                          </svg>
                                          New
                                        </button>
                                      </MenuItem>
                                      <MenuItem>
                                        <button
                                          onClick={handleExample}
                                          className="group flex w-full items-center px-4 py-2 text-xs text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900 data-[focus]:outline-none"
                                        >
                                          <svg className="mr-3 h-5 w-5 text-gray-400 group-data-[focus]:text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                                          </svg>
                                          Load Example
                                        </button>
                                      </MenuItem>
                                    </div>
                                    <div className="py-1">
                                      <MenuItem>
                                        <button
                                          onClick={handleOpen}
                                          className="group flex w-full items-center px-4 py-2 text-xs text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900 data-[focus]:outline-none"
                                        >
                                          <svg className="mr-3 h-5 w-5 text-gray-400 group-data-[focus]:text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 0 0-1.883 2.542l.857 6a2.25 2.25 0 0 0 2.227 1.932H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-1.883-2.542m-16.5 0V6A2.25 2.25 0 0 1 6 3.75h3.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 0 1.06.44H18A2.25 2.25 0 0 1 20.25 9v.776" />
                                          </svg>
                                          Open
                                        </button>
                                      </MenuItem>
                                      <MenuItem>
                                        <button
                                          onClick={handleSave}
                                          className="group flex w-full items-center px-4 py-2 text-xs text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900 data-[focus]:outline-none"
                                        >
                                          <svg className="mr-3 h-5 w-5 text-gray-400 group-data-[focus]:text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                          </svg>
                                          Save
                                        </button>
                                      </MenuItem>
                                    </div>
                                  </MenuItems>
                                </Menu>
                            )}
                        </>
                    )}
                </div>
                </div>
                </div>
            </nav>
        </>
    );
};

export default Header;
