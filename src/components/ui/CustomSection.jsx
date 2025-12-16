import { useMemo } from 'react';
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import ChevronRightIcon from './icons/ChevronRightIcon';
import CustomPropertyField from './CustomPropertyField';

/**
 * Renders a collapsible section containing custom properties
 *
 * @param {Object} sectionConfig - Section configuration { section, title, customProperties }
 * @param {Array} customPropertyConfigs - All custom property definitions for this level
 * @param {Object} values - Current values keyed by property name
 * @param {Function} onPropertyChange - Change handler (propertyName, value) => void
 * @param {Object} context - Data context for condition evaluation
 * @param {Object} yamlParts - Full YAML data for condition evaluation
 * @param {boolean} defaultOpen - Whether section is open by default
 */
const CustomSection = ({
	sectionConfig,
	customPropertyConfigs,
	values = {},
	onPropertyChange,
	context = {},
	yamlParts = {},
	defaultOpen = false,
}) => {
	const { title, customProperties: propertyNames = [] } = sectionConfig;

	// Get property configs for properties in this section
	const sectionProperties = useMemo(() => {
		return propertyNames
			.map((name) => customPropertyConfigs.find((p) => p.property === name))
			.filter(Boolean);
	}, [propertyNames, customPropertyConfigs]);

	// Don't render if no properties in this section
	if (sectionProperties.length === 0) {
		return null;
	}

	// Build context including current custom property values
	const extendedContext = useMemo(() => ({
		...context,
		...values,
		customProperties: values,
	}), [context, values]);

	return (
		<Disclosure defaultOpen={defaultOpen}>
			{({ open }) => (
				<>
					<DisclosureButton className="flex w-full items-center justify-between rounded bg-gray-50 px-2 py-1 text-left text-xs font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus-visible:ring focus-visible:ring-indigo-500/75">
						<span>{title}</span>
						<ChevronRightIcon
							className={`h-3 w-3 text-gray-500 transition-transform ${open ? 'rotate-90' : ''}`}
						/>
					</DisclosureButton>
					<DisclosurePanel className="px-2 pt-2 pb-1 text-xs text-gray-500 space-y-3">
						{sectionProperties.map((propConfig) => (
							<CustomPropertyField
								key={propConfig.property}
								config={propConfig}
								value={values[propConfig.property]}
								onChange={(val) => onPropertyChange(propConfig.property, val)}
								context={extendedContext}
								yamlParts={yamlParts}
							/>
						))}
					</DisclosurePanel>
				</>
			)}
		</Disclosure>
	);
};

/**
 * Renders multiple custom sections for a level
 *
 * @param {string} level - Level key for customization lookup
 * @param {Array} customSections - Array of section configs
 * @param {Array} customProperties - Array of property configs
 * @param {Object} values - Current custom property values
 * @param {Function} onPropertyChange - Change handler
 * @param {Object} context - Data context for conditions
 * @param {Object} yamlParts - Full YAML data
 */
export const CustomSections = ({
	customSections,
	customProperties,
	values = {},
	onPropertyChange,
	context = {},
	yamlParts = {},
}) => {
	if (!customSections || customSections.length === 0) {
		return null;
	}

	return (
		<>
			{customSections.map((sectionConfig) => (
				<CustomSection
					key={sectionConfig.section}
					sectionConfig={sectionConfig}
					customPropertyConfigs={customProperties}
					values={values}
					onPropertyChange={onPropertyChange}
					context={context}
					yamlParts={yamlParts}
				/>
			))}
		</>
	);
};

/**
 * Renders ungrouped custom properties (not in any section)
 *
 * @param {Array} customProperties - All custom property configs
 * @param {Array} customSections - Section configs (to filter out grouped properties)
 * @param {Object} values - Current values
 * @param {Function} onPropertyChange - Change handler
 * @param {Object} context - Data context
 * @param {Object} yamlParts - Full YAML data
 */
export const UngroupedCustomProperties = ({
	customProperties,
	customSections = [],
	values = {},
	onPropertyChange,
	context = {},
	yamlParts = {},
}) => {
	// Get property names that are in sections
	const groupedNames = useMemo(() => {
		const names = new Set();
		customSections.forEach((section) => {
			(section.customProperties || []).forEach((name) => names.add(name));
		});
		return names;
	}, [customSections]);

	// Filter to ungrouped properties
	const ungroupedProps = useMemo(() => {
		return customProperties.filter((cp) => !groupedNames.has(cp.property));
	}, [customProperties, groupedNames]);

	if (ungroupedProps.length === 0) {
		return null;
	}

	// Build context including current custom property values
	const extendedContext = useMemo(() => ({
		...context,
		...values,
		customProperties: values,
	}), [context, values]);

	return (
		<div className="space-y-3">
			{ungroupedProps.map((propConfig) => (
				<CustomPropertyField
					key={propConfig.property}
					config={propConfig}
					value={values[propConfig.property]}
					onChange={(val) => onPropertyChange(propConfig.property, val)}
					context={extendedContext}
					yamlParts={yamlParts}
				/>
			))}
		</div>
	);
};

export default CustomSection;
