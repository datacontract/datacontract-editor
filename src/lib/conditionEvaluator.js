import { getValueWithPath } from '../store';

/**
 * Evaluate a condition expression against the current data contract state
 *
 * Supported expressions:
 * - `status == 'active'` - equality
 * - `status != 'draft'` - inequality
 * - `domain == null` - null check
 * - `domain != null` - not null check
 * - `tags contains 'gdpr'` - array contains
 * - `status == 'active' && domain != null` - AND
 * - `status == 'active' || status == 'draft'` - OR
 *
 * Property resolution:
 * - Direct property names check context first, then root level
 * - Dotted paths (e.g., 'schema.type') resolve from root yamlParts
 *
 * @param {string} condition - Expression string
 * @param {Object} yamlParts - Parsed YAML data (root level)
 * @param {Object} context - Current level context (e.g., current property values)
 * @returns {boolean}
 */
export function evaluateCondition(condition, yamlParts, context = {}) {
	if (!condition || typeof condition !== 'string') return true;

	try {
		const trimmed = condition.trim();
		return evaluateExpression(trimmed, yamlParts, context);
	} catch (e) {
		console.warn('Failed to evaluate condition:', condition, e);
		return true; // Show field if condition evaluation fails
	}
}

/**
 * Evaluate a single expression or compound expression
 */
function evaluateExpression(expr, yamlParts, context) {
	// Handle OR (||) - lowest precedence
	if (expr.includes('||')) {
		const parts = splitByOperator(expr, '||');
		return parts.some((part) => evaluateExpression(part.trim(), yamlParts, context));
	}

	// Handle AND (&&)
	if (expr.includes('&&')) {
		const parts = splitByOperator(expr, '&&');
		return parts.every((part) => evaluateExpression(part.trim(), yamlParts, context));
	}

	// Handle contains
	const containsMatch = expr.match(/^(.+?)\s+contains\s+(.+)$/);
	if (containsMatch) {
		const [, leftExpr, rightExpr] = containsMatch;
		const leftValue = resolveValue(leftExpr.trim(), yamlParts, context);
		const rightValue = parseValue(rightExpr.trim());
		return Array.isArray(leftValue) && leftValue.includes(rightValue);
	}

	// Handle equality (==)
	const eqMatch = expr.match(/^(.+?)\s*==\s*(.+)$/);
	if (eqMatch) {
		const [, leftExpr, rightExpr] = eqMatch;
		const leftValue = resolveValue(leftExpr.trim(), yamlParts, context);
		const rightValue = parseValue(rightExpr.trim());
		return leftValue === rightValue;
	}

	// Handle inequality (!=)
	const neqMatch = expr.match(/^(.+?)\s*!=\s*(.+)$/);
	if (neqMatch) {
		const [, leftExpr, rightExpr] = neqMatch;
		const leftValue = resolveValue(leftExpr.trim(), yamlParts, context);
		const rightValue = parseValue(rightExpr.trim());
		return leftValue !== rightValue;
	}

	// Fallback: treat as truthy check
	const value = resolveValue(expr, yamlParts, context);
	return Boolean(value);
}

/**
 * Split expression by operator, respecting quoted strings
 */
function splitByOperator(expr, operator) {
	const parts = [];
	let current = '';
	let inQuote = false;
	let quoteChar = '';
	let i = 0;

	while (i < expr.length) {
		const char = expr[i];

		if ((char === '"' || char === "'") && !inQuote) {
			inQuote = true;
			quoteChar = char;
			current += char;
		} else if (char === quoteChar && inQuote) {
			inQuote = false;
			quoteChar = '';
			current += char;
		} else if (!inQuote && expr.slice(i, i + operator.length) === operator) {
			parts.push(current);
			current = '';
			i += operator.length;
			continue;
		} else {
			current += char;
		}
		i++;
	}

	if (current) {
		parts.push(current);
	}

	return parts;
}

/**
 * Resolve a property reference to its value
 */
function resolveValue(expr, yamlParts, context) {
	const trimmed = expr.trim();

	// Check if it's a literal value (quoted string, number, null, boolean)
	const parsed = parseValue(trimmed);
	if (parsed !== undefined && (trimmed.startsWith("'") || trimmed.startsWith('"') ||
		trimmed === 'null' || trimmed === 'true' || trimmed === 'false' ||
		!isNaN(Number(trimmed)))) {
		return parsed;
	}

	// It's a property reference
	const propertyPath = trimmed;

	// If path contains a dot and starts with a known level prefix, resolve from root
	// Otherwise, check context first (for local custom properties), then root
	if (propertyPath.includes('.')) {
		// Dotted path - resolve from root
		return getValueWithPath(yamlParts, propertyPath);
	}

	// Simple property name - check context first
	if (context && propertyPath in context) {
		return context[propertyPath];
	}

	// Check customProperties in context
	if (context?.customProperties && propertyPath in context.customProperties) {
		return context.customProperties[propertyPath];
	}

	// Fall back to root level
	return getValueWithPath(yamlParts, propertyPath);
}

/**
 * Parse a literal value from expression
 */
function parseValue(expr) {
	const trimmed = expr.trim();

	// Null
	if (trimmed === 'null') return null;

	// Boolean
	if (trimmed === 'true') return true;
	if (trimmed === 'false') return false;

	// Quoted string (single or double quotes)
	if ((trimmed.startsWith("'") && trimmed.endsWith("'")) ||
		(trimmed.startsWith('"') && trimmed.endsWith('"'))) {
		return trimmed.slice(1, -1);
	}

	// Number
	const num = Number(trimmed);
	if (!isNaN(num) && trimmed !== '') {
		return num;
	}

	// Return undefined to indicate it's not a literal
	return undefined;
}

export default evaluateCondition;
