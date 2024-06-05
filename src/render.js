import nunjucks from "nunjucks";

/*
 * Rendering with nunjucks.
 * Requires "npm run precompile"
 */

const env = nunjucks.configure('templates', {autoescape: false});
env.addGlobal('render_partial', function (partialName, context) {
    return nunjucks.render(partialName, context);
});

export default function renderDataContract(dataContract) {
    return nunjucks.render("datacontract.html", {datacontract: dataContract});
}
