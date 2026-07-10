import { useEffect, useId, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import { useTranslation } from 'react-i18next';
import { conf as yamlConf, language as yamlTokens } from 'monaco-editor/esm/vs/basic-languages/yaml/yaml.js';
import { monaco } from '../../lib/monaco-workers.js';
import { parseYaml, stringifyYaml } from '../../utils/yaml.js';

// A dedicated YAML language for free-form value editing. It reuses YAML syntax
// highlighting but is a distinct language id, so none of the data-contract completion
// providers registered on the built-in "yaml" language (monaco-yaml, ODCS schema) apply
// here — no schema suggestions, no "Inline schema" item, no empty "No suggestions" popup.
const OBJECT_YAML_LANGUAGE = 'object-yaml';
if (monaco?.languages && !monaco.languages.getLanguages().some((l) => l.id === OBJECT_YAML_LANGUAGE)) {
  monaco.languages.register({ id: OBJECT_YAML_LANGUAGE });
  monaco.languages.setLanguageConfiguration(OBJECT_YAML_LANGUAGE, yamlConf);
  monaco.languages.setMonarchTokensProvider(OBJECT_YAML_LANGUAGE, yamlTokens);
}

/**
 * ObjectYamlEditor edits a value as free-form YAML using Monaco, with syntax highlighting.
 * It keeps local text so partially-typed / temporarily invalid YAML is not clobbered,
 * parses on every change, and propagates the parsed value once it is valid. Invalid input
 * shows an inline error and leaves the last valid value untouched.
 *
 * The `kind` constrains the accepted shape:
 * - `'object'`: must parse to a YAML mapping
 * - `'array'`: must parse to a YAML sequence
 * - `'yaml'`: any valid YAML (object, list, or scalar); only syntax is validated
 *
 * @param {*} value - The current value
 * @param {Function} onChange - Called with the parsed value when it is valid
 * @param {'object'|'array'|'yaml'} kind - Accepted YAML shape (see above)
 * @param {number} height - Editor height in pixels
 */
const emptyFor = (kind) => (kind === 'array' ? [] : kind === 'yaml' ? undefined : {});

const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

const toYaml = (value, kind) => {
  const v = value == null ? emptyFor(kind) : value;
  // Start empty for empty values so the editor is a clean slate to type into.
  if (v === null || v === undefined) return '';
  if (kind === 'array' && Array.isArray(v) && v.length === 0) return '';
  if (kind === 'object' && isPlainObject(v) && Object.keys(v).length === 0) return '';
  try {
    return stringifyYaml(v).replace(/\n$/, '');
  } catch {
    return '';
  }
};

const ObjectYamlEditor = ({ value, onChange, kind = 'object', height = 180 }) => {
  const { t } = useTranslation();
  const [text, setText] = useState(() => toYaml(value, kind));
  const [error, setError] = useState(null);
  const focusedRef = useRef(false);

  // A unique model path per instance keeps this editor out of the main contract
  // schema's fileMatch, so custom object/array YAML is edited freely without ODCS
  // schema validation squiggles.
  const path = `custom-property-${useId().replace(/[^a-zA-Z0-9]/g, '')}.yaml`;

  // Resync from the value when it changes externally (undo, type switch) and the user
  // is not actively editing — otherwise in-progress text would be clobbered.
  useEffect(() => {
    if (!focusedRef.current) {
      setText(toYaml(value, kind));
      setError(null);
    }
  }, [value, kind]);

  const handleChange = (next) => {
    const nextText = next ?? '';
    setText(nextText);

    if (nextText.trim() === '') {
      setError(null);
      onChange(emptyFor(kind));
      return;
    }

    let parsed;
    try {
      parsed = parseYaml(nextText);
    } catch (e) {
      setError(t('customProperty.yaml.invalid', { message: e.message || 'parse error' }));
      return;
    }

    if (kind === 'array') {
      if (!Array.isArray(parsed)) {
        setError(t('customProperty.yaml.expectedArray'));
        return;
      }
    } else if (kind === 'object') {
      if (!isPlainObject(parsed)) {
        setError(t('customProperty.yaml.expectedObject'));
        return;
      }
    }
    // kind === 'yaml': any valid YAML is accepted; only syntax is validated above.

    setError(null);
    onChange(parsed);
  };

  const handleMount = (editor, monacoInstance) => {
    editor.onDidFocusEditorText(() => {
      focusedRef.current = true;
    });
    editor.onDidBlurEditorText(() => {
      focusedRef.current = false;
    });
    // Swallow the manual "trigger suggestions" shortcut so the empty suggest widget
    // ("No suggestions.") never appears in this free-form editor.
    const noop = () => {};
    editor.addCommand(monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.Space, noop);
    editor.addCommand(monacoInstance.KeyMod.WinCtrl | monacoInstance.KeyCode.Space, noop);
  };

  return (
    <div className={`rounded border overflow-hidden ${error ? 'border-red-400' : 'border-gray-300'}`}>
      <Editor
        height={height}
        language={OBJECT_YAML_LANGUAGE}
        path={path}
        value={text}
        onChange={handleChange}
        onMount={handleMount}
        theme="vs-light"
        options={{
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 12,
          wordWrap: 'on',
          automaticLayout: true,
          tabSize: 2,
          insertSpaces: true,
          lineNumbers: 'on',
          folding: true,
          stickyScroll: { enabled: false },
          scrollbar: { verticalScrollbarSize: 8, horizontalScrollbarSize: 8 },
          // This is free-form YAML, not a data contract — suppress the ODCS schema
          // completions that the global YAML providers would otherwise offer here.
          quickSuggestions: false,
          suggestOnTriggerCharacters: false,
          wordBasedSuggestions: 'off',
          parameterHints: { enabled: false },
        }}
      />
      {error && (
        <div className="px-2 py-1 text-xs text-red-600 bg-red-50 border-t border-red-200">{error}</div>
      )}
    </div>
  );
};

export default ObjectYamlEditor;
