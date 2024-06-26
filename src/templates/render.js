import nunjucks from "nunjucks";
import { version } from '../../package.json';

import './templates.js';

/*
 * Rendering with nunjucks.
 * Requires "npm run precompile" to have the templates available
 */

const env = nunjucks.configure('templates', {autoescape: false});
env.addGlobal('render_partial', function (partialName, context) {
    return nunjucks.render(partialName, context);
});
env.addGlobal('range', function (from, to) {
    return [...Array(to).keys()].map(i => i + from)
});

export function renderDataContract(dataContract) {
	const local_date = new Date().toLocaleDateString();
    return nunjucks.render("datacontract.html", { datacontract: dataContract, formatted_date: local_date, datacontract_cli_version: version });
}
