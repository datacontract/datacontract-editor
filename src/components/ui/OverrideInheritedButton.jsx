import { useTranslation } from 'react-i18next';
import Tooltip from './Tooltip.jsx';

/**
 * Copies a value inherited from a semantic definition into the field, so the
 * user can edit it instead of retyping it. The inherited value is shown as the
 * field's placeholder, which browsers don't let you select or copy.
 *
 * Renders nothing when there is no inherited value.
 */
const OverrideInheritedButton = ({ inheritedValue, onOverride }) => {
  const { t } = useTranslation();

  if (!inheritedValue) {
    return null;
  }

  return (
    <Tooltip content={t('input.overrideInheritedTooltip')}>
      <button
        type="button"
        onClick={() => onOverride(inheritedValue)}
        className="text-xs font-medium leading-4 text-blue-500 hover:text-blue-700"
      >
        {t('input.overrideInherited')}
      </button>
    </Tooltip>
  );
};

export default OverrideInheritedButton;
