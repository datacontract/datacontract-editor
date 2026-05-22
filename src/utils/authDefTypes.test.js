import { describe, it, expect } from 'vitest';
import { isSemanticAuthDef, resolveAuthDefType } from './authDefTypes.js';

describe('resolveAuthDefType', () => {
	// Tree nodes tag themselves so a business definition picked from the unified
	// tree is written as `definition`, not `semantics`.
	it("uses the definition's own authDefType when present", () => {
		expect(resolveAuthDefType({ authDefType: 'definition' })).toBe('definition');
		expect(resolveAuthDefType({ authDefType: 'semantics' })).toBe('semantics');
	});

	it('defaults to semantics when the definition has no authDefType', () => {
		expect(resolveAuthDefType({})).toBe('semantics');
		expect(resolveAuthDefType(null)).toBe('semantics');
		expect(resolveAuthDefType(undefined)).toBe('semantics');
	});
});

describe('isSemanticAuthDef', () => {
	it('recognises both the current and legacy semantic tokens', () => {
		expect(isSemanticAuthDef({ type: 'semantics' })).toBe(true);
		expect(isSemanticAuthDef({ type: 'semantic' })).toBe(true);
	});

	it('does not treat a business definition or other links as semantic', () => {
		expect(isSemanticAuthDef({ type: 'definition' })).toBe(false);
		expect(isSemanticAuthDef({ type: 'businessDefinition' })).toBe(false);
		expect(isSemanticAuthDef(undefined)).toBe(false);
		expect(isSemanticAuthDef({})).toBe(false);
	});
});
