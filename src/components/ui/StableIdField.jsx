import { useTranslation } from 'react-i18next';
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import ChevronRightIcon from './icons/ChevronRightIcon.jsx';
import ValidatedInput from './ValidatedInput.jsx';
import { useStandardPropertyOverride } from '../../hooks/useCustomization.js';
import { useIsStableIdShown, useStableIdInfo } from '../../hooks/useStableId.js';

/**
 * Input for an ODCS stable id. Its hint and pattern come from the loaded JSON schema, so they
 * follow the contract's ODCS version. Renders nothing when that version has no id here.
 *
 * @param {string} definition - ODCS `$defs` name (e.g. 'Server', 'DataQuality') or editor context
 * @param {string} [path='id'] - Path to the id below [definition], for ids nested in arrays
 * @param {string} [customizationLevel] - Customization level that may hide or override the field
 * @param {string[]} [siblingIds] - Ids of the other items in the same array, for the uniqueness check
 * @param {Function} onChange - Called with the new id, or undefined when the field is cleared
 */
const StableIdField = ({ name, value, onChange, definition, path = 'id', customizationLevel, siblingIds = [] }) => {
  const { t } = useTranslation();
  const info = useStableIdInfo(definition, path);
  const override = useStandardPropertyOverride(customizationLevel, 'id');

  if (!info || override?.hidden === true) return null;

  const isDuplicate = !!value && siblingIds.includes(value);

  return (
    <ValidatedInput
      name={name}
      label={override?.title || t('stableId.label')}
      value={value || ''}
      onChange={(e) => onChange(e.target.value || undefined)}
      required={override?.required ?? false}
      hint={override?.description || info.description}
      placeholder={override?.placeholder}
      pattern={override?.pattern || info.pattern}
      patternMessage={override?.patternMessage || t('stableId.patternMessage')}
      minLength={override?.minLength}
      maxLength={override?.maxLength}
      externalErrors={isDuplicate ? [t('stableId.duplicate')] : []}
      className="font-mono"
    />
  );
};

/**
 * Collapsed "Advanced" section holding the stable id of an item that has no advanced area of its
 * own. Renders nothing when the id is not shown, so no empty section appears.
 */
export const StableIdAdvancedSection = ({ className = '', ...fieldProps }) => {
  const { t } = useTranslation();
  const shown = useIsStableIdShown(fieldProps.definition, fieldProps.customizationLevel, fieldProps.path);
  if (!shown) return null;

  return (
    <Disclosure as="div" className={className}>
      {({ open }) => (
        <>
          <DisclosureButton className="flex w-full items-center justify-between rounded bg-gray-50 px-2 py-1 text-left text-xs font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus-visible:ring focus-visible:ring-indigo-500/75">
            <span className="flex items-center gap-1.5">
              <span>{t('stableId.advanced')}</span>
              {fieldProps.value && (
                <span className="rounded-full bg-indigo-100 px-1.5 text-[10px] font-semibold leading-4 text-indigo-700">1</span>
              )}
            </span>
            <ChevronRightIcon className={`h-3 w-3 text-gray-500 transition-transform ${open ? 'rotate-90' : ''}`} />
          </DisclosureButton>
          <DisclosurePanel className="px-2 pt-2 pb-1">
            <StableIdField {...fieldProps} />
          </DisclosurePanel>
        </>
      )}
    </Disclosure>
  );
};

export default StableIdField;
