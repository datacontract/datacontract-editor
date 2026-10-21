import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import StableIdField from './StableIdField.jsx';
import { useIsStableIdShown } from '../../hooks/useStableId.js';

const SlidersIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0" />
    <circle cx="16" cy="6" r="2" />
    <circle cx="10" cy="12" r="2" />
    <circle cx="18" cy="18" r="2" />
  </svg>
);

/**
 * Stable id for an item edited as a single inline row (enum values, synonyms, context entries).
 * Such rows have no expanded view to hold an "Advanced" section, so the row gets a small
 * "Advanced" button that reveals the id field below it. [children] renders the row and receives
 * that button (null when the loaded ODCS version has no id here) to place next to its own actions.
 *
 * Takes the same props as StableIdField.
 */
const StableIdRow = ({ children, ...fieldProps }) => {
  const { t } = useTranslation();
  const shown = useIsStableIdShown(fieldProps.definition, fieldProps.customizationLevel, fieldProps.path);
  const [open, setOpen] = useState(false);

  const advancedButton = shown ? (
    <button
      type="button"
      onClick={() => setOpen(!open)}
      aria-expanded={open}
      className={`relative p-1.5 cursor-pointer border rounded transition-colors flex-shrink-0 ${open ? 'text-indigo-600 border-indigo-300 bg-indigo-50' : 'text-gray-400 border-gray-300 hover:text-indigo-600 hover:border-indigo-300'}`}
      title={t('stableId.advanced')}
      aria-label={t('stableId.advanced')}
    >
      <SlidersIcon className="h-4 w-4" />
      {fieldProps.value && !open && (
        <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-indigo-500" />
      )}
    </button>
  ) : null;

  return (
    <div className="space-y-2">
      {children(advancedButton)}
      {shown && open && (
        <div className="ml-2 pl-2 border-l-2 border-gray-200">
          <StableIdField {...fieldProps} />
        </div>
      )}
    </div>
  );
};

export default StableIdRow;
