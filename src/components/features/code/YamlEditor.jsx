import { useRef, useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { useLocation } from 'react-router-dom';
import Editor, { DiffEditor } from '@monaco-editor/react';
import { configureMonacoYaml } from 'monaco-yaml';
import { useEditorStore } from '../../../store.js';

// Import Monaco workers setup
import '../../../lib/monaco-workers.js';

const YamlEditor = forwardRef(({ schemaUrl }, ref) => {
		const yaml = useEditorStore((state) => state.yaml);
		const setYaml = useEditorStore((state) => state.setYaml);
    const editorRef = useRef(null);
    const [fetchedSchema, setFetchedSchema] = useState(null);
    const [schemaError, setSchemaError] = useState(null);
    const [showDiff, setShowDiff] = useState(false);
    const [diffRenderSideBySide, setDiffRenderSideBySide] = useState(true);
    const monacoYamlRef = useRef(null);
    const monacoRef = useRef(null);
    const setMarkers = useEditorStore((state) => state.setMarkers);
    const setSchemaInfo = useEditorStore((state) => state.setSchemaInfo);
    const baselineYaml = useEditorStore((state) => state.baselineYaml);
    const location = useLocation();

    const hasChanges = yaml !== baselineYaml;

    const handleEditorDidMount = (editor, monaco) => {
        editorRef.current = editor;
        monacoRef.current = monaco;
        configureEditor(monaco);

        // Listen for marker changes and update the store
        const updateMarkers = () => {
            const model = editor.getModel();
            if (model) {
                const markers = monaco.editor.getModelMarkers({ resource: model.uri });
                setMarkers(markers);
            }
        };

        // Initial marker update
        updateMarkers();

        // Listen for marker changes
        const markerDisposable = monaco.editor.onDidChangeMarkers(() => {
            updateMarkers();
        });

        // Listen for model content changes to trigger validation
        const contentDisposable = editor.onDidChangeModelContent(() => {
            // Defer marker update to allow Monaco's validation to complete
            setTimeout(updateMarkers, 100);
        });

        // Listen for cursor position changes
        const cursorDisposable = editor.onDidChangeCursorPosition((e) => {
            const lineNumber = e.position.lineNumber;
            useEditorStore.setState({ yamlCursorLine: lineNumber });
        });

        // Clean up on unmount
        editor.onDidDispose(() => {
            markerDisposable.dispose();
            contentDisposable.dispose();
            cursorDisposable.dispose();
            setMarkers([]);
        });
    };

    // Fetch schema from URL if provided
    useEffect(() => {
        if (schemaUrl && schemaUrl.trim()) {
            fetch(schemaUrl)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    }
                    return response.json();
                })
                .then(schemaData => {
                    setFetchedSchema(schemaData);
                    setSchemaError(null);
                    setSchemaInfo(schemaUrl, schemaData);
                })
                .catch(error => {
                    setSchemaError(`Failed to load schema: ${error.message}`);
                    setFetchedSchema(null);
                    setSchemaInfo(schemaUrl, null);
                });
        } else {
            setFetchedSchema(null);
            setSchemaError(null);
            setSchemaInfo(null, null);
        }
    }, [schemaUrl, setSchemaInfo]);

    const configureEditor = (monaco) => {
        try {
            // Configure monaco-yaml with JSON Schema validation
            const monacoYaml = configureMonacoYaml(monaco, {
                enableSchemaRequest: true,
                hover: true,
                completion: true,
                validate: true,
                format: true,
                schemas: []
            });

            monacoYamlRef.current = monacoYaml;
        } catch (error) {
            console.warn('Failed to configure monaco-yaml:', error);
        }
    };

    // Validation is handled by monaco-yaml
    const doValidation = async () => {
        // monaco-yaml handles validation automatically
        // This method is kept for compatibility with parent component
        return [];
    };

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
        doValidation,
        getValue: () => editorRef.current?.getModel()?.getValue(),
        setValue: (value) => editorRef.current?.getModel()?.setValue(value),
        revealLine: (lineNumber, column = 1) => {
            if (editorRef.current) {
                editorRef.current.revealLineInCenter(lineNumber);
                editorRef.current.setPosition({ lineNumber, column });
                editorRef.current.focus();
            }
        }
    }));


    const handleChange = (value) => {
        if (setYaml) {
            setYaml(value);
        }
        // monaco-yaml handles validation automatically
    };

    // Update schema when it changes
    useEffect(() => {
        if (monacoYamlRef.current && fetchedSchema) {
            try {
                // Update monaco-yaml schemas
                monacoYamlRef.current.update({
                    enableSchemaRequest: true,
                    hover: true,
                    completion: true,
                    validate: true,
                    format: true,
                    schemas: [
                        {
                            uri: schemaUrl || 'http://myserver/schema.json',
                            fileMatch: ['*'],
                            schema: fetchedSchema
                        }
                    ]
                });
            } catch (error) {
                console.warn('Failed to update schema:', error);
            }
        }
    }, [fetchedSchema, schemaUrl]);

    // Trigger marker update when YAML changes (e.g., from form updates)
    useEffect(() => {
        if (editorRef.current && monacoRef.current) {
            // Wait for Monaco's validation to complete
            setTimeout(() => {
                const model = editorRef.current.getModel();
                if (model) {
                    const markers = monacoRef.current.editor.getModelMarkers({ resource: model.uri });
                    setMarkers(markers);
                }
            }, 200);
        }
    }, [yaml, setMarkers]);

    // Scroll to specific line when requested from navigation
    useEffect(() => {
        const scrollToLine = location.state?.scrollToLine;
        if (scrollToLine && editorRef.current) {
            // Use Monaco editor API to scroll to and reveal the line
            editorRef.current.revealLineInCenter(scrollToLine);
            // Also set cursor position to that line
            editorRef.current.setPosition({ lineNumber: scrollToLine, column: 1 });
            // Focus the editor
            editorRef.current.focus();
        }
    }, [location.state?.scrollToLine]);

    return (
        <div className="h-full w-full flex flex-col">
            {/* Edit / Changes toggle bar */}
            <div className="flex items-center justify-between px-3 py-1.5 bg-gray-100 border-b border-gray-200">
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setShowDiff(false)}
                        className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                            !showDiff
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                    >
                        Edit
                    </button>
                    <button
                        onClick={() => setShowDiff(true)}
                        className={`px-3 py-1 text-xs font-medium rounded transition-colors inline-flex items-center gap-1.5 ${
                            showDiff
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                    >
                        Diff
                        {hasChanges && (
                            <span className="inline-block w-2 h-2 rounded-full bg-amber-500"></span>
                        )}
                    </button>
                </div>
                {showDiff && (
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setDiffRenderSideBySide(true)}
                            className={`px-2 py-0.5 text-xs rounded ${
                                diffRenderSideBySide
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Split
                        </button>
                        <button
                            onClick={() => setDiffRenderSideBySide(false)}
                            className={`px-2 py-0.5 text-xs rounded ${
                                !diffRenderSideBySide
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Unified
                        </button>
                    </div>
                )}
            </div>

            {schemaError && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-2">
                    <div className="flex">
                        <div className="ml-3">
                            <p className="text-sm text-red-700">
                                <strong>Schema Error:</strong> {schemaError}
                            </p>
                        </div>
                    </div>
                </div>
            )}
            <div className="flex-1">
                {showDiff ? (
                    hasChanges ? (
                        <DiffEditor
                            original={baselineYaml || ''}
                            modified={yaml || ''}
                            language="yaml"
                            theme="light"
                            onMount={(editor) => {
                                // Get the modified (right) editor and listen for changes
                                const modifiedEditor = editor.getModifiedEditor();
                                modifiedEditor.onDidChangeModelContent(() => {
                                    const newValue = modifiedEditor.getValue();
                                    if (setYaml && newValue !== yaml) {
                                        setYaml(newValue);
                                    }
                                });
                            }}
                            options={{
                                renderSideBySide: diffRenderSideBySide,
                                minimap: { enabled: false },
                                scrollBeyondLastLine: false,
                                fontSize: 12,
                                lineNumbers: 'on',
                                wordWrap: diffRenderSideBySide ? 'off' : 'on',
                                automaticLayout: true,
                                originalEditable: false,
                                ignoreTrimWhitespace: true,
                                enableSplitViewResizing: true,
                                stickyScroll: { enabled: false },
                            }}
                        />
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-500 bg-gray-50">
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
                                <h3 className="mt-2 text-sm font-medium">No changes</h3>
                                <p className="mt-1 text-sm">Your contract matches the last saved version.</p>
                            </div>
                        </div>
                    )
                ) : (
                    <Editor
                        height="100%"
                        language="yaml"
                        value={yaml || '# Enter your YAML here\n'}
                        onChange={handleChange}
                        onMount={handleEditorDidMount}
                        theme="vs-light"
                        options={{
                            minimap: { enabled: false },
                            scrollBeyondLastLine: false,
                            fontSize: 12,
                            wordWrap: 'on',
                            automaticLayout: true,
                            tabSize: 2,
                            insertSpaces: true,
                            folding: true,
                            lineNumbers: 'on',
                            glyphMargin: true,
                            stickyScroll: {
                                enabled: false,
                            },
                            scrollbar: {
                                verticalScrollbarSize: 8,
                                horizontalScrollbarSize: 8
                            }
                        }}
                    />
                )}
            </div>
        </div>
    );
});

YamlEditor.displayName = 'YamlEditor';

export default YamlEditor;
