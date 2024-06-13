import nunjucks from "nunjucks";
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
    return nunjucks.render("datacontract.html", {datacontract: dataContract});
}
