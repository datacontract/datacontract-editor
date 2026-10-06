import { describe, it, expect } from 'vitest';
import { customPropertiesAnchoredAt, isStandardSectionEmpty } from './customContentAnchors.js';

const TRANSFORM_FIELDS = ['transformSourceObjects', 'transformLogic', 'transformDescription'];

describe('customPropertiesAnchoredAt', () => {
	it('returns the custom properties anchored after any of the given fields', () => {
		const customProperties = [
			{ property: 'lineageNote', positionAfter: 'transformLogic' },
			{ property: 'owner', positionAfter: 'name' },
			{ property: 'unanchored' },
		];
		const result = customPropertiesAnchoredAt(TRANSFORM_FIELDS, customProperties, []);
		expect(result.map((p) => p.property)).toEqual(['lineageNote']);
	});

	it('accepts a single anchor', () => {
		const customProperties = [{ property: 'owner', positionAfter: 'name' }];
		expect(customPropertiesAnchoredAt('name', customProperties, [])).toHaveLength(1);
	});

	it('skips properties that a custom section already renders', () => {
		const customProperties = [{ property: 'lineageNote', positionAfter: 'transformLogic' }];
		const customSections = [{ section: 'lineage', title: 'Lineage', customProperties: ['lineageNote'] }];
		expect(customPropertiesAnchoredAt(TRANSFORM_FIELDS, customProperties, customSections)).toEqual([]);
	});

	it('tolerates missing configs', () => {
		expect(customPropertiesAnchoredAt(TRANSFORM_FIELDS, undefined, undefined)).toEqual([]);
	});
});

describe('isStandardSectionEmpty', () => {
	it('is empty when every field is hidden and nothing is anchored into the section', () => {
		expect(isStandardSectionEmpty([true, true, true], TRANSFORM_FIELDS, [], [])).toBe(true);
	});

	it('is not empty while at least one field is visible', () => {
		expect(isStandardSectionEmpty([true, false, true], TRANSFORM_FIELDS, [], [])).toBe(false);
	});

	it('is not empty when a custom property is anchored after one of its hidden fields', () => {
		const customProperties = [{ property: 'lineageNote', positionAfter: 'transformDescription' }];
		expect(isStandardSectionEmpty([true, true, true], TRANSFORM_FIELDS, customProperties, [])).toBe(false);
	});

	it('is not empty when the anchored custom property belongs to a section rendered elsewhere, but that section is not counted', () => {
		const customProperties = [{ property: 'lineageNote', positionAfter: 'transformDescription' }];
		const customSections = [{ section: 'lineage', title: 'Lineage', customProperties: ['lineageNote'] }];
		expect(isStandardSectionEmpty([true, true, true], TRANSFORM_FIELDS, customProperties, customSections)).toBe(true);
	});

	it('never reports a section without fields as empty', () => {
		expect(isStandardSectionEmpty([], [], [], [])).toBe(false);
	});
});
