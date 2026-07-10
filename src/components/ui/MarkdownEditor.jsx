import { useRef, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
      errors.push(t('input.required'));
    }
    if (trimmed !== '' && minLength !== undefined && trimmed.length < minLength) {
      errors.push(t('input.minLength', { min: minLength, current: trimmed.length }));
    }
    if (trimmed !== '' && maxLength !== undefined && trimmed.length > maxLength) {
      errors.push(t('input.maxLength', { max: maxLength, current: trimmed.length }));
    }
    return errors;
  }, [trimmed, required, minLength, maxLength, t]);

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

    // EasyMDE keeps its own buffer, so typing stays responsive either way;
    // the store commit re-serializes the whole document, so debounce it and
    // flush on blur/unmount instead of committing per keystroke
    let commitTimer = null;
    const commit = () => {
      commitTimer = null;
      const newValue = easyMDE.value();
      isInternalChange.current = true;
      onChangeRef.current(newValue);
    };
    const flushCommit = () => {
      if (commitTimer !== null) {
        clearTimeout(commitTimer);
        commit();
      }
    };

    easyMDE.codemirror.on('change', () => {
      if (commitTimer !== null) clearTimeout(commitTimer);
      commitTimer = setTimeout(commit, 300);
    });
    easyMDE.codemirror.on('blur', flushCommit);

    easyMDERef.current = easyMDE;

    return () => {
      flushCommit();
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
            <span className="text-xs leading-4 text-gray-500">{t('input.requiredLabel')}</span>
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
