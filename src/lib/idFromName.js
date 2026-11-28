/**
 * The ID a new contract gets from its name, e.g. "Aufträge Daily" -> "auftraege-daily".
 * Mirrors the host's slug rule (Entropy Data's ExternalId.toLowercaseStripped), so a contract's
 * suggested ID looks like the IDs the host suggests for data products.
 */
export function slugifyName(name) {
	return (name || '')
		.normalize('NFC')
		.replace(/[äÄ]/g, 'ae').replace(/[öÖ]/g, 'oe').replace(/[üÜ]/g, 'ue').replace(/ß/g, 'ss')
		.replace(/ /g, '-')
		.replace(/[^a-zA-Z0-9_-]/g, '')
		.replace(/-+/g, '-')
		.replace(/^-+|-+$/g, '')
		.toLowerCase();
}

function matchesPattern(value, pattern) {
	if (!pattern) return true;
	try {
		return new RegExp(`^(?:${pattern})$`).test(value);
	} catch {
		// An invalid customization pattern is reported elsewhere; it must not block the suggestion.
		return true;
	}
}

/**
 * The ID after the name changed from previousName to newName, or undefined to leave the ID alone.
 * The ID follows the name while it is empty or still the slug of the previous name: once the user
 * types an ID of their own, it stays, and clearing it starts the following again. An ID the host
 * generated differently (e.g. a UUID) is never the slug of the name, so it stays too. A slug that
 * fails the configured ID pattern is not filled in, since it would fail validation at once.
 */
export function idFollowingName(currentId, previousName, newName, pattern) {
	const id = typeof currentId === 'string' ? currentId.trim() : '';
	if (id !== '' && id !== slugifyName(previousName)) return undefined;
	const slug = slugifyName(newName);
	const next = matchesPattern(slug, pattern) ? slug : '';
	return next === (currentId || '') ? undefined : next;
}
