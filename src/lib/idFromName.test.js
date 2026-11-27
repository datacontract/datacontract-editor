import {describe, expect, it} from 'vitest';
import {idFollowingName, slugifyName} from './idFromName.js';

describe('slugifyName', () => {
	it('lowercases and joins words with dashes', () => {
		expect(slugifyName('My Orders')).toBe('my-orders');
	});

	it('spells out umlauts and drops other characters', () => {
		expect(slugifyName('Aufträge (Größe) & Maße!')).toBe('auftraege-groesse-masse');
	});

	it('collapses and trims dashes', () => {
		expect(slugifyName('  Orders -- daily  ')).toBe('orders-daily');
	});

	it('returns an empty string for no name', () => {
		expect(slugifyName(undefined)).toBe('');
	});
});

describe('idFollowingName', () => {
	it('follows the name while the ID is the slug of the previous name', () => {
		expect(idFollowingName('my-data-contract', 'My Data Contract', 'My Orders')).toBe('my-orders');
	});

	it('fills an empty ID from the name', () => {
		expect(idFollowingName('', 'Old', 'My Orders')).toBe('my-orders');
		expect(idFollowingName(undefined, undefined, 'My Orders')).toBe('my-orders');
	});

	it('leaves an ID the user typed alone', () => {
		expect(idFollowingName('orders-v2', 'My Orders', 'My Orders Daily')).toBeUndefined();
	});

	it('leaves a generated ID that is not the slug of the name alone', () => {
		expect(idFollowingName('0b4e1e6c-3d5f-4a8e-9a63-2f3c9d1e7b10', 'My Data Contract', 'My Orders')).toBeUndefined();
	});

	it('does not fill a slug that fails the ID pattern', () => {
		expect(idFollowingName('my-data-contract', 'My Data Contract', 'My Orders', 'dc-.*')).toBe('');
		expect(idFollowingName('my-data-contract', 'My Data Contract', 'DC Orders', 'dc-.*')).toBe('dc-orders');
	});

	it('changes nothing when the slug stays the same', () => {
		expect(idFollowingName('my-orders', 'My Orders', 'My Orders ')).toBeUndefined();
	});
});
