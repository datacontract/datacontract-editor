import { useMemo } from 'react';
import { useEditorStore } from '../store';

/**
 * Convert standardProperties from object format to array format
 * Object format: { "status": { "enum": [...] } }
 * Array format: [{ "property": "status", "enum": [...] }]
 */
function normalizeStandardProperties(standardProperties) {
	if (!standardProperties) return [];
	if (Array.isArray(standardProperties)) return standardProperties;
	return Object.entries(standardProperties).map(([property, config]) => ({
		property,
		...config,
	}));
}

/**
 * Hook to access customization config for a specific level
 * @param {string} level - Level key (e.g., 'root', 'schema', 'schema.properties')
 * @returns {Object} { standardProperties, customProperties, customSections }
 */
export function useCustomization(level) {
	const customizations = useEditorStore((state) => state.editorConfig?.customizations);

	return useMemo(() => {
		const levelConfig = customizations?.dataContract?.[level] || {};
		return {
			standardProperties: normalizeStandardProperties(levelConfig.standardProperties),
			customProperties: levelConfig.customProperties || [],
			customSections: levelConfig.customSections || [],
		};
	}, [customizations, level]);
}

/**
 * Get standard property overrides for a specific property
 * @param {string} level - Level key
 * @param {string} propertyName - Property name
 * @returns {Object|null} Override config or null
 */
export function useStandardPropertyOverride(level, propertyName) {
	const { standardProperties } = useCustomization(level);
	return useMemo(
		() => standardProperties.find((p) => p.property === propertyName) || null,
		[standardProperties, propertyName]
	);
}

/**
 * Check if a standard property is hidden
 * @param {string} level - Level key
 * @param {string} propertyName - Property name
 * @returns {boolean}
 */
export function useIsPropertyHidden(level, propertyName) {
	const override = useStandardPropertyOverride(level, propertyName);
	return override?.hidden === true;
}

/**
 * Get all hidden property names for a level
 * @param {string} level - Level key
 * @returns {string[]} Array of hidden property names
 */
export function useHiddenProperties(level) {
	const { standardProperties } = useCustomization(level);
	return useMemo(
		() => standardProperties.filter((p) => p.hidden === true).map((p) => p.property),
		[standardProperties]
	);
}

/**
 * Get custom properties that are not assigned to any section
 * @param {string} level - Level key
 * @returns {Object[]} Array of ungrouped custom property configs
 */
export function useUngroupedCustomProperties(level) {
	const { customProperties, customSections } = useCustomization(level);

	return useMemo(() => {
		// Get all property names that are in sections
		const groupedPropertyNames = new Set();
		customSections.forEach((section) => {
			(section.customProperties || []).forEach((name) => groupedPropertyNames.add(name));
		});

		// Return properties not in any section
		return customProperties.filter((cp) => !groupedPropertyNames.has(cp.property));
	}, [customProperties, customSections]);
}

/**
 * Convert enum config to combobox options format
 * @param {Array} enumConfig - Array of strings or { value, label/title } objects
 * @returns {Array} Array of { id, name } objects for ValidatedCombobox
 */
export function convertEnumToOptions(enumConfig) {
	if (!enumConfig || !Array.isArray(enumConfig)) return null;

	return enumConfig.map((item) => {
		if (typeof item === 'string') {
			return { id: item, name: item };
		}
		return { id: item.value, name: item.label || item.title || item.value };
	});
}

/**
 * Apply standard property overrides to field props
 * @param {Object} override - Override config from useStandardPropertyOverride
 * @param {Object} defaults - Default field props
 * @returns {Object} Merged field props
 */
export function applyOverrides(override, defaults = {}) {
	if (!override) return defaults;

	return {
		label: override.title || defaults.label,
		tooltip: override.description || defaults.tooltip,
		placeholder: override.placeholder || defaults.placeholder,
		required: override.required ?? defaults.required,
		options: convertEnumToOptions(override.enum) || defaults.options,
		pattern: override.pattern || defaults.pattern,
		patternMessage: override.patternMessage || defaults.patternMessage,
		defaultValue: override.default ?? defaults.defaultValue,
	};
}
