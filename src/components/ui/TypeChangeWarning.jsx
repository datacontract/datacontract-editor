import { useTranslation } from 'react-i18next';

/**
 * Inline confirmation shown before a destructive type change that would clear the
 * current value. The caller keeps the change pending until onConfirm is invoked.
 *
 * @param {string} targetType - The type being switched to (shown in the message)
 * @param {Function} onConfirm - Apply the type change
 * @param {Function} onCancel - Dismiss without changing the type
 */
const TypeChangeWarning = ({ targetType, onConfirm, onCancel }) => {
  const { t } = useTranslation();

  return (
    <div className="rounded border border-amber-300 bg-amber-50 px-2 py-1.5 text-xs text-amber-800">
      <div className="flex items-start gap-1.5">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-3.5 w-3.5 shrink-0 mt-0.5 text-amber-500"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
        <span>{t('customProperty.typeChangeWarning.message', { type: targetType })}</span>
      </div>
      <div className="mt-1.5 flex items-center gap-2">
        <button
          type="button"
          onClick={onConfirm}
          className="rounded bg-amber-600 px-2 py-0.5 text-xs font-medium text-white hover:bg-amber-700"
        >
          {t('customProperty.typeChangeWarning.confirm')}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-xs font-medium text-gray-600 hover:text-gray-800"
        >
          {t('customProperty.typeChangeWarning.cancel')}
        </button>
      </div>
    </div>
  );
};

export default TypeChangeWarning;
