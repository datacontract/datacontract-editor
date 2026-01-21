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
  logicalTypeFromDefinition = null,
}) => {
  return (
    <div className="p-4 space-y-4 min-w-[280px]">
      <LogicalTypeCombobox
        value={logicalType}
        onChange={onLogicalTypeChange}
        disabled={disabled}
        label="Logical Type"
        valueFromDefinition={logicalTypeFromDefinition}
      />
      <PhysicalTypeCombobox
        value={physicalType}
        onChange={onPhysicalTypeChange}
        serverType={serverType}
        logicalType={logicalType}
        disabled={disabled}
        label="Physical Type"
        placeholder="e.g., VARCHAR(255)"
      />
    </div>
  );
};

export default TypeSelectorPopover;
