import { useTranslation } from 'react-i18next';
import LogicalTypeCombobox from './LogicalTypeCombobox';
import PhysicalTypeCombobox from './PhysicalTypeCombobox';

/**
 * TypeSelectorPopover - Content for the type selector popover
 * Contains both logical and physical type selectors
 */
const TypeSelectorPopover = ({
  logicalType,
  onLogicalTypeChange,
  physicalType,
  onPhysicalTypeChange,
  serverType,
  disabled = false,
  fallbackLogicalType = null,
}) => {
  const { t } = useTranslation();
  return (
    <div className="p-4 space-y-4 min-w-[280px]">
      <LogicalTypeCombobox
        value={logicalType}
        onChange={onLogicalTypeChange}
        disabled={disabled}
        label={t("schema.field.logicalType.label")}
        fallbackValue={fallbackLogicalType}
      />
      <PhysicalTypeCombobox
        value={physicalType}
        onChange={onPhysicalTypeChange}
        serverType={serverType}
        logicalType={logicalType || fallbackLogicalType}
        disabled={disabled}
        label={t("schema.field.physicalType.label")}
        placeholder="e.g., VARCHAR(255)"
      />
    </div>
  );
};

export default TypeSelectorPopover;
