// ODCS 3.2.0 `context` (RFC 0038): either a string, shorthand for the instructions, or an object
// with instructions, verifiedStatements and constraints. Normalizes both shapes to the object.
export const normalizeContext = (context) => {
	if (context == null) return null;
	if (typeof context === 'string') return context.trim() ? { instructions: context } : null;
	if (typeof context !== 'object') return null;
	const verifiedStatements = Array.isArray(context.verifiedStatements) ? context.verifiedStatements : [];
	const constraints = Array.isArray(context.constraints) ? context.constraints : [];
	const instructions = typeof context.instructions === 'string' && context.instructions.trim() ? context.instructions : null;
	if (!instructions && verifiedStatements.length === 0 && constraints.length === 0) return null;
	return { instructions, verifiedStatements, constraints };
};
