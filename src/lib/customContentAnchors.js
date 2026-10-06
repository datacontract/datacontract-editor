/**
 * Standalone custom properties whose `positionAfter` names one of the given standard fields.
 * Properties grouped into a custom section are rendered by that section instead, even if they
 * also declare `positionAfter` — the section wins.
 *
 * @param {string|string[]} anchors - Standard field name(s) to match against `positionAfter`
 * @param {Array} customProperties - Custom property configs of the level
 * @param {Array} customSections - Custom section configs of the level
 * @returns {Array} The matching custom property configs
 */
export function customPropertiesAnchoredAt(anchors, customProperties = [], customSections = []) {
	const anchorSet = new Set(Array.isArray(anchors) ? anchors : [anchors]);
	const groupedNames = new Set();
	(customSections || []).forEach((section) => {
		(section.customProperties || []).forEach((name) => groupedNames.add(name));
	});
	return (customProperties || []).filter(
		(p) => anchorSet.has(p.positionAfter) && !groupedNames.has(p.property)
	);
}

/**
 * Whether a built-in section has nothing left to show: every standard field in it is hidden and
 * no custom property is anchored after one of those fields.
 *
 * @param {boolean[]} hiddenFlags - Hidden state of each standard field in the section
 * @param {string[]} fieldNames - The standard field names of the section (custom-property anchors)
 * @param {Array} customProperties - Custom property configs of the level
 * @param {Array} customSections - Custom section configs of the level
 * @returns {boolean}
 */
export function isStandardSectionEmpty(hiddenFlags, fieldNames, customProperties = [], customSections = []) {
	if (hiddenFlags.length === 0 || !hiddenFlags.every(Boolean)) return false;
	return customPropertiesAnchoredAt(fieldNames, customProperties, customSections).length === 0;
}
