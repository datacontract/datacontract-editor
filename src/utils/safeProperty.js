/**
 * Utilities to guard against prototype pollution.
 *
 * Any code that performs dynamic property access with keys originating from
 * untrusted sources (API responses, user input, YAML documents, etc.) must
 * validate those keys before using bracket-notation assignment.
 */

const DANGEROUS_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

/**
 * Returns `true` when `key` is a property name that could pollute the
 * Object prototype if used in a bracket-notation assignment.
 *
 * @param {string|number} key
 * @returns {boolean}
 */
export function isDangerousKey(key) {
	return DANGEROUS_KEYS.has(String(key));
}

/**
 * Returns `true` when `key` is safe for dynamic property assignment.
 *
 * @param {string|number} key
 * @returns {boolean}
 */
export function isSafeKey(key) {
	if (isDangerousKey(key)) {
		console.warn('Blocked dangerous property key:', key);
		return false;
	}
	return true;
}
