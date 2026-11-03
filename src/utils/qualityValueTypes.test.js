import { describe, it, expect } from 'vitest';
import { coerceValuesToLogicalType } from './qualityValueTypes.js';

describe('coerceValuesToLogicalType', () => {
	it('turns lines into numbers for an integer property', () => {
		expect(coerceValuesToLogicalType(['1', ' 2 ', '-3', '+4'], 'integer')).toEqual([1, 2, -3, 4]);
	});

	it('keeps lines that are not integers on an integer property', () => {
		expect(coerceValuesToLogicalType(['1.5', 'abc', '', '1e3'], 'integer')).toEqual(['1.5', 'abc', '', '1e3']);
	});

	it('keeps an integer beyond the safe range as text', () => {
		expect(coerceValuesToLogicalType(['12345678901234567890'], 'integer')).toEqual(['12345678901234567890']);
	});

	it('turns lines into numbers for a number property', () => {
		expect(coerceValuesToLogicalType(['1', '1.5', '-.5', '2e3', '10.'], 'number')).toEqual([1, 1.5, -0.5, 2000, 10]);
	});

	it('keeps lines that are not numbers on a number property', () => {
		expect(coerceValuesToLogicalType(['abc', '1,5', 'Infinity', 'NaN', ''], 'number')).toEqual(['abc', '1,5', 'Infinity', 'NaN', '']);
	});

	it('turns true and false into booleans for a boolean property', () => {
		expect(coerceValuesToLogicalType(['true', 'False', ' TRUE '], 'boolean')).toEqual([true, false, true]);
	});

	it('keeps other lines on a boolean property', () => {
		expect(coerceValuesToLogicalType(['yes', '1', ''], 'boolean')).toEqual(['yes', '1', '']);
	});

	it('keeps every line as text for string, date and other types', () => {
		expect(coerceValuesToLogicalType(['1', 'true', '0123'], 'string')).toEqual(['1', 'true', '0123']);
		expect(coerceValuesToLogicalType(['2024-01-01'], 'date')).toEqual(['2024-01-01']);
		expect(coerceValuesToLogicalType(['1', 'true'], 'object')).toEqual(['1', 'true']);
	});

	it('keeps every line as text when the property has no logicalType', () => {
		expect(coerceValuesToLogicalType(['1', 'true'], undefined)).toEqual(['1', 'true']);
		expect(coerceValuesToLogicalType(['1', 'true'], null)).toEqual(['1', 'true']);
	});

	it('leaves values that are already typed alone', () => {
		expect(coerceValuesToLogicalType([1, true, null], 'integer')).toEqual([1, true, null]);
	});

	it('handles a missing list', () => {
		expect(coerceValuesToLogicalType(undefined, 'integer')).toEqual([]);
	});
});
