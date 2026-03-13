import { useRef, useEffect, useMemo } from 'react';
import EasyMDE from 'easymde';
import 'easymde/dist/easymde.min.css';
import Tooltip from './Tooltip.jsx';
import QuestionMarkCircleIcon from './icons/QuestionMarkCircleIcon.jsx';

const MarkdownEditor = ({
  name,
  label,
  value,
  onChange,
  required = false,
  tooltip,
  placeholder,
  minLength,
  maxLength,
  actions,
  className = '',
}) => {
  const editorRef = useRef(null);
  const easyMDERef = useRef(null);
  const onChangeRef = useRef(onChange);
  const isInternalChange = useRef(false);

  onChangeRef.current = onChange;

  const strValue = value || '';
  const trimmed = strValue.trim();

  const errorMessages = useMemo(() => {
    const errors = [];
    if (required && trimmed === '') {
      errors.push('This field is required');
    }
    if (trimmed !== '' && minLength !== undefined && trimmed.length < minLength) {
      errors.push(`Minimum length is ${minLength} (currently ${trimmed.length})`);
    }
    if (trimmed !== '' && maxLength !== undefined && trimmed.length > maxLength) {
      errors.push(`Maximum length is ${maxLength} (currently ${trimmed.length})`);
    }
    return errors;
  }, [trimmed, required, minLength, maxLength]);

  const hasError = errorMessages.length > 0;

  useEffect(() => {
    if (!editorRef.current) return;

    const easyMDE = new EasyMDE({
      element: editorRef.current,
      initialValue: strValue,
      placeholder: placeholder || '',
      spellChecker: false,
      status: false,
      autoDownloadFontAwesome: true,
      toolbar: [
        'bold', 'italic', 'heading', '|',
        'quote', 'unordered-list', 'ordered-list', '|',
        'link', 'image', '|',
        'preview', 'side-by-side', 'fullscreen', '|',
        'guide',
      ],
      sideBySideFullscreen: false,
      minHeight: '80px',
      maxHeight: '150px',
    });

    easyMDE.codemirror.on('change', () => {
      const newValue = easyMDE.value();
      isInternalChange.current = true;
      onChangeRef.current(newValue);
    });

    easyMDERef.current = easyMDE;

    return () => {
      easyMDE.toTextArea();
      easyMDE.cleanup();
      easyMDERef.current = null;
    };
  }, []);

  // Sync external value changes (e.g. from AI suggestions)
  useEffect(() => {
    if (isInternalChange.current) {
      isInternalChange.current = false;
      return;
    }
    if (easyMDERef.current && easyMDERef.current.value() !== strValue) {
      easyMDERef.current.value(strValue);
    }
  }, [strValue]);

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1">
          <label htmlFor={name} className="block text-xs font-medium leading-4 text-gray-900">
            {label}
          </label>
          {tooltip && (
            <Tooltip content={tooltip}>
              <QuestionMarkCircleIcon />
            </Tooltip>
          )}
        </div>
        <div className="flex items-center gap-2">
          {actions}
          {required && (
            <span className="text-xs leading-4 text-gray-500">Required</span>
          )}
        </div>
      </div>
      <div className={`easymde-wrapper ${hasError ? 'easymde-error' : ''}`}>
        <textarea ref={editorRef} id={name} name={name} />
      </div>
      {hasError && errorMessages.map((message, idx) => (
        <p key={idx} id={`${name}-error`} className="mt-1 text-xs text-red-600">
          {message}
        </p>
      ))}
    </div>
  );
};

MarkdownEditor.displayName = 'MarkdownEditor';

export default MarkdownEditor;
