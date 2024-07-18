import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';

/** Utility functions */

async function loadTemplate(sub_path) {
	// eslint-disable-next-line no-undef
	let base_path = process.env['npm_config_datacontract_template_source'] || 'https://raw.githubusercontent.com/datacontract/datacontract-cli/main/datacontract/templates/';
	let path = base_path + sub_path;
	if (path.startsWith('http')) {
		// eslint-disable-next-line no-undef
		return await (await fetch(path)).text();
	}
	return readFileSync(path) + '';
}

// handle the replacement of all Python constructs into the JS equivalent
function updateTemplateCode(template) {
	const updated_template = template
    .replace(/\.items\(\)/gm, '')
    .replace(/True/gm, 'true')
    .replace(/False/gm, 'false')
    .replace(/\.ref/gm, '.$ref')
    .replace(/cli\.datacontract\.com/gm, 'editor.datacontract.com')
    .replace(/Data Contract CLI/gm, 'Data Contract Editor');
	return updated_template;
}

// write the file to disk
function storeTemplate(path, content) {
	writeFileSync(path, content, { encoding: 'utf-8' });
}

// download and process a partial
async function processPartial(partial_name) {
	const template = await loadTemplate(partial_name);
	const processed_template = updateTemplateCode(template);
	return processed_template;
}

/** Main loop */

// fetch the main template, all other work is based on that
const full_main_template = await loadTemplate('datacontract.html');
// const full_main_template = await raw_template.text();
// cut out the relevant part of the template (which is inside the <main> element)
// note: this is a bit crude, but since this is a template we can't parse it as HTML
const main_template = full_main_template.match(/<main .+>.*<\/main>/s)[0];

// find all the render partial calls in there, to know what other templates we need to load
const partial_regex = /partial\('([\w/.]+)'/g;
// the result of our capturing group is in the second element of the result array
const partials = Array.from(main_template.matchAll(partial_regex), (m) => m[1]);

// ensure we have an output directory
if (!existsSync('templates/partials')) {
	mkdirSync('templates/partials', { recursive: true });
}

// do the main template
const updated_main_template = updateTemplateCode(main_template);
storeTemplate('templates/datacontract.html', updated_main_template);

// and all the partials we've found
partials.forEach(async (p) => {
	const updated_partial = await processPartial(p);
	storeTemplate(`templates/${p}`, updated_partial);
})
