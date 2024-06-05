(function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["datacontract.html"] = (function() {
function root(env, context, frame, runtime, cb) {
var lineno = 0;
var colno = 0;
var output = "";
try {
var parentTemplate = null;
if(runtime.contextOrFrameLookup(context, frame, "datacontract")) {
output += "\n<div class=\"px-2\">\n  <div>\n    <div class=\"md:flex md:items-center md:justify-between px-4 sm:px-0\">\n      <div class=\"min-w-0 flex-1\">\n        <h2 class=\"text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight\">\n          Data Contract</h2>\n        <div class=\"mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6\">\n          ";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"id"), env.opts.autoescape);
output += "\n        </div>\n      </div>\n    </div>\n  </div>\n\n  <div>\n    <div class=\"space-y-6 mt-6\">\n      ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"info")) {
output += "\n      <section id=\"information\">\n        ";
output += runtime.suppressValue((lineno = 18, colno = 25, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "render_partial"), "render_partial", context, ["partials/datacontract_information.html",runtime.makeKeywordArgs({"datacontract": runtime.contextOrFrameLookup(context, frame, "datacontract")})])), env.opts.autoescape);
output += "\n      </section>\n      ";
;
}
output += "\n\n\n      ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"servers")) {
output += "\n      <section id=\"servers\">\n        <div class=\"px-4 sm:px-0\">\n          <h1 class=\"text-base font-semibold leading-6 text-gray-900\" id=\"servers\">Servers</h1>\n          <p class=\"text-sm text-gray-500\">Servers of the data contract</p>\n        </div>\n\n        <ul role=\"list\" class=\"mt-2 divide-y divide-gray-100 overflow-hidden bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-lg\">\n\n          ";
frame = frame.push();
var t_3 = runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"servers");
if(t_3) {t_3 = runtime.fromIterator(t_3);
var t_1;
if(runtime.isArray(t_3)) {
var t_2 = t_3.length;
for(t_1=0; t_1 < t_3.length; t_1++) {
var t_4 = t_3[t_1][0];
frame.set("[object Object]", t_3[t_1][0]);
var t_5 = t_3[t_1][1];
frame.set("[object Object]", t_3[t_1][1]);
frame.set("loop.index", t_1 + 1);
frame.set("loop.index0", t_1);
frame.set("loop.revindex", t_2 - t_1);
frame.set("loop.revindex0", t_2 - t_1 - 1);
frame.set("loop.first", t_1 === 0);
frame.set("loop.last", t_1 === t_2 - 1);
frame.set("loop.length", t_2);
output += "\n            ";
output += runtime.suppressValue((lineno = 33, colno = 29, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "render_partial"), "render_partial", context, ["partials/server.html",runtime.makeKeywordArgs({"server_name": t_4,"server": t_5})])), env.opts.autoescape);
output += "\n          ";
;
}
} else {
t_1 = -1;
var t_2 = runtime.keys(t_3).length;
for(var t_6 in t_3) {
t_1++;
var t_7 = t_3[t_6];
frame.set("server_name", t_6);
frame.set("server", t_7);
frame.set("loop.index", t_1 + 1);
frame.set("loop.index0", t_1);
frame.set("loop.revindex", t_2 - t_1);
frame.set("loop.revindex0", t_2 - t_1 - 1);
frame.set("loop.first", t_1 === 0);
frame.set("loop.last", t_1 === t_2 - 1);
frame.set("loop.length", t_2);
output += "\n            ";
output += runtime.suppressValue((lineno = 33, colno = 29, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "render_partial"), "render_partial", context, ["partials/server.html",runtime.makeKeywordArgs({"server_name": t_6,"server": t_7})])), env.opts.autoescape);
output += "\n          ";
;
}
}
}
frame = frame.pop();
output += "\n\n        </ul>\n\n      </section>\n      ";
;
}
output += "\n\n\n      ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"terms")) {
output += "\n      <section id=\"terms\">\n        ";
output += runtime.suppressValue((lineno = 44, colno = 25, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "render_partial"), "render_partial", context, ["partials/datacontract_terms.html",runtime.makeKeywordArgs({"datacontract": runtime.contextOrFrameLookup(context, frame, "datacontract")})])), env.opts.autoescape);
output += "\n      </section>\n      ";
;
}
output += "\n\n\n      ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"models")) {
output += "\n      <section id=\"models\">\n        <div class=\"flex justify-between\">\n          <div class=\"px-4 sm:px-0\">\n            <h1 class=\"text-base font-semibold leading-6 text-gray-900\">\n              Data Model\n            </h1>\n            <p class=\"text-sm text-gray-500\">The logical data model</p>\n          </div>\n        </div>\n\n        ";
frame = frame.push();
var t_10 = runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"models");
if(t_10) {t_10 = runtime.fromIterator(t_10);
var t_8;
if(runtime.isArray(t_10)) {
var t_9 = t_10.length;
for(t_8=0; t_8 < t_10.length; t_8++) {
var t_11 = t_10[t_8][0];
frame.set("[object Object]", t_10[t_8][0]);
var t_12 = t_10[t_8][1];
frame.set("[object Object]", t_10[t_8][1]);
frame.set("loop.index", t_8 + 1);
frame.set("loop.index0", t_8);
frame.set("loop.revindex", t_9 - t_8);
frame.set("loop.revindex0", t_9 - t_8 - 1);
frame.set("loop.first", t_8 === 0);
frame.set("loop.last", t_8 === t_9 - 1);
frame.set("loop.length", t_9);
output += "\n\n        <div class=\"mt-3 flow-root\">\n          <div class=\"-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8\">\n            <div class=\"inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8\">\n              <div class=\"overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg\">\n\n                <table class=\"min-w-full divide-y divide-gray-300\">\n                  <thead class=\"bg-gray-50\">\n                  <tr>\n                    <th scope=\"colgroup\" colspan=\"3\" class=\"py-2 pl-4 pr-3 text-left font-semibold text-gray-900 sm:pl-6\">\n                      <span>";
output += runtime.suppressValue(t_11, env.opts.autoescape);
output += "</span>\n                      <span class=\"inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10\">";
output += runtime.suppressValue(runtime.memberLookup((t_12),"type"), env.opts.autoescape);
output += "</span>\n                      <div class=\"text-sm font-medium text-gray-500\">";
output += runtime.suppressValue(runtime.memberLookup((t_12),"description"), env.opts.autoescape);
output += "</div>\n                    </th>\n\n                  </tr>\n                  </thead>\n                  <tbody class=\"divide-y divide-gray-200 bg-white\">\n                  ";
frame = frame.push();
var t_15 = runtime.memberLookup((t_12),"fields");
if(t_15) {t_15 = runtime.fromIterator(t_15);
var t_13;
if(runtime.isArray(t_15)) {
var t_14 = t_15.length;
for(t_13=0; t_13 < t_15.length; t_13++) {
var t_16 = t_15[t_13][0];
frame.set("[object Object]", t_15[t_13][0]);
var t_17 = t_15[t_13][1];
frame.set("[object Object]", t_15[t_13][1]);
frame.set("loop.index", t_13 + 1);
frame.set("loop.index0", t_13);
frame.set("loop.revindex", t_14 - t_13);
frame.set("loop.revindex0", t_14 - t_13 - 1);
frame.set("loop.first", t_13 === 0);
frame.set("loop.last", t_13 === t_14 - 1);
frame.set("loop.length", t_14);
output += "\n                    ";
output += runtime.suppressValue((lineno = 80, colno = 37, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "render_partial"), "render_partial", context, ["partials/model_field.html",runtime.makeKeywordArgs({"nested": runtime.contextOrFrameLookup(context, frame, "False"),"field_name": t_16,"field": t_17,"level": 0})])), env.opts.autoescape);
output += "\n                  ";
;
}
} else {
t_13 = -1;
var t_14 = runtime.keys(t_15).length;
for(var t_18 in t_15) {
t_13++;
var t_19 = t_15[t_18];
frame.set("field_name", t_18);
frame.set("field", t_19);
frame.set("loop.index", t_13 + 1);
frame.set("loop.index0", t_13);
frame.set("loop.revindex", t_14 - t_13);
frame.set("loop.revindex0", t_14 - t_13 - 1);
frame.set("loop.first", t_13 === 0);
frame.set("loop.last", t_13 === t_14 - 1);
frame.set("loop.length", t_14);
output += "\n                    ";
output += runtime.suppressValue((lineno = 80, colno = 37, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "render_partial"), "render_partial", context, ["partials/model_field.html",runtime.makeKeywordArgs({"nested": runtime.contextOrFrameLookup(context, frame, "False"),"field_name": t_18,"field": t_19,"level": 0})])), env.opts.autoescape);
output += "\n                  ";
;
}
}
}
frame = frame.pop();
output += "\n                  </tbody>\n                </table>\n              </div>\n            </div>\n          </div>\n        </div>\n        ";
;
}
} else {
t_8 = -1;
var t_9 = runtime.keys(t_10).length;
for(var t_20 in t_10) {
t_8++;
var t_21 = t_10[t_20];
frame.set("model_name", t_20);
frame.set("model", t_21);
frame.set("loop.index", t_8 + 1);
frame.set("loop.index0", t_8);
frame.set("loop.revindex", t_9 - t_8);
frame.set("loop.revindex0", t_9 - t_8 - 1);
frame.set("loop.first", t_8 === 0);
frame.set("loop.last", t_8 === t_9 - 1);
frame.set("loop.length", t_9);
output += "\n\n        <div class=\"mt-3 flow-root\">\n          <div class=\"-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8\">\n            <div class=\"inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8\">\n              <div class=\"overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg\">\n\n                <table class=\"min-w-full divide-y divide-gray-300\">\n                  <thead class=\"bg-gray-50\">\n                  <tr>\n                    <th scope=\"colgroup\" colspan=\"3\" class=\"py-2 pl-4 pr-3 text-left font-semibold text-gray-900 sm:pl-6\">\n                      <span>";
output += runtime.suppressValue(t_20, env.opts.autoescape);
output += "</span>\n                      <span class=\"inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10\">";
output += runtime.suppressValue(runtime.memberLookup((t_21),"type"), env.opts.autoescape);
output += "</span>\n                      <div class=\"text-sm font-medium text-gray-500\">";
output += runtime.suppressValue(runtime.memberLookup((t_21),"description"), env.opts.autoescape);
output += "</div>\n                    </th>\n\n                  </tr>\n                  </thead>\n                  <tbody class=\"divide-y divide-gray-200 bg-white\">\n                  ";
frame = frame.push();
var t_24 = runtime.memberLookup((t_21),"fields");
if(t_24) {t_24 = runtime.fromIterator(t_24);
var t_22;
if(runtime.isArray(t_24)) {
var t_23 = t_24.length;
for(t_22=0; t_22 < t_24.length; t_22++) {
var t_25 = t_24[t_22][0];
frame.set("[object Object]", t_24[t_22][0]);
var t_26 = t_24[t_22][1];
frame.set("[object Object]", t_24[t_22][1]);
frame.set("loop.index", t_22 + 1);
frame.set("loop.index0", t_22);
frame.set("loop.revindex", t_23 - t_22);
frame.set("loop.revindex0", t_23 - t_22 - 1);
frame.set("loop.first", t_22 === 0);
frame.set("loop.last", t_22 === t_23 - 1);
frame.set("loop.length", t_23);
output += "\n                    ";
output += runtime.suppressValue((lineno = 80, colno = 37, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "render_partial"), "render_partial", context, ["partials/model_field.html",runtime.makeKeywordArgs({"nested": runtime.contextOrFrameLookup(context, frame, "False"),"field_name": t_25,"field": t_26,"level": 0})])), env.opts.autoescape);
output += "\n                  ";
;
}
} else {
t_22 = -1;
var t_23 = runtime.keys(t_24).length;
for(var t_27 in t_24) {
t_22++;
var t_28 = t_24[t_27];
frame.set("field_name", t_27);
frame.set("field", t_28);
frame.set("loop.index", t_22 + 1);
frame.set("loop.index0", t_22);
frame.set("loop.revindex", t_23 - t_22);
frame.set("loop.revindex0", t_23 - t_22 - 1);
frame.set("loop.first", t_22 === 0);
frame.set("loop.last", t_22 === t_23 - 1);
frame.set("loop.length", t_23);
output += "\n                    ";
output += runtime.suppressValue((lineno = 80, colno = 37, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "render_partial"), "render_partial", context, ["partials/model_field.html",runtime.makeKeywordArgs({"nested": runtime.contextOrFrameLookup(context, frame, "False"),"field_name": t_27,"field": t_28,"level": 0})])), env.opts.autoescape);
output += "\n                  ";
;
}
}
}
frame = frame.pop();
output += "\n                  </tbody>\n                </table>\n              </div>\n            </div>\n          </div>\n        </div>\n        ";
;
}
}
}
frame = frame.pop();
output += "\n      </section>\n      ";
;
}
output += "\n\n      ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"definitions")) {
output += "\n      <section id=\"definitions\">\n        <div class=\"px-4 sm:px-0\">\n          <h1 class=\"text-base font-semibold leading-6 text-gray-900\">Definitions</h1>\n          <p class=\"text-sm text-gray-500\">Domain specific definitions in the data contract</p>\n        </div>\n\n        ";
frame = frame.push();
var t_31 = runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"definitions");
if(t_31) {t_31 = runtime.fromIterator(t_31);
var t_29;
if(runtime.isArray(t_31)) {
var t_30 = t_31.length;
for(t_29=0; t_29 < t_31.length; t_29++) {
var t_32 = t_31[t_29][0];
frame.set("[object Object]", t_31[t_29][0]);
var t_33 = t_31[t_29][1];
frame.set("[object Object]", t_31[t_29][1]);
frame.set("loop.index", t_29 + 1);
frame.set("loop.index0", t_29);
frame.set("loop.revindex", t_30 - t_29);
frame.set("loop.revindex0", t_30 - t_29 - 1);
frame.set("loop.first", t_29 === 0);
frame.set("loop.last", t_29 === t_30 - 1);
frame.set("loop.length", t_30);
output += "\n        ";
output += runtime.suppressValue((lineno = 100, colno = 25, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "render_partial"), "render_partial", context, ["partials/definition.html",runtime.makeKeywordArgs({"definition_name": t_32,"definition": t_33})])), env.opts.autoescape);
output += "\n        ";
;
}
} else {
t_29 = -1;
var t_30 = runtime.keys(t_31).length;
for(var t_34 in t_31) {
t_29++;
var t_35 = t_31[t_34];
frame.set("definition_name", t_34);
frame.set("definition", t_35);
frame.set("loop.index", t_29 + 1);
frame.set("loop.index0", t_29);
frame.set("loop.revindex", t_30 - t_29);
frame.set("loop.revindex0", t_30 - t_29 - 1);
frame.set("loop.first", t_29 === 0);
frame.set("loop.last", t_29 === t_30 - 1);
frame.set("loop.length", t_30);
output += "\n        ";
output += runtime.suppressValue((lineno = 100, colno = 25, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "render_partial"), "render_partial", context, ["partials/definition.html",runtime.makeKeywordArgs({"definition_name": t_34,"definition": t_35})])), env.opts.autoescape);
output += "\n        ";
;
}
}
}
frame = frame.pop();
output += "\n      </section>\n      ";
;
}
output += "\n\n      ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"examples")) {
output += "\n      <section id=\"examples\">\n        <div class=\"px-4 sm:px-0\">\n          <h1 class=\"text-base font-semibold leading-6 text-gray-900\">Examples</h1>\n          <p class=\"text-sm text-gray-500\">Examples for models in the data contract</p>\n        </div>\n        ";
frame = frame.push();
var t_38 = runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"examples");
if(t_38) {t_38 = runtime.fromIterator(t_38);
var t_37 = t_38.length;
for(var t_36=0; t_36 < t_38.length; t_36++) {
var t_39 = t_38[t_36];
frame.set("example", t_39);
frame.set("loop.index", t_36 + 1);
frame.set("loop.index0", t_36);
frame.set("loop.revindex", t_37 - t_36);
frame.set("loop.revindex0", t_37 - t_36 - 1);
frame.set("loop.first", t_36 === 0);
frame.set("loop.last", t_36 === t_37 - 1);
frame.set("loop.length", t_37);
output += "\n          ";
output += runtime.suppressValue((lineno = 112, colno = 27, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "render_partial"), "render_partial", context, ["partials/example.html",runtime.makeKeywordArgs({"example": t_39})])), env.opts.autoescape);
output += "\n        ";
;
}
}
frame = frame.pop();
output += "\n      </section>\n      ";
;
}
output += "\n\n      ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"servicelevels")) {
output += "\n      <section id=\"servicelevels\">\n        ";
output += runtime.suppressValue((lineno = 119, colno = 25, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "render_partial"), "render_partial", context, ["partials/datacontract_servicelevels.html",runtime.makeKeywordArgs({"datacontract": runtime.contextOrFrameLookup(context, frame, "datacontract")})])), env.opts.autoescape);
output += "\n      </section>\n      ";
;
}
output += "\n\n      ";
if(runtime.contextOrFrameLookup(context, frame, "quality_specification")) {
output += "\n        <section id=\"quality\">\n          <div class=\"px-4 sm:px-0\">\n            <h1 class=\"text-base font-semibold leading-6 text-gray-900\">\n              Quality\n            </h1>\n            <p class=\"text-sm text-gray-500\">\n              <span>";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"quality")),"type"), env.opts.autoescape);
output += "</span>\n            </p>\n          </div>\n          <div class=\"mt-2 overflow-hidden shadow sm:rounded-lg bg-white\">\n            <div class=\"px-4 py-5 sm:px-6\">\n              <div id=\"schema-specification\" >\n                  <pre><code class=\"text-sm\">";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "quality_specification"), env.opts.autoescape);
output += "</code></pre>\n              </div>\n            </div>\n          </div>\n        </section>\n      ";
;
}
output += "\n\n    </div>\n  </div>\n</div>\n";
;
}
output += "\n";
if(parentTemplate) {
parentTemplate.rootRenderFunc(env, context, frame, runtime, cb);
} else {
cb(null, output);
}
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
return {
root: root
};

})();
})();
(function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["partials/datacontract_information.html"] = (function() {
function root(env, context, frame, runtime, cb) {
var lineno = 0;
var colno = 0;
var output = "";
try {
var parentTemplate = null;
output += "<div class=\" px-4 sm:px-0\">\n  <h1 class=\"text-base font-semibold leading-6 text-gray-900\" id=\"info\">Info</h1>\n  <p class=\"text-sm text-gray-500\">Information about the data contract</p>\n</div>\n<div class=\"mt-2 overflow-hidden shadow sm:rounded-lg bg-white\">\n\n  <div class=\"px-4 py-5 sm:px-6\">\n\n    <dl class=\"grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2\">\n      <div class=\"sm:col-span-1\">\n        <dt class=\"text-sm font-medium text-gray-500\">Title</dt>\n        <dd class=\"mt-1 text-sm text-gray-900\">";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"info")),"title"), env.opts.autoescape);
output += "</dd>\n      </div>\n\n      <div class=\"sm:col-span-1\">\n        <dt class=\"text-sm font-medium text-gray-500\">Version</dt>\n        <dd class=\"mt-1 text-sm text-gray-900\">";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"info")),"version"), env.opts.autoescape);
output += "</dd>\n      </div>\n\n      ";
if(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"info")),"status")) {
output += "\n      <div class=\"sm:col-span-1\">\n        <dt class=\"text-sm font-medium text-gray-500\">Status</dt>\n        <dd class=\"mt-1 text-sm text-gray-900\">";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"info")),"status"), env.opts.autoescape);
output += "</dd>\n      </div>\n      ";
;
}
output += "\n\n      ";
if(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"info")),"description")) {
output += "\n      <div class=\"sm:col-span-2\">\n        <dt class=\"text-sm font-medium text-gray-500\">Description</dt>\n        <dd class=\"mt-1 text-sm text-gray-900\" >\n          <span class=\"whitespace-pre-wrap\">";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"info")),"description"), env.opts.autoescape);
output += "</span>\n        </dd>\n      </div>\n      ";
;
}
output += "\n\n      ";
if(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"info")),"owner")) {
output += "\n      <div class=\"sm:col-span-1\">\n        <dt class=\"text-sm font-medium text-gray-500\">Owner</dt>\n        <dd class=\"mt-1 text-sm text-gray-900\">\n          <span>";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"info")),"owner"), env.opts.autoescape);
output += "</span>\n        </dd>\n      </div>\n      ";
;
}
output += "\n\n      ";
if(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"info")),"contact")) {
output += "\n      <div class=\"sm:col-span-1\">\n        <dt class=\"text-sm font-medium text-gray-500\">Contact</dt>\n        <dd class=\"mt-1 text-sm text-gray-900\">\n          ";
if(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"info")),"contact")),"name")) {
output += "\n            ";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"info")),"contact")),"name"), env.opts.autoescape);
output += "\n          ";
;
}
output += "\n          ";
if(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"info")),"contact")),"email")) {
output += "\n            <a href=\"mailto:";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"info")),"contact")),"email"), env.opts.autoescape);
output += "\" class=\"text-sky-500 hover:text-gray-700\">";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"info")),"contact")),"email"), env.opts.autoescape);
output += "</a>\n          ";
;
}
output += "\n          ";
if(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"info")),"contact")),"url")) {
output += "\n            <div>\n              <a href=\"";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"info")),"contact")),"url"), env.opts.autoescape);
output += "\" class=\"text-sky-500 hover:text-gray-700\">";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"info")),"contact")),"url"), env.opts.autoescape);
output += "</a>\n            </div>\n          ";
;
}
output += "\n        </dd>\n      </div>\n      ";
;
}
output += "\n\n    </dl>\n  </div>\n</div>";
if(parentTemplate) {
parentTemplate.rootRenderFunc(env, context, frame, runtime, cb);
} else {
cb(null, output);
}
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
return {
root: root
};

})();
})();
(function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["partials/datacontract_servicelevels.html"] = (function() {
function root(env, context, frame, runtime, cb) {
var lineno = 0;
var colno = 0;
var output = "";
try {
var parentTemplate = null;
output += "<div class=\"px-4 sm:px-0\">\n  <h1 class=\"text-base font-semibold leading-6 text-gray-900\">Service Levels</h1>\n  <p class=\"text-sm text-gray-500\">Service levels of the data contract</p>\n</div>\n<div class=\"mt-2 overflow-hidden shadow sm:rounded-lg bg-white\">\n  <div class=\"px-4 py-5 sm:px-6\">\n    <dl class=\"grid grid-cols-1 gap-x-4 gap-y-6 divide-y\">\n      ";
if(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"servicelevels")),"availability")) {
output += "\n      <div class=\"grid sm:grid-cols-2\" >\n        <h2 class=\"sm:col-span-2 mt-2 text-base font-semibold leading-6 text-gray-900\" id=\"availability\">\n          Availability\n        </h2>\n        ";
if(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"servicelevels")),"availability")),"description")) {
output += "\n        <div class=\"sm:col-span-1\">\n          <dt class=\"text-sm font-medium text-gray-500\">Description</dt>\n          <dd class=\"mt-1 text-sm text-gray-900\">\n            <span class=\"whitespace-pre-wrap\">";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"servicelevels")),"availability")),"description"), env.opts.autoescape);
output += "</span>\n          </dd>\n        </div>\n        ";
;
}
output += "\n        ";
if(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"servicelevels")),"availability")),"percentage")) {
output += "\n        <div class=\"sm:col-span-1\">\n          <dt class=\"text-sm font-medium text-gray-500\">Percentage</dt>\n          <dd class=\"mt-1 text-sm text-gray-900\">\n            <span class=\"whitespace-pre-wrap\">";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"servicelevels")),"availability")),"percentage"), env.opts.autoescape);
output += "</span>\n          </dd>\n        </div>\n        ";
;
}
output += "\n      </div>\n      ";
;
}
output += "\n      ";
if(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"servicelevels")),"retention")) {
output += "\n      <div class=\"grid sm:grid-cols-2\" >\n        <h2 class=\"sm:col-span-2 mt-2 text-base font-semibold leading-6 text-gray-900\" id=\"retention\">\n          Retention\n        </h2>\n        ";
if(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"servicelevels")),"retention")),"description")) {
output += "\n        <div class=\"sm:col-span-1\">\n          <dt class=\"text-sm font-medium text-gray-500\">Description</dt>\n          <dd class=\"mt-1 text-sm text-gray-900\">\n            <span class=\"whitespace-pre-wrap\">";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"servicelevels")),"retention")),"description"), env.opts.autoescape);
output += "</span>\n          </dd>\n        </div>\n        ";
;
}
output += "\n        ";
if(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"servicelevels")),"retention")),"period")) {
output += "\n        <div class=\"sm:col-span-1\">\n          <dt class=\"text-sm font-medium text-gray-500\">Period</dt>\n          <dd class=\"mt-1 text-sm text-gray-900\">\n            <span class=\"whitespace-pre-wrap\">";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"servicelevels")),"retention")),"period"), env.opts.autoescape);
output += "</span>\n          </dd>\n        </div>\n        ";
;
}
output += "\n        ";
if(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"servicelevels")),"retention")),"unlimited")) {
output += "\n        <div class=\"sm:col-span-1\">\n          <dt class=\"text-sm font-medium text-gray-500\">Unlimited</dt>\n          <dd class=\"mt-1 text-sm text-gray-900\">\n            <span class=\"whitespace-pre-wrap font-mono\">";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"servicelevels")),"retention")),"unlimited"), env.opts.autoescape);
output += "</span>\n          </dd>\n        </div>\n        ";
;
}
output += "\n      </div>\n      ";
;
}
output += "\n      ";
if(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"servicelevels")),"latency")) {
output += "\n      <div class=\"grid sm:grid-cols-2\" >\n        <h2 class=\"sm:col-span-2 mt-2 text-base font-semibold leading-6 text-gray-900\" id=\"latency\">\n          Latency\n        </h2>\n        ";
if(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"servicelevels")),"latency")),"description")) {
output += "\n        <div class=\"sm:col-span-1\">\n          <dt class=\"text-sm font-medium text-gray-500\">Description</dt>\n          <dd class=\"mt-1 text-sm text-gray-900\">\n            <span class=\"whitespace-pre-wrap\">";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"servicelevels")),"latency")),"description"), env.opts.autoescape);
output += "</span>\n          </dd>\n        </div>\n        ";
;
}
output += "\n        ";
if(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"servicelevels")),"latency")),"threshold")) {
output += "\n        <div class=\"sm:col-span-1\">\n          <dt class=\"text-sm font-medium text-gray-500\">Threshold</dt>\n          <dd class=\"mt-1 text-sm text-gray-900\">\n            <span class=\"whitespace-pre-wrap\">";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"servicelevels")),"latency")),"threshold"), env.opts.autoescape);
output += "</span>\n          </dd>\n        </div>\n        ";
;
}
output += "\n        ";
if(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"servicelevels")),"latency")),"sourceTimestampField")) {
output += "\n        <div class=\"sm:col-span-1\">\n          <dt class=\"text-sm font-medium text-gray-500\">Source Timestamp field</dt>\n          <dd class=\"mt-1 text-sm text-gray-900\">\n            <span class=\"whitespace-pre-wrap font-mono\">";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"servicelevels")),"latency")),"sourceTimestampField"), env.opts.autoescape);
output += "</span>\n          </dd>\n        </div>\n        ";
;
}
output += "\n        ";
if(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"servicelevels")),"latency")),"processedTimestampField")) {
output += "\n        <div class=\"sm:col-span-1\">\n          <dt class=\"text-sm font-medium text-gray-500\">Processed Timestamp field</dt>\n          <dd class=\"mt-1 text-sm text-gray-900\">\n            <span class=\"whitespace-pre-wrap font-mono\">";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"servicelevels")),"latency")),"processedTimestampField"), env.opts.autoescape);
output += "</span>\n          </dd>\n        </div>\n        ";
;
}
output += "\n      </div>\n      ";
;
}
output += "\n      ";
if(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"servicelevels")),"freshness")) {
output += "\n      <div class=\"grid sm:grid-cols-2\" >\n        <h2 class=\"sm:col-span-2 mt-2 text-base font-semibold leading-6 text-gray-900\" id=\"freshness\">\n          Freshness\n        </h2>\n        ";
if(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"servicelevels")),"freshness")),"description")) {
output += "\n        <div class=\"sm:col-span-1\">\n          <dt class=\"text-sm font-medium text-gray-500\">Description</dt>\n          <dd class=\"mt-1 text-sm text-gray-900\">\n            <span class=\"whitespace-pre-wrap\">";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"servicelevels")),"freshness")),"description"), env.opts.autoescape);
output += "</span>\n          </dd>\n        </div>\n        ";
;
}
output += "\n        ";
if(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"servicelevels")),"freshness")),"threshold")) {
output += "\n        <div class=\"sm:col-span-1\">\n          <dt class=\"text-sm font-medium text-gray-500\">Threshold</dt>\n          <dd class=\"mt-1 text-sm text-gray-900\">\n            <span class=\"whitespace-pre-wrap\">";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"servicelevels")),"freshness")),"threshold"), env.opts.autoescape);
output += "</span>\n          </dd>\n        </div>\n        ";
;
}
output += "\n        ";
if(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"servicelevels")),"freshness")),"timestampField")) {
output += "\n        <div class=\"sm:col-span-1\">\n          <dt class=\"text-sm font-medium text-gray-500\">Timestamp field</dt>\n          <dd class=\"mt-1 text-sm text-gray-900\">\n            <span class=\"whitespace-pre-wrap font-mono\">";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"servicelevels")),"freshness")),"timestampField"), env.opts.autoescape);
output += "</span>\n          </dd>\n        </div>\n        ";
;
}
output += "\n      </div>\n      ";
;
}
output += "\n      ";
if(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"servicelevels")),"frequency")) {
output += "\n      <div class=\"grid sm:grid-cols-2\" >\n        <h2 class=\"sm:col-span-2 mt-2 text-base font-semibold leading-6 text-gray-900\" id=\"frequency\">\n          Frequency\n        </h2>\n        ";
if(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"servicelevels")),"frequency")),"description")) {
output += "\n        <div class=\"sm:col-span-1\">\n          <dt class=\"text-sm font-medium text-gray-500\">Description</dt>\n          <dd class=\"mt-1 text-sm text-gray-900\">\n            <span class=\"whitespace-pre-wrap\">";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"servicelevels")),"frequency")),"description"), env.opts.autoescape);
output += "</span>\n          </dd>\n        </div>\n        ";
;
}
output += "\n        ";
if(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"servicelevels")),"frequency")),"type")) {
output += "\n        <div class=\"sm:col-span-1\">\n          <dt class=\"text-sm font-medium text-gray-500\">Type</dt>\n          <dd class=\"mt-1 text-sm text-gray-900\">\n            <span class=\"whitespace-pre-wrap\">";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"servicelevels")),"frequency")),"type"), env.opts.autoescape);
output += "</span>\n          </dd>\n        </div>\n        ";
;
}
output += "\n        ";
if(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"servicelevels")),"frequency")),"interval")) {
output += "\n        <div class=\"sm:col-span-1\">\n          <dt class=\"text-sm font-medium text-gray-500\">Interval</dt>\n          <dd class=\"mt-1 text-sm text-gray-900\">\n            <span class=\"whitespace-pre-wrap\">";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"servicelevels")),"frequency")),"interval"), env.opts.autoescape);
output += "</span>\n          </dd>\n        </div>\n        ";
;
}
output += "\n        ";
if(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"servicelevels")),"frequency")),"cron")) {
output += "\n        <div class=\"sm:col-span-1\">\n          <dt class=\"text-sm font-medium text-gray-500\">Cron</dt>\n          <dd class=\"mt-1 text-sm text-gray-900\">\n            <span class=\"whitespace-pre-wrap font-mono\">";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"servicelevels")),"frequency")),"cron"), env.opts.autoescape);
output += "</span>\n          </dd>\n        </div>\n        ";
;
}
output += "\n      </div>\n      ";
;
}
output += "\n      ";
if(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"servicelevels")),"support")) {
output += "\n      <div class=\"grid sm:grid-cols-2\" >\n        <h2 class=\"sm:col-span-2 mt-2 text-base font-semibold leading-6 text-gray-900\" id=\"support\">\n          Support\n        </h2>\n        ";
if(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"servicelevels")),"support")),"description")) {
output += "\n        <div class=\"sm:col-span-1\">\n          <dt class=\"text-sm font-medium text-gray-500\">Description</dt>\n          <dd class=\"mt-1 text-sm text-gray-900\">\n            <span class=\"whitespace-pre-wrap\">";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"servicelevels")),"support")),"description"), env.opts.autoescape);
output += "</span>\n          </dd>\n        </div>\n        ";
;
}
output += "\n        ";
if(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"servicelevels")),"support")),"time")) {
output += "\n        <div class=\"sm:col-span-1\">\n          <dt class=\"text-sm font-medium text-gray-500\">Time</dt>\n          <dd class=\"mt-1 text-sm text-gray-900\">\n            <span class=\"whitespace-pre-wrap\">";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"servicelevels")),"support")),"time"), env.opts.autoescape);
output += "</span>\n          </dd>\n        </div>\n        ";
;
}
output += "\n        ";
if(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"servicelevels")),"support")),"responseTime")) {
output += "\n        <div class=\"sm:col-span-1\">\n          <dt class=\"text-sm font-medium text-gray-500\">Response Time</dt>\n          <dd class=\"mt-1 text-sm text-gray-900\">\n            <span class=\"whitespace-pre-wrap\">";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"servicelevels")),"support")),"responseTime"), env.opts.autoescape);
output += "</span>\n          </dd>\n        </div>\n        ";
;
}
output += "\n      </div>\n      ";
;
}
output += "\n      ";
if(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"servicelevels")),"backup")) {
output += "\n      <div class=\"grid sm:grid-cols-2\" >\n        <h2 class=\"sm:col-span-2 mt-2 text-base font-semibold leading-6 text-gray-900\" id=\"backup\">\n          Backup\n        </h2>\n        ";
if(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"servicelevels")),"backup")),"description")) {
output += "\n        <div class=\"sm:col-span-1\">\n          <dt class=\"text-sm font-medium text-gray-500\">Description</dt>\n          <dd class=\"mt-1 text-sm text-gray-900\">\n            <span class=\"whitespace-pre-wrap\">";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"servicelevels")),"backup")),"description"), env.opts.autoescape);
output += "</span>\n          </dd>\n        </div>\n        ";
;
}
output += "\n        ";
if(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"servicelevels")),"backup")),"internal")) {
output += "\n        <div class=\"sm:col-span-1\">\n          <dt class=\"text-sm font-medium text-gray-500\">Interval</dt>\n          <dd class=\"mt-1 text-sm text-gray-900\">\n            <span class=\"whitespace-pre-wrap\">";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"servicelevels")),"backup")),"interval"), env.opts.autoescape);
output += "</span>\n          </dd>\n        </div>\n        ";
;
}
output += "\n        ";
if(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"servicelevels")),"backup")),"cron")) {
output += "\n        <div class=\"sm:col-span-1\">\n          <dt class=\"text-sm font-medium text-gray-500\">Cron</dt>\n          <dd class=\"mt-1 text-sm text-gray-900\">\n            <span class=\"whitespace-pre-wrap font-mono\">";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"servicelevels")),"backup")),"cron"), env.opts.autoescape);
output += "</span>\n          </dd>\n        </div>\n        ";
;
}
output += "\n        ";
if(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"servicelevels")),"backup")),"recoveryTime")) {
output += "\n        <div class=\"sm:col-span-1\">\n          <dt class=\"text-sm font-medium text-gray-500\">Recovery Time</dt>\n          <dd class=\"mt-1 text-sm text-gray-900\">\n            <span class=\"whitespace-pre-wrap\">";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"servicelevels")),"backup")),"recoveryTime"), env.opts.autoescape);
output += "</span>\n          </dd>\n        </div>\n        ";
;
}
output += "\n        ";
if(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"servicelevels")),"backup")),"recoveryPoint")) {
output += "\n        <div class=\"sm:col-span-1\">\n          <dt class=\"text-sm font-medium text-gray-500\">Recovery Point</dt>\n          <dd class=\"mt-1 text-sm text-gray-900\">\n            <span class=\"whitespace-pre-wrap\">";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"servicelevels")),"backup")),"recoveryPoint"), env.opts.autoescape);
output += "</span>\n          </dd>\n        </div>\n        ";
;
}
output += "\n      </div>\n      ";
;
}
output += "\n    </dl>\n  </div>\n</div>";
if(parentTemplate) {
parentTemplate.rootRenderFunc(env, context, frame, runtime, cb);
} else {
cb(null, output);
}
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
return {
root: root
};

})();
})();
(function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["partials/datacontract_terms.html"] = (function() {
function root(env, context, frame, runtime, cb) {
var lineno = 0;
var colno = 0;
var output = "";
try {
var parentTemplate = null;
output += "<div class=\"px-4 sm:px-0\">\n  <h1 class=\"text-base font-semibold leading-6 text-gray-900\" id=\"terms\">Terms</h1>\n  <p class=\"text-sm text-gray-500\">Terms and conditions of the data contract</p>\n</div>\n<div class=\"mt-2 overflow-hidden shadow sm:rounded-lg bg-white\">\n\n  <div class=\"px-4 py-5 sm:px-6\">\n\n    <dl class=\"grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2\">\n      <div class=\"sm:col-span-1\">\n        <dt class=\"text-sm font-medium text-gray-500\">Usage</dt>\n        <dd class=\"mt-1 text-sm text-gray-900\" >\n          <span class=\"whitespace-pre-wrap\">";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"terms")),"usage"), env.opts.autoescape);
output += "</span>\n        </dd>\n      </div>\n\n      <div class=\"sm:col-span-1\">\n        <dt class=\"text-sm font-medium text-gray-500\">Limitations</dt>\n        <dd class=\"mt-1 text-sm text-gray-900\" >\n          <span class=\"whitespace-pre-wrap\">";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"terms")),"limitations"), env.opts.autoescape);
output += "</span>\n        </dd>\n      </div>\n\n      ";
if(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"terms")),"billing")) {
output += "\n      <div class=\"sm:col-span-1\">\n        <dt class=\"text-sm font-medium text-gray-500\">Billing</dt>\n        <dd class=\"mt-1 text-sm text-gray-900\" >\n          <span class=\"whitespace-pre-wrap\">";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"terms")),"billing"), env.opts.autoescape);
output += "</span>\n        </dd>\n      </div>\n      ";
;
}
output += "\n\n      ";
if(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"terms")),"noticePeriod")) {
output += "\n        <div class=\"sm:col-span-1\">\n          <dt class=\"text-sm font-medium text-gray-500\">Notice Period</dt>\n          <dd class=\"mt-1 text-sm text-gray-900 flex\" >\n            <span class=\"whitespace-pre-wrap\">";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"terms")),"noticePeriod"), env.opts.autoescape);
output += "</span>\n          </dd>\n        </div>\n      ";
;
}
output += "\n\n    </dl>\n  </div>\n</div>";
if(parentTemplate) {
parentTemplate.rootRenderFunc(env, context, frame, runtime, cb);
} else {
cb(null, output);
}
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
return {
root: root
};

})();
})();
(function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["partials/definition.html"] = (function() {
function root(env, context, frame, runtime, cb) {
var lineno = 0;
var colno = 0;
var output = "";
try {
var parentTemplate = null;
output += "<div class=\"mt-3 flow-root\">\n  <div class=\"-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8\">\n    <div class=\"inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8\">\n      <div class=\"overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg\">\n\n        <table class=\"min-w-full divide-y divide-gray-300\">\n          <thead class=\"bg-gray-50\">\n          <tr>\n            <th scope=\"colgroup\" colspan=\"3\" class=\"py-2 pl-4 pr-3 text-left font-semibold text-gray-900 sm:pl-6\">\n              <span>";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "definition_name"), env.opts.autoescape);
output += "</span>\n              <span class=\"inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10\">";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "definition")),"domain"), env.opts.autoescape);
output += "</span>\n              <div class=\"text-sm font-medium text-gray-500\">";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "definition")),"description"), env.opts.autoescape);
output += "</div>\n            </th>\n          </tr>\n          </thead>\n          <tbody class=\"divide-y divide-gray-200 bg-white\">\n            <tr>\n              <td class=\"whitespace-nowrap py-2 pl-4 pr-2 text-sm font-medium text-gray-900 sm:pl-6 w-2/12\">\n                <div class=\"py-2 text-sm\">\n                  ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "definition")),"title")) {
output += "\n                  <div>";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "definition")),"title"), env.opts.autoescape);
output += "</div>\n                  ";
;
}
output += "\n                  <div class=\"font-mono\">";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "definition")),"name"), env.opts.autoescape);
output += "</div>\n                </div>\n              </td>\n              <td class=\"whitespace-nowrap px-1 py-2 text-sm text-gray-500 w-1/12\">\n                <div class=\"py-2 text-sm\">\n                  ";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "definition")),"type"), env.opts.autoescape);
output += "\n                  ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "definition")),"format")) {
output += "\n                    <span class=\"inline-flex items-center rounded-md bg-blue-50 px-1 py-1 text-xs font-medium text-blue-600 ring-1 ring-inset ring-blue-500/10 mr-1 mt-1\">";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "definition")),"format"), env.opts.autoescape);
output += "</span>\n                  ";
;
}
output += "\n                </div>\n              </td>\n              <td class=\"px-3 py-2 text-sm text-gray-500 w-9/12\">\n                ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "definition")),"example")) {
output += "\n                <div class=\"mt-1\">\n                  <span class=\"text-gray-600 font-medium\">Example:</span> <span class=\"font-mono\">";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "definition")),"example"), env.opts.autoescape);
output += "</span>\n                </div>\n                ";
;
}
output += "\n                ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "definition")),"tags")) {
output += "\n                <div>\n                  <span class=\"text-gray-600 font-medium\">Tags:</span>\n                  ";
frame = frame.push();
var t_3 = runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "definition")),"tags");
if(t_3) {t_3 = runtime.fromIterator(t_3);
var t_2 = t_3.length;
for(var t_1=0; t_1 < t_3.length; t_1++) {
var t_4 = t_3[t_1];
frame.set("tag", t_4);
frame.set("loop.index", t_1 + 1);
frame.set("loop.index0", t_1);
frame.set("loop.revindex", t_2 - t_1);
frame.set("loop.revindex0", t_2 - t_1 - 1);
frame.set("loop.first", t_1 === 0);
frame.set("loop.last", t_1 === t_2 - 1);
frame.set("loop.length", t_2);
output += "\n                  <span class=\"inline-flex items-center rounded-md bg-gray-50 px-1 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 mr-1 mt-1\">";
output += runtime.suppressValue(t_4, env.opts.autoescape);
output += "</span>\n                  ";
;
}
}
frame = frame.pop();
output += "\n                </div>\n                ";
;
}
output += "\n                ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "definition")),"enum")) {
output += "\n                <div class=\"py-2 text-sm\">\n                  <span class=\"text-gray-600 font-medium\">Enum:</span>\n                  ";
frame = frame.push();
var t_7 = runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "definition")),"enum");
if(t_7) {t_7 = runtime.fromIterator(t_7);
var t_6 = t_7.length;
for(var t_5=0; t_5 < t_7.length; t_5++) {
var t_8 = t_7[t_5];
frame.set("value", t_8);
frame.set("loop.index", t_5 + 1);
frame.set("loop.index0", t_5);
frame.set("loop.revindex", t_6 - t_5);
frame.set("loop.revindex0", t_6 - t_5 - 1);
frame.set("loop.first", t_5 === 0);
frame.set("loop.last", t_5 === t_6 - 1);
frame.set("loop.length", t_6);
output += "\n                  <span class=\"inline-flex items-center rounded-md bg-gray-50 px-1 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 mr-1 mt-1\">";
output += runtime.suppressValue(t_8, env.opts.autoescape);
output += "</span>\n                  ";
;
}
}
frame = frame.pop();
output += "\n                </div>\n                ";
;
}
output += "\n                <div>\n                  ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "definition")),"minLength")) {
output += "\n                  <span class=\"inline-flex items-center rounded-md bg-gray-50 px-1 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 mr-1 mt-1\">minLength:";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "definition")),"minLength"), env.opts.autoescape);
output += "</span>\n                  ";
;
}
output += "\n                  ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "definition")),"maxLength")) {
output += "\n                  <span class=\"inline-flex items-center rounded-md bg-gray-50 px-1 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 mr-1 mt-1\">maxLength:";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "definition")),"maxLength"), env.opts.autoescape);
output += "</span>\n                  ";
;
}
output += "\n                  ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "definition")),"pattern")) {
output += "\n                  <span class=\"inline-flex items-center rounded-md bg-gray-50 px-1 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 mr-1 mt-1\">pattern:";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "definition")),"pattern"), env.opts.autoescape);
output += "</span>\n                  ";
;
}
output += "\n                  ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "definition")),"precision")) {
output += "\n                  <span class=\"inline-flex items-center rounded-md bg-gray-50 px-1 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 mr-1 mt-1\">precision:";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "definition")),"precision"), env.opts.autoescape);
output += "</span>\n                  ";
;
}
output += "\n                  ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "definition")),"scale")) {
output += "\n                  <span class=\"inline-flex items-center rounded-md bg-gray-50 px-1 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 mr-1 mt-1\">scale:";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "definition")),"scale"), env.opts.autoescape);
output += "</span>\n                  ";
;
}
output += "\n                  ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "definition")),"minimum")) {
output += "\n                  <span class=\"inline-flex items-center rounded-md bg-gray-50 px-1 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 mr-1 mt-1\">minimum:";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "definition")),"minimum"), env.opts.autoescape);
output += "</span>\n                  ";
;
}
output += "\n                  ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "definition")),"exclusiveMinimum")) {
output += "\n                  <span class=\"inline-flex items-center rounded-md bg-gray-50 px-1 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 mr-1 mt-1\">exclusiveMinimum:";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "definition")),"exclusiveMinimum"), env.opts.autoescape);
output += "</span>\n                  ";
;
}
output += "\n                  ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "definition")),"maximum")) {
output += "\n                  <span class=\"inline-flex items-center rounded-md bg-gray-50 px-1 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 mr-1 mt-1\">maximum:";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "definition")),"maximum"), env.opts.autoescape);
output += "</span>\n                  ";
;
}
output += "\n                  ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "definition")),"exclusiveMaximum")) {
output += "\n                  <span class=\"inline-flex items-center rounded-md bg-gray-50 px-1 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 mr-1 mt-1\">exclusiveMaximum:";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "definition")),"exclusiveMaximum"), env.opts.autoescape);
output += "</span>\n                  ";
;
}
output += "\n                  ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "definition")),"classification")) {
output += "\n                  <span class=\"inline-flex items-center rounded-md bg-blue-50 px-1 py-1 text-xs font-medium text-blue-600 ring-1 ring-inset ring-blue-500/10 mr-1 mt-1\">";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "definition")),"classification"), env.opts.autoescape);
output += "</span>\n                  ";
;
}
output += "\n                  ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "definition")),"pii")) {
output += "\n                  <span class=\"inline-flex items-center rounded-md bg-yellow-50 px-1 py-1 text-xs font-medium text-yellow-600 ring-1 ring-inset ring-yellow-500/10 mr-1 mt-1\">PII</span>\n                  ";
;
}
output += "\n                </div>\n              </td>\n\n            </tr>\n          </tbody>\n        </table>\n      </div>\n    </div>\n  </div>\n</div>";
if(parentTemplate) {
parentTemplate.rootRenderFunc(env, context, frame, runtime, cb);
} else {
cb(null, output);
}
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
return {
root: root
};

})();
})();
(function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["partials/example.html"] = (function() {
function root(env, context, frame, runtime, cb) {
var lineno = 0;
var colno = 0;
var output = "";
try {
var parentTemplate = null;
output += "<div class=\"mt-3 flow-root\">\n  <div class=\"-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8\">\n    <div class=\"inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8\">\n      <div class=\"overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg\">\n\n        <table class=\"min-w-full divide-y divide-gray-300\">\n          <thead class=\"bg-gray-50\">\n          <tr>\n            <th scope=\"colgroup\" colspan=\"3\" class=\"py-2 pl-4 pr-3 text-left font-semibold text-gray-900 sm:pl-6\">\n              <span>";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "example")),"model"), env.opts.autoescape);
output += "</span>\n              <span class=\"inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10\">";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "example")),"type"), env.opts.autoescape);
output += "</span>\n              <div class=\"text-sm font-medium text-gray-500\">";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "example")),"description"), env.opts.autoescape);
output += "</div>\n            </th>\n          </tr>\n          </thead>\n          <tbody class=\"divide-y divide-gray-200 bg-white\">\n            <tr>\n              <td class=\"whitespace-nowrap py-2 pl-4 pr-2 text-sm font-medium text-gray-900 sm:pl-6 w-12/12\">\n                <pre>";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "example")),"data"), env.opts.autoescape);
output += "</pre>\n              </td>\n            </tr>\n          </tbody>\n        </table>\n      </div>\n    </div>\n  </div>\n</div>";
if(parentTemplate) {
parentTemplate.rootRenderFunc(env, context, frame, runtime, cb);
} else {
cb(null, output);
}
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
return {
root: root
};

})();
})();
(function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["partials/model_field.html"] = (function() {
function root(env, context, frame, runtime, cb) {
var lineno = 0;
var colno = 0;
var output = "";
try {
var parentTemplate = null;
if(runtime.contextOrFrameLookup(context, frame, "nested")) {
output += "\n<tr class=\"bg-gray-50\">\n  <td class=\"whitespace-nowrap py-2 pl-4 pr-2 text-sm font-medium text-gray-900 sm:pl-6 w-2/12 flex items-center gap-x-4\">\n    ";
output += "\n    ";
frame = frame.push();
var t_3 = (lineno = 4, colno = 21, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "range"), "range", context, [0,runtime.contextOrFrameLookup(context, frame, "level")]));
if(t_3) {t_3 = runtime.fromIterator(t_3);
var t_2 = t_3.length;
for(var t_1=0; t_1 < t_3.length; t_1++) {
var t_4 = t_3[t_1];
frame.set("i", t_4);
frame.set("loop.index", t_1 + 1);
frame.set("loop.index0", t_1);
frame.set("loop.revindex", t_2 - t_1);
frame.set("loop.revindex0", t_2 - t_1 - 1);
frame.set("loop.first", t_1 === 0);
frame.set("loop.last", t_1 === t_2 - 1);
frame.set("loop.length", t_2);
output += "\n    <div class=\"w-2\">&nbsp;</div>\n    ";
;
}
}
frame = frame.pop();
output += "\n    <div>\n      &#x21b3;\n    </div>\n";
;
}
else {
output += "\n<tr>\n  <td class=\"whitespace-nowrap py-2 pl-4 pr-2 text-sm font-medium text-gray-900 sm:pl-6 w-2/12\">\n";
;
}
output += "\n    <div class=\"py-2 text-sm\">\n      ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "field")),"title")) {
output += "\n      <div>";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "field")),"title"), env.opts.autoescape);
output += "</div>\n      ";
;
}
output += "\n      <div class=\"font-mono\">";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "field_name"), env.opts.autoescape);
output += "</div>\n    </div>\n  </td>\n  <td class=\"whitespace-nowrap px-1 py-2 text-sm text-gray-500 w-1/12\">\n    ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "field")),"type")) {
output += "\n    ";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "field")),"type"), env.opts.autoescape);
output += "\n    ";
;
}
output += "\n  </td>\n  <td class=\"px-3 py-2 text-sm text-gray-500 w-7/12\">\n    ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "field")),"description")) {
output += "\n    <div class=\"text-gray-500\">";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "field")),"description"), env.opts.autoescape);
output += "</div>\n    ";
;
}
else {
output += "\n    <div class=\"text-gray-400\">No description</div>\n    ";
;
}
output += "\n\n    ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "field")),"example")) {
output += "\n    <div class=\"mt-1 italic\">\n      Example: <span class=\"font-mono\">";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "field")),"example"), env.opts.autoescape);
output += "</span>\n    </div>\n    ";
;
}
output += "\n\n    <div>\n      ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "field")),"primary")) {
output += "\n      <span class=\"inline-flex items-center rounded-md bg-gray-50 px-1 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 mr-1 mt-1\">primary</span>\n      ";
;
}
output += "\n      ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "field")),"required")) {
output += "\n      <span class=\"inline-flex items-center rounded-md bg-gray-50 px-1 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 mr-1 mt-1\">required</span>\n      ";
;
}
output += "\n      ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "field")),"unique")) {
output += "\n      <span class=\"inline-flex items-center rounded-md bg-gray-50 px-1 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 mr-1 mt-1\">unique</span>\n      ";
;
}
output += "\n      ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "field")),"format")) {
output += "\n      <span class=\"inline-flex items-center rounded-md bg-gray-50 px-1 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 mr-1 mt-1\">format:";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "field")),"format"), env.opts.autoescape);
output += "</span>\n      ";
;
}
output += "\n      ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "field")),"minLength")) {
output += "\n      <span class=\"inline-flex items-center rounded-md bg-gray-50 px-1 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 mr-1 mt-1\">minLength:";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "field")),"minLength"), env.opts.autoescape);
output += "</span>\n      ";
;
}
output += "\n      ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "field")),"maxLength")) {
output += "\n      <span class=\"inline-flex items-center rounded-md bg-gray-50 px-1 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 mr-1 mt-1\">maxLength:";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "field")),"maxLength"), env.opts.autoescape);
output += "</span>\n      ";
;
}
output += "\n      ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "field")),"pattern")) {
output += "\n      <span class=\"inline-flex items-center rounded-md bg-gray-50 px-1 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 mr-1 mt-1\">pattern:";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "field")),"pattern"), env.opts.autoescape);
output += "</span>\n      ";
;
}
output += "\n      ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "field")),"precision")) {
output += "\n      <span class=\"inline-flex items-center rounded-md bg-gray-50 px-1 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 mr-1 mt-1\">precision:";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "field")),"precision"), env.opts.autoescape);
output += "</span>\n      ";
;
}
output += "\n      ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "field")),"scale")) {
output += "\n      <span class=\"inline-flex items-center rounded-md bg-gray-50 px-1 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 mr-1 mt-1\">scale:";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "field")),"scale"), env.opts.autoescape);
output += "</span>\n      ";
;
}
output += "\n      ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "field")),"minimum")) {
output += "\n      <span class=\"inline-flex items-center rounded-md bg-gray-50 px-1 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 mr-1 mt-1\">minimum:";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "field")),"minimum"), env.opts.autoescape);
output += "</span>\n      ";
;
}
output += "\n      ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "field")),"exclusiveMinimum")) {
output += "\n      <span class=\"inline-flex items-center rounded-md bg-gray-50 px-1 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 mr-1 mt-1\">exclusiveMinimum:";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "field")),"exclusiveMinimum"), env.opts.autoescape);
output += "</span>\n      ";
;
}
output += "\n      ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "field")),"maximum")) {
output += "\n      <span class=\"inline-flex items-center rounded-md bg-gray-50 px-1 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 mr-1 mt-1\">maximum:";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "field")),"maximum"), env.opts.autoescape);
output += "</span>\n      ";
;
}
output += "\n      ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "field")),"exclusiveMaximum")) {
output += "\n      <span class=\"inline-flex items-center rounded-md bg-gray-50 px-1 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 mr-1 mt-1\">exclusiveMaximum:";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "field")),"exclusiveMaximum"), env.opts.autoescape);
output += "</span>\n      ";
;
}
output += "\n      ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "field")),"classification")) {
output += "\n      <span class=\"inline-flex items-center rounded-md bg-blue-50 px-1 py-1 text-xs font-medium text-blue-600 ring-1 ring-inset ring-blue-500/10 mr-1 mt-1\">";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "field")),"classification"), env.opts.autoescape);
output += "</span>\n      ";
;
}
output += "\n      ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "field")),"pii")) {
output += "\n      <span class=\"inline-flex items-center rounded-md bg-yellow-50 px-1 py-1 text-xs font-medium text-yellow-600 ring-1 ring-inset ring-yellow-500/10 mr-1 mt-1\">PII</span>\n      ";
;
}
output += "\n    </div>\n  </td>\n</tr>\n\n";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "field")),"fields")) {
output += "\n";
frame = frame.push();
var t_7 = (lineno = 90, colno = 46, runtime.callWrap(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "field")),"fields")),"items"), "field[\"fields\"][\"items\"]", context, []));
if(t_7) {t_7 = runtime.fromIterator(t_7);
var t_5;
if(runtime.isArray(t_7)) {
var t_6 = t_7.length;
for(t_5=0; t_5 < t_7.length; t_5++) {
var t_8 = t_7[t_5][0];
frame.set("[object Object]", t_7[t_5][0]);
var t_9 = t_7[t_5][1];
frame.set("[object Object]", t_7[t_5][1]);
frame.set("loop.index", t_5 + 1);
frame.set("loop.index0", t_5);
frame.set("loop.revindex", t_6 - t_5);
frame.set("loop.revindex0", t_6 - t_5 - 1);
frame.set("loop.first", t_5 === 0);
frame.set("loop.last", t_5 === t_6 - 1);
frame.set("loop.length", t_6);
output += "\n  ";
output += runtime.suppressValue((lineno = 91, colno = 19, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "render_partial"), "render_partial", context, ["partials/model_field.html",runtime.makeKeywordArgs({"nested": runtime.contextOrFrameLookup(context, frame, "True"),"field_name": t_8,"field": t_9,"level": runtime.contextOrFrameLookup(context, frame, "level") + 1})])), env.opts.autoescape);
output += "\n";
;
}
} else {
t_5 = -1;
var t_6 = runtime.keys(t_7).length;
for(var t_10 in t_7) {
t_5++;
var t_11 = t_7[t_10];
frame.set("field_name", t_10);
frame.set("field", t_11);
frame.set("loop.index", t_5 + 1);
frame.set("loop.index0", t_5);
frame.set("loop.revindex", t_6 - t_5);
frame.set("loop.revindex0", t_6 - t_5 - 1);
frame.set("loop.first", t_5 === 0);
frame.set("loop.last", t_5 === t_6 - 1);
frame.set("loop.length", t_6);
output += "\n  ";
output += runtime.suppressValue((lineno = 91, colno = 19, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "render_partial"), "render_partial", context, ["partials/model_field.html",runtime.makeKeywordArgs({"nested": runtime.contextOrFrameLookup(context, frame, "True"),"field_name": t_10,"field": t_11,"level": runtime.contextOrFrameLookup(context, frame, "level") + 1})])), env.opts.autoescape);
output += "\n";
;
}
}
}
frame = frame.pop();
output += "\n<!-- Mark the end of the contained fields -->\n<tr style=\"--tw-divide-y-reverse: 2\">\n</tr>\n";
;
}
if(parentTemplate) {
parentTemplate.rootRenderFunc(env, context, frame, runtime, cb);
} else {
cb(null, output);
}
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
return {
root: root
};

})();
})();
(function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["partials/server.html"] = (function() {
function root(env, context, frame, runtime, cb) {
var lineno = 0;
var colno = 0;
var output = "";
try {
var parentTemplate = null;
output += "<li class=\"relative flex gap-x-6 px-4 py-5 sm:px-6\">\n  <div class=\"flex items-center gap-x-4\">\n    <div class=\"hidden sm:flex sm:flex-col\">\n      <dt class=\"text-sm font-medium text-gray-500\">Server</dt>\n      <dd class=\"mt-1 text-sm text-gray-900\">";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "server_name"), env.opts.autoescape);
output += "</dd>\n    </div>\n  </div>\n\n  ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "server")),"type")) {
output += "\n  <div class=\"flex items-center gap-x-4\">\n    <div class=\"hidden sm:flex sm:flex-col\">\n      <dt class=\"text-sm font-medium text-gray-500\">Type</dt>\n      <dd class=\"mt-1 text-sm text-gray-900\">";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "server")),"type"), env.opts.autoescape);
output += "</dd>\n    </div>\n  </div>\n  ";
;
}
output += "\n\n  ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "server")),"project")) {
output += "\n  <div class=\"flex items-center gap-x-4\">\n    <div class=\"hidden sm:flex sm:flex-col\">\n      <dt class=\"text-sm font-medium text-gray-500\">Project</dt>\n      <dd class=\"mt-1 text-sm text-gray-900\">";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "server")),"project"), env.opts.autoescape);
output += "</dd>\n    </div>\n  </div>\n  ";
;
}
output += "\n\n  ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "server")),"dataset")) {
output += "\n  <div class=\"flex items-center gap-x-4\">\n    <div class=\"hidden sm:flex sm:flex-col\">\n      <dt class=\"text-sm font-medium text-gray-500\">Dataset</dt>\n      <dd class=\"mt-1 text-sm text-gray-900\">";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "server")),"dataset"), env.opts.autoescape);
output += "</dd>\n    </div>\n  </div>\n  ";
;
}
output += "\n\n  ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "server")),"location")) {
output += "\n  <div class=\"flex items-center gap-x-4\">\n    <div class=\"hidden sm:flex sm:flex-col\">\n      <dt class=\"text-sm font-medium text-gray-500\">Location</dt>\n      <dd class=\"mt-1 text-sm text-gray-900\">";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "server")),"location"), env.opts.autoescape);
output += "</dd>\n    </div>\n  </div>\n  ";
;
}
output += "\n\n  ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "server")),"endpointUrl")) {
output += "\n  <div class=\"flex items-center gap-x-4\">\n    <div class=\"hidden sm:flex sm:flex-col\">\n      <dt class=\"text-sm font-medium text-gray-500\">Endpoint URL</dt>\n      <dd class=\"mt-1 text-sm text-gray-900\">";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "server")),"endpointUrl"), env.opts.autoescape);
output += "</dd>\n    </div>\n  </div>\n  ";
;
}
output += "\n\n  ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "server")),"account")) {
output += "\n  <div class=\"flex items-center gap-x-4\">\n    <div class=\"hidden sm:flex sm:flex-col\">\n      <dt class=\"text-sm font-medium text-gray-500\">Account</dt>\n      <dd class=\"mt-1 text-sm text-gray-900\">";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "server")),"account"), env.opts.autoescape);
output += "</dd>\n    </div>\n  </div>\n  ";
;
}
output += "\n\n  ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "server")),"host")) {
output += "\n  <div class=\"flex items-center gap-x-4\">\n    <div class=\"hidden sm:flex sm:flex-col\">\n      <dt class=\"text-sm font-medium text-gray-500\">Host</dt>\n      <dd class=\"mt-1 text-sm text-gray-900\">";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "server")),"host"), env.opts.autoescape);
output += "</dd>\n    </div>\n  </div>\n  ";
;
}
output += "\n\n  ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "server")),"port")) {
output += "\n  <div class=\"flex items-center gap-x-4\">\n    <div class=\"hidden sm:flex sm:flex-col\">\n      <dt class=\"text-sm font-medium text-gray-500\">Port</dt>\n      <dd class=\"mt-1 text-sm text-gray-900\">";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "server")),"port"), env.opts.autoescape);
output += "</dd>\n    </div>\n  </div>\n  ";
;
}
output += "\n\n  ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "server")),"catalog")) {
output += "\n  <div class=\"flex items-center gap-x-4\">\n    <div class=\"hidden sm:flex sm:flex-col\">\n      <dt class=\"text-sm font-medium text-gray-500\">Catalog</dt>\n      <dd class=\"mt-1 text-sm text-gray-900\">";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "server")),"catalog"), env.opts.autoescape);
output += "</dd>\n    </div>\n  </div>\n  ";
;
}
output += "\n\n  ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "server")),"database")) {
output += "\n  <div class=\"flex items-center gap-x-4\">\n    <div class=\"hidden sm:flex sm:flex-col\">\n      <dt class=\"text-sm font-medium text-gray-500\">Database</dt>\n      <dd class=\"mt-1 text-sm text-gray-900\">";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "server")),"database"), env.opts.autoescape);
output += "</dd>\n    </div>\n  </div>\n  ";
;
}
output += "\n\n  ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "server")),"schema_")) {
output += "\n  <div class=\"flex items-center gap-x-4\">\n    <div class=\"hidden sm:flex sm:flex-col\">\n      <dt class=\"text-sm font-medium text-gray-500\">Schema</dt>\n      <dd class=\"mt-1 text-sm text-gray-900\">";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "server")),"schema_"), env.opts.autoescape);
output += "</dd>\n    </div>\n  </div>\n  ";
;
}
output += "\n\n  ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "server")),"topic")) {
output += "\n  <div class=\"flex items-center gap-x-4\">\n    <div class=\"hidden sm:flex sm:flex-col\">\n      <dt class=\"text-sm font-medium text-gray-500\">Topic</dt>\n      <dd class=\"mt-1 text-sm text-gray-900\">";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "server")),"topic"), env.opts.autoescape);
output += "</dd>\n    </div>\n  </div>\n  ";
;
}
output += "\n\n  ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "server")),"path")) {
output += "\n  <div class=\"flex items-center gap-x-4\">\n    <div class=\"hidden sm:flex sm:flex-col\">\n      <dt class=\"text-sm font-medium text-gray-500\">Path</dt>\n      <dd class=\"mt-1 text-sm text-gray-900\">";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "server")),"path"), env.opts.autoescape);
output += "</dd>\n    </div>\n  </div>\n  ";
;
}
output += "\n\n  ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "server")),"format")) {
output += "\n  <div class=\"flex items-center gap-x-4\">\n    <div class=\"hidden sm:flex sm:flex-col\">\n      <dt class=\"text-sm font-medium text-gray-500\">Format</dt>\n      <dd class=\"mt-1 text-sm text-gray-900\">";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "server")),"format"), env.opts.autoescape);
output += "</dd>\n    </div>\n  </div>\n  ";
;
}
output += "\n\n  ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "server")),"delimiter")) {
output += "\n  <div class=\"flex items-center gap-x-4\">\n    <div class=\"hidden sm:flex sm:flex-col\">\n      <dt class=\"text-sm font-medium text-gray-500\">Delimiter</dt>\n      <dd class=\"mt-1 text-sm text-gray-900\">";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "server")),"delimiter"), env.opts.autoescape);
output += "</dd>\n    </div>\n  </div>\n  ";
;
}
output += "\n\n</li>";
if(parentTemplate) {
parentTemplate.rootRenderFunc(env, context, frame, runtime, cb);
} else {
cb(null, output);
}
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
return {
root: root
};

})();
})();

