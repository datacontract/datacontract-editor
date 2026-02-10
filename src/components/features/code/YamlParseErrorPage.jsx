import { useEditorStore } from '../../../store.js';

const YamlParseErrorPage = ({ onSwitchToYaml }) => {
    const yamlParseError = useEditorStore((state) => state.yamlParseError);

    return (
        <div className="h-full flex items-center justify-center bg-gray-50">
            <div className="text-center max-w-md px-6">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                    <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                    </svg>
                </div>
                <h3 className="mt-3 text-sm font-semibold text-gray-900">YAML parse error</h3>
                <p className="mt-1 text-sm text-gray-500">
                    The YAML contains syntax errors and cannot be parsed. The form is unavailable until the errors are fixed.
                </p>
                {yamlParseError && (
                    <p className="mt-3 rounded bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700 font-mono text-left break-words">
                        {yamlParseError}
                    </p>
                )}
                <button
                    onClick={onSwitchToYaml}
                    className="mt-4 inline-flex items-center gap-1.5 rounded bg-white px-3 py-1.5 text-sm font-medium text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                >
                    Go to YAML view
                </button>
            </div>
        </div>
    );
};

export default YamlParseErrorPage;
