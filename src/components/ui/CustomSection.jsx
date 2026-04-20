import { useEffect, useMemo } from 'react';
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import ChevronRightIcon from './icons/ChevronRightIcon';
import CustomPropertyField from './CustomPropertyField';

/**
 * Renders a collapsible section containing custom properties
 *
 * @param {Object} sectionConfig - Section configuration { section, title, customProperties, expanded }
 * @param {Array} customPropertyConfigs - All custom property definitions for this level
 * @param {Object} values - Current values keyed by property name
 * @param {Function} onPropertyChange - Change handler (propertyName, value) => void
 * @param {Object} context - Data context for condition evaluation
 * @param {Object} yamlParts - Full YAML data for condition evaluation
 */
const CustomSection = ({
	sectionConfig,
	customPropertyConfigs,
	values = {},
	onPropertyChange,
	context = {},
	yamlParts = {},
	validationKeyPrefix,
	validationSection,
}) => {
	const { title, description, customProperties: propertyNames = [], expanded = false } = sectionConfig;

	// Get property configs for properties in this section
	const sectionProperties = useMemo(() => {
		return propertyNames
			.map((name) => customPropertyConfigs.find((p) => p.property === name))
			.filter(Boolean);
	}, [propertyNames, customPropertyConfigs]);

	// Warn once per render when a section references custom property names that
	// do not resolve — otherwise the section silently disappears and the bug is
	// hard to diagnose.
	useEffect(() => {
		const unresolved = propertyNames.filter(
			(name) => !customPropertyConfigs.find((p) => p.property === name)
		);
		if (unresolved.length > 0) {
			const available = customPropertyConfigs.map((p) => p.property).join(', ') || '(none)';
			console.warn(
				`[Customization] customSection "${sectionConfig.section}" references unknown customProperties: ${unresolved.join(', ')}. Available: ${available}`
			);
		}
	}, [propertyNames, customPropertyConfigs, sectionConfig.section]);

	// Don't render if no properties in this section
	if (sectionProperties.length === 0) {
		return null;
	}

	// Auto-expand if any property in the section is required
	const hasRequiredField = useMemo(() => {
		return sectionProperties.some((p) => p.required);
	}, [sectionProperties]);

	// Build context including current custom property values
	const extendedContext = useMemo(() => ({
		...context,
		...values,
		customProperties: values,
	}), [context, values]);

	return (
		<Disclosure defaultOpen={expanded || hasRequiredField}>
			{({ open }) => (
				<>
					<DisclosureButton className="flex w-full items-center justify-between rounded bg-gray-50 px-2 py-1 text-left text-xs font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus-visible:ring focus-visible:ring-indigo-500/75">
						<span>{title}</span>
						<ChevronRightIcon
							className={`h-3 w-3 text-gray-500 transition-transform ${open ? 'rotate-90' : ''}`}
						/>
					</DisclosureButton>
					<DisclosurePanel className="px-2 pb-1 text-xs text-gray-500 space-y-3">
						{description && (
							<p className="mt-1 text-xs leading-4 text-gray-500">{description}</p>
						)}
						{sectionProperties.map((propConfig) => (
							<CustomPropertyField
								key={propConfig.property}
								config={propConfig}
								value={values[propConfig.property]}
								onChange={(val) => onPropertyChange(propConfig.property, val)}
								context={extendedContext}
								yamlParts={yamlParts}
								validationKey={validationKeyPrefix ? `${validationKeyPrefix}.custom.${propConfig.property}` : undefined}
								validationSection={validationSection}
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
	validationKeyPrefix,
	validationSection,
}) => {
	// Sections with positionAfter are rendered inline via CustomContentAfter;
	// the fallback wrapper only emits sections without an anchor.
	const unanchored = useMemo(
		() => (customSections || []).filter((s) => !s.positionAfter),
		[customSections]
	);

	if (unanchored.length === 0) {
		return null;
	}

	return (
		<>
			{unanchored.map((sectionConfig) => (
				<CustomSection
					key={sectionConfig.section}
					sectionConfig={sectionConfig}
					customPropertyConfigs={customProperties}
					values={values}
					onPropertyChange={onPropertyChange}
					context={context}
					yamlParts={yamlParts}
					validationKeyPrefix={validationKeyPrefix}
					validationSection={validationSection}
				/>
			))}
		</>
	);
};

/**
 * Renders custom sections and/or ungrouped custom properties whose
 * `positionAfter` matches the given anchor.
 *
 * The `only` prop disambiguates placement: `customProperties` anchor to
 * field names (inline between standard fields inside a parent section), while
 * `customSections` anchor to section identifiers (between top-level sections).
 * Passing `only="properties"` at a field anchor and `only="sections"` at a
 * section anchor keeps that contract explicit even if a user misconfigures.
 *
 * @param {string} anchor - The positionAfter value to match
 * @param {"properties"|"sections"|"both"} [only="both"] - Which kind to render
 * @param {Array} customSections - All section configs for the level
 * @param {Array} customProperties - All custom property configs for the level
 * @param {Object} values - Current custom property values
 * @param {Function} onPropertyChange - Change handler
 * @param {Object} context - Data context for conditions
 * @param {Object} yamlParts - Full YAML data
 */
export const CustomContentAfter = ({
	anchor,
	only = 'both',
	customSections = [],
	customProperties = [],
	values = {},
	onPropertyChange,
	context = {},
	yamlParts = {},
	validationKeyPrefix,
	validationSection,
}) => {
	const extendedContext = useMemo(() => ({
		...context,
		...values,
		customProperties: values,
	}), [context, values]);

	const sectionsAfter = useMemo(() => {
		if (only === 'properties') return [];
		return (customSections || []).filter((s) => s.positionAfter === anchor);
	}, [customSections, anchor, only]);

	// Standalone custom properties anchored here. Properties assigned to a
	// section are rendered via that section instead, even if they also declare
	// positionAfter — the section wins.
	const propertiesAfter = useMemo(() => {
		if (only === 'sections') return [];
		const groupedNames = new Set();
		(customSections || []).forEach((s) => {
			(s.customProperties || []).forEach((n) => groupedNames.add(n));
		});
		return (customProperties || []).filter(
			(p) => p.positionAfter === anchor && !groupedNames.has(p.property)
		);
	}, [customProperties, customSections, anchor, only]);

	if (sectionsAfter.length === 0 && propertiesAfter.length === 0) {
		return null;
	}

	return (
		<>
			{sectionsAfter.map((sectionConfig) => (
				<CustomSection
					key={sectionConfig.section}
					sectionConfig={sectionConfig}
					customPropertyConfigs={customProperties}
					values={values}
					onPropertyChange={onPropertyChange}
					context={context}
					yamlParts={yamlParts}
					validationKeyPrefix={validationKeyPrefix}
					validationSection={validationSection}
				/>
			))}
			{propertiesAfter.map((propConfig) => (
				<CustomPropertyField
					key={propConfig.property}
					config={propConfig}
					value={values[propConfig.property]}
					onChange={(val) => onPropertyChange(propConfig.property, val)}
					context={extendedContext}
					yamlParts={yamlParts}
					validationKey={validationKeyPrefix ? `${validationKeyPrefix}.custom.${propConfig.property}` : undefined}
					validationSection={validationSection}
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
	validationKeyPrefix,
	validationSection,
}) => {
	// Get property names that are in sections
	const groupedNames = useMemo(() => {
		const names = new Set();
		customSections.forEach((section) => {
			(section.customProperties || []).forEach((name) => names.add(name));
		});
		return names;
	}, [customSections]);

	// Filter to ungrouped properties. Properties with positionAfter are
	// rendered inline via CustomContentAfter and must be excluded here to
	// avoid double-rendering.
	const ungroupedProps = useMemo(() => {
		return customProperties.filter(
			(cp) => !groupedNames.has(cp.property) && !cp.positionAfter
		);
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
					validationKey={validationKeyPrefix ? `${validationKeyPrefix}.custom.${propConfig.property}` : undefined}
					validationSection={validationSection}
				/>
			))}
		</div>
	);
};

export default CustomSection;
