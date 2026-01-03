import { useState } from 'react';
import SparklesIcon from './icons/SparklesIcon.jsx';
import { useEditorStore } from '../../store.js';
import { useAiFieldSuggestion } from '../../hooks/useAiFieldSuggestion.js';
import Tooltip from './Tooltip.jsx';

/**
 * SparkleButton - AI suggestion button for form fields
 *
 * @param {object} props
 * @param {string} props.fieldName - Human-readable field name (e.g., "Purpose")
 * @param {string} props.fieldPath - YAML path (e.g., "description.purpose")
 * @param {string} props.currentValue - Current field value
 * @param {function} props.onSuggestion - Callback when suggestion is generated
 * @param {string} props.placeholder - Example placeholder for the field
 * @param {string} props.className - Additional CSS classes
 */
export default function SparkleButton({
  fieldName,
  fieldPath,
  currentValue,
  onSuggestion,
  placeholder,
  className = '',
}) {
  const editorConfig = useEditorStore((state) => state.editorConfig);
  const aiEnabled = editorConfig?.ai?.enabled;

  const { suggest, isLoading, error } = useAiFieldSuggestion({
    fieldName,
    fieldPath,
    placeholder,
  });

  const handleClick = async () => {
    const suggestion = await suggest(currentValue);
    if (suggestion && onSuggestion) {
      onSuggestion(suggestion);
    }
  };

  // Don't render if AI is not enabled
  if (!aiEnabled) {
    return null;
  }

  return (
    <Tooltip content={error || `Generate ${fieldName} with AI`}>
      <button
        type="button"
        onClick={handleClick}
        disabled={isLoading}
        className={`inline-flex items-center justify-center p-1 rounded-md transition-colors
          ${isLoading
            ? 'text-indigo-400 cursor-wait'
            : 'text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50'
          }
          ${error ? 'text-red-400 hover:text-red-600' : ''}
          ${className}`}
        aria-label={`Generate ${fieldName} with AI`}
      >
        <SparklesIcon
          className={`h-4 w-4 ${isLoading ? 'animate-pulse' : ''}`}
        />
      </button>
    </Tooltip>
  );
}
