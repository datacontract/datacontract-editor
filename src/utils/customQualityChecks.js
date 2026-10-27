import * as YAML from 'yaml';

const TABLE_PLACEHOLDERS = ['model', 'table', 'object', 'schema', 'dataset', 'project', 'catalog', 'database'];
const COLUMN_PLACEHOLDERS = ['field', 'column', 'property'];
const COMPARATORS = ['mustBe', 'mustNotBe', 'mustBeGreaterThan', 'mustBeGreaterOrEqualTo', 'mustBeLessThan',
	'mustBeLessOrEqualTo', 'mustBeBetween', 'mustNotBeBetween'];

export const isPreDefinedRule = (rule) => rule?.type === 'custom' && rule?.engine === 'datacontract-cli';

export const checkIdOf = (rule) => {
	const implementation = rule?.implementation;
	return implementation && typeof implementation === 'object' && typeof implementation.check === 'string'
		? implementation.check
		: '';
};

export const argumentsOf = (rule) => {
	const args = rule?.implementation?.arguments;
	return args && typeof args === 'object' && !Array.isArray(args) ? args : {};
};

export const findCustomQualityCheck = (checks, id) => {
	if (!Array.isArray(checks) || !id) return null;
	const lowerId = id.toLowerCase();
	return checks.find((check) => check.id?.toLowerCase() === lowerId) ?? null;
};

/** The check's description filled in the way datacontract-cli names the rule; arguments include their defaults. */
export const fillCheckDescription = (check, args, { table, column } = {}) => {
	if (!check?.description) return '';
	const values = { ...Object.fromEntries((check.arguments ?? []).map((argument) => [argument.name, argument.default])), ...args };
	return check.description.replace(/\$\{([A-Za-z_][\w.]*)\}/g, (placeholder, name) => {
		if (name.startsWith('arguments.')) {
			const argumentName = name.slice('arguments.'.length);
			const value = values[argumentName];
			if (value === undefined || value === null || value === '') return argumentName;
			return Array.isArray(value) ? value.join(', ') : String(value);
		}
		if (table && TABLE_PLACEHOLDERS.includes(name)) return table;
		if (column && COLUMN_PLACEHOLDERS.includes(name)) return column;
		return placeholder;
	});
};

/** The arguments as datacontract-cli names a rule without description: min=0, max=10000, values=[a, b]. */
export const formatArguments = (args) => Object.entries(args)
	.map(([name, value]) => `${name}=${YAML.stringify(value, { collectionStyle: 'flow', flowCollectionPadding: false }).trimEnd()}`)
	.join(', ');

const isNumber = (value) => (typeof value === 'number' && Number.isFinite(value))
	|| (typeof value === 'string' && /^-?\d+(\.\d+)?$/.test(value.trim()));

/**
 * Why datacontract-cli would report a pre-defined rule as an error, as [{ field, key, values }] where field is
 * 'check', 'operator' or 'arguments.<name>' and key names the message. Empty without a list of checks.
 */
export const customQualityCheckProblems = (rule, checks, context) => {
	if (!Array.isArray(checks) || !isPreDefinedRule(rule)) return [];
	const id = checkIdOf(rule);
	if (!id.trim()) return [{ field: 'check', key: 'required' }];
	const check = findCustomQualityCheck(checks, id);
	if (!check) return [{ field: 'check', key: 'unknownCheck' }];

	const problems = [];
	if (check.usesColumn && context !== 'property') {
		problems.push({ field: 'check', key: 'columnCheckOnSchema' });
	}
	const given = argumentsOf(rule);
	const declared = check.arguments ?? [];
	for (const argument of declared) {
		const field = `arguments.${argument.name}`;
		const value = given[argument.name];
		if (value === undefined || value === null) {
			if (argument.required) problems.push({ field, key: 'required' });
		} else if (argument.type === 'number' && !(Array.isArray(value) ? value : [value]).every(isNumber)) {
			problems.push({ field, key: 'notANumber' });
		} else if (argument.type === 'identifier' && (typeof value !== 'string' || !value.trim())) {
			problems.push({ field, key: 'notAnIdentifier' });
		}
	}
	for (const name of Object.keys(given)) {
		if (!declared.some((argument) => argument.name === name)) {
			problems.push({ field: `arguments.${name}`, key: 'undeclaredArgument', values: { check: check.id, argument: name } });
		}
	}
	if (!check.expectedResult && !COMPARATORS.some((comparator) => rule[comparator] !== undefined)) {
		problems.push({ field: 'operator', key: 'noExpectedResult' });
	}
	return problems;
};

export const countCustomQualityCheckProblems = (rules, checks, context) => (Array.isArray(rules) ? rules : [])
	.reduce((count, rule) => count + customQualityCheckProblems(rule, checks, context).length, 0);
