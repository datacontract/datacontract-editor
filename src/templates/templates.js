(function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["datacontract.html"] = (function() {
function root(env, context, frame, runtime, cb) {
var lineno = 0;
var colno = 0;
var output = "";
try {
var parentTemplate = null;
output += "<main class=\"pb-7\">\n\n    <div class=\"pt-5 mx-auto max-w-7xl sm:px-6 lg:px-8\">\n      <div>\n        <div class=\"md:flex md:items-center md:justify-between px-4 sm:px-0\">\n          <div class=\"min-w-0 flex-1\">\n            <h2 class=\"text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight\">\n              Data Contract</h2>\n            <div class=\"mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6\">\n              ";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"id"), env.opts.autoescape);
output += "\n            </div>\n            <div class=\"mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6\">\n              ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"tags")) {
output += "\n              <div class=\"mt-2 flex items-center text-sm text-gray-500 whitespace-nowrap\">\n                <svg xmlns=\"http://www.w3.org/2000/svg\" fill=\"none\" viewBox=\"0 0 24 24\" stroke-width=\"1.5\" stroke=\"currentColor\" class=\"mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400\">\n                  <path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z\" />\n                  <path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M6 6h.008v.008H6V6z\" />\n                </svg>\n                ";
frame = frame.push();
var t_3 = runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"tags");
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
output += "\n                <span class=\"inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 mr-1\">\n                  <span>";
output += runtime.suppressValue(t_4, env.opts.autoescape);
output += "</span>\n                </span>\n                ";
;
}
}
frame = frame.pop();
output += "\n              </div>\n              ";
;
}
output += "\n            </div>\n          </div>\n          <div class=\"mt-5 flex lg:mt-0 lg:ml-4 gap-3 items-center\">\n            <button\n              type=\"button\"\n              onclick=\"document.getElementById('dialog-datacontract-yaml').showModal()\"\n              class=\"inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50\">\n              <svg class=\"-ml-0.5 mr-1.5 h-5 w-5 text-gray-600\" viewBox=\"-0.5 -0.5 24 24\">\n                <path d=\"m4.3125 8.145833333333334 9.104166666666668 0\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1\"></path><path d=\"m4.3125 11.020833333333334 9.104166666666668 0\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1\"></path><path d=\"m4.3125 5.270833333333334 6.708333333333334 0\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1\"></path><path d=\"m4.3125 13.895833333333334 7.1875 0\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1\"></path><path d=\"m4.3125 16.770833333333336 3.8333333333333335 0\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1\"></path><path d=\"M8.145833333333334 22.520833333333336h-6.708333333333334a0.9583333333333334 0.9583333333333334 0 0 1 -0.9583333333333334 -0.9583333333333334v-20.125a0.9583333333333334 0.9583333333333334 0 0 1 0.9583333333333334 -0.9583333333333334h12.739125a0.9583333333333334 0.9583333333333334 0 0 1 0.6775416666666667 0.28079166666666666L18.406708333333334 4.3125a0.9583333333333334 0.9583333333333334 0 0 1 0.28079166666666666 0.6775416666666667V8.145833333333334\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1\"></path><path d=\"m15.045833333333333 21.370833333333334 -4.025 1.15 1.15 -4.025 6.879875 -6.879875a2.032625 2.032625 0 0 1 2.875 2.875Z\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1\"></path><path d=\"m18.188208333333332 12.478458333333334 2.875 2.875\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1\"></path><path d=\"m12.170833333333333 18.495833333333334 2.875 2.875\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1\"></path>\n              </svg>\n              Show YAML\n            </button>\n          </div>\n        </div>\n      </div>\n\n      <div>\n        <div class=\"space-y-6 mt-6\">\n          <section id=\"information\">\n            ";
output += runtime.suppressValue((lineno = 44, colno = 29, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "render_partial"), "render_partial", context, ["partials/datacontract_information.html",runtime.makeKeywordArgs({"datacontract": runtime.contextOrFrameLookup(context, frame, "datacontract")})])), env.opts.autoescape);
output += "\n          </section>\n\n\n          ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"servers")) {
output += "\n          <section id=\"servers\">\n            <div class=\"px-4 sm:px-0\">\n              <h1 class=\"text-base font-semibold leading-6 text-gray-900\" id=\"servers\">Servers</h1>\n              <p class=\"text-sm text-gray-500\">Servers of the data contract</p>\n            </div>\n\n            <ul role=\"list\" class=\"mt-2 divide-y divide-gray-100 overflow-hidden bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-lg\">\n\n              ";
frame = frame.push();
var t_7 = runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"servers");
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
output += "\n                ";
output += runtime.suppressValue((lineno = 58, colno = 33, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "render_partial"), "render_partial", context, ["partials/server.html",runtime.makeKeywordArgs({"server_name": t_8,"server": t_9})])), env.opts.autoescape);
output += "\n              ";
;
}
} else {
t_5 = -1;
var t_6 = runtime.keys(t_7).length;
for(var t_10 in t_7) {
t_5++;
var t_11 = t_7[t_10];
frame.set("server_name", t_10);
frame.set("server", t_11);
frame.set("loop.index", t_5 + 1);
frame.set("loop.index0", t_5);
frame.set("loop.revindex", t_6 - t_5);
frame.set("loop.revindex0", t_6 - t_5 - 1);
frame.set("loop.first", t_5 === 0);
frame.set("loop.last", t_5 === t_6 - 1);
frame.set("loop.length", t_6);
output += "\n                ";
output += runtime.suppressValue((lineno = 58, colno = 33, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "render_partial"), "render_partial", context, ["partials/server.html",runtime.makeKeywordArgs({"server_name": t_10,"server": t_11})])), env.opts.autoescape);
output += "\n              ";
;
}
}
}
frame = frame.pop();
output += "\n\n            </ul>\n\n          </section>\n          ";
;
}
output += "\n\n\n          ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"terms")) {
output += "\n          <section id=\"terms\">\n            ";
output += runtime.suppressValue((lineno = 69, colno = 29, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "render_partial"), "render_partial", context, ["partials/datacontract_terms.html",runtime.makeKeywordArgs({"datacontract": runtime.contextOrFrameLookup(context, frame, "datacontract")})])), env.opts.autoescape);
output += "\n          </section>\n          ";
;
}
output += "\n\n\n          <section id=\"models\">\n            <div class=\"flex justify-between\">\n              <div class=\"px-4 sm:px-0\">\n                <h1 class=\"text-base font-semibold leading-6 text-gray-900\">\n                  Data Model\n                </h1>\n                <p class=\"text-sm text-gray-500\">The logical data model</p>\n              </div>\n            </div>\n\n            ";
frame = frame.push();
var t_14 = runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"models");
if(t_14) {t_14 = runtime.fromIterator(t_14);
var t_12;
if(runtime.isArray(t_14)) {
var t_13 = t_14.length;
for(t_12=0; t_12 < t_14.length; t_12++) {
var t_15 = t_14[t_12][0];
frame.set("[object Object]", t_14[t_12][0]);
var t_16 = t_14[t_12][1];
frame.set("[object Object]", t_14[t_12][1]);
frame.set("loop.index", t_12 + 1);
frame.set("loop.index0", t_12);
frame.set("loop.revindex", t_13 - t_12);
frame.set("loop.revindex0", t_13 - t_12 - 1);
frame.set("loop.first", t_12 === 0);
frame.set("loop.last", t_12 === t_13 - 1);
frame.set("loop.length", t_13);
output += "\n\n            <div class=\"mt-3 flow-root\">\n              <div class=\"-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8\">\n                <div class=\"inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8\">\n                  <div class=\"overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg\">\n\n                    <table class=\"min-w-full divide-y divide-gray-300\">\n                      <thead class=\"bg-gray-50\">\n                      <tr>\n                        <th scope=\"colgroup\" colspan=\"3\" class=\"py-2 pl-4 pr-3 text-left font-semibold text-gray-900 sm:pl-6\">\n                          <span>";
output += runtime.suppressValue(t_15, env.opts.autoescape);
output += "</span>\n                          <span class=\"inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10\">";
output += runtime.suppressValue(runtime.memberLookup((t_16),"type"), env.opts.autoescape);
output += "</span>\n                          <div class=\"text-sm font-medium text-gray-500\">";
output += runtime.suppressValue(runtime.memberLookup((t_16),"description"), env.opts.autoescape);
output += "</div>\n                        </th>\n\n                      </tr>\n                      </thead>\n                      <tbody class=\"divide-y divide-gray-200 bg-white\">\n                      ";
frame = frame.push();
var t_19 = runtime.memberLookup((t_16),"fields");
if(t_19) {t_19 = runtime.fromIterator(t_19);
var t_17;
if(runtime.isArray(t_19)) {
var t_18 = t_19.length;
for(t_17=0; t_17 < t_19.length; t_17++) {
var t_20 = t_19[t_17][0];
frame.set("[object Object]", t_19[t_17][0]);
var t_21 = t_19[t_17][1];
frame.set("[object Object]", t_19[t_17][1]);
frame.set("loop.index", t_17 + 1);
frame.set("loop.index0", t_17);
frame.set("loop.revindex", t_18 - t_17);
frame.set("loop.revindex0", t_18 - t_17 - 1);
frame.set("loop.first", t_17 === 0);
frame.set("loop.last", t_17 === t_18 - 1);
frame.set("loop.length", t_18);
output += "\n                        ";
output += runtime.suppressValue((lineno = 104, colno = 41, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "render_partial"), "render_partial", context, ["partials/model_field.html",runtime.makeKeywordArgs({"nested": false,"field_name": t_20,"field": t_21,"level": 0})])), env.opts.autoescape);
output += "\n                      ";
;
}
} else {
t_17 = -1;
var t_18 = runtime.keys(t_19).length;
for(var t_22 in t_19) {
t_17++;
var t_23 = t_19[t_22];
frame.set("field_name", t_22);
frame.set("field", t_23);
frame.set("loop.index", t_17 + 1);
frame.set("loop.index0", t_17);
frame.set("loop.revindex", t_18 - t_17);
frame.set("loop.revindex0", t_18 - t_17 - 1);
frame.set("loop.first", t_17 === 0);
frame.set("loop.last", t_17 === t_18 - 1);
frame.set("loop.length", t_18);
output += "\n                        ";
output += runtime.suppressValue((lineno = 104, colno = 41, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "render_partial"), "render_partial", context, ["partials/model_field.html",runtime.makeKeywordArgs({"nested": false,"field_name": t_22,"field": t_23,"level": 0})])), env.opts.autoescape);
output += "\n                      ";
;
}
}
}
frame = frame.pop();
output += "\n                      </tbody>\n                    </table>\n                  </div>\n                </div>\n              </div>\n            </div>\n            ";
;
}
} else {
t_12 = -1;
var t_13 = runtime.keys(t_14).length;
for(var t_24 in t_14) {
t_12++;
var t_25 = t_14[t_24];
frame.set("model_name", t_24);
frame.set("model", t_25);
frame.set("loop.index", t_12 + 1);
frame.set("loop.index0", t_12);
frame.set("loop.revindex", t_13 - t_12);
frame.set("loop.revindex0", t_13 - t_12 - 1);
frame.set("loop.first", t_12 === 0);
frame.set("loop.last", t_12 === t_13 - 1);
frame.set("loop.length", t_13);
output += "\n\n            <div class=\"mt-3 flow-root\">\n              <div class=\"-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8\">\n                <div class=\"inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8\">\n                  <div class=\"overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg\">\n\n                    <table class=\"min-w-full divide-y divide-gray-300\">\n                      <thead class=\"bg-gray-50\">\n                      <tr>\n                        <th scope=\"colgroup\" colspan=\"3\" class=\"py-2 pl-4 pr-3 text-left font-semibold text-gray-900 sm:pl-6\">\n                          <span>";
output += runtime.suppressValue(t_24, env.opts.autoescape);
output += "</span>\n                          <span class=\"inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10\">";
output += runtime.suppressValue(runtime.memberLookup((t_25),"type"), env.opts.autoescape);
output += "</span>\n                          <div class=\"text-sm font-medium text-gray-500\">";
output += runtime.suppressValue(runtime.memberLookup((t_25),"description"), env.opts.autoescape);
output += "</div>\n                        </th>\n\n                      </tr>\n                      </thead>\n                      <tbody class=\"divide-y divide-gray-200 bg-white\">\n                      ";
frame = frame.push();
var t_28 = runtime.memberLookup((t_25),"fields");
if(t_28) {t_28 = runtime.fromIterator(t_28);
var t_26;
if(runtime.isArray(t_28)) {
var t_27 = t_28.length;
for(t_26=0; t_26 < t_28.length; t_26++) {
var t_29 = t_28[t_26][0];
frame.set("[object Object]", t_28[t_26][0]);
var t_30 = t_28[t_26][1];
frame.set("[object Object]", t_28[t_26][1]);
frame.set("loop.index", t_26 + 1);
frame.set("loop.index0", t_26);
frame.set("loop.revindex", t_27 - t_26);
frame.set("loop.revindex0", t_27 - t_26 - 1);
frame.set("loop.first", t_26 === 0);
frame.set("loop.last", t_26 === t_27 - 1);
frame.set("loop.length", t_27);
output += "\n                        ";
output += runtime.suppressValue((lineno = 104, colno = 41, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "render_partial"), "render_partial", context, ["partials/model_field.html",runtime.makeKeywordArgs({"nested": false,"field_name": t_29,"field": t_30,"level": 0})])), env.opts.autoescape);
output += "\n                      ";
;
}
} else {
t_26 = -1;
var t_27 = runtime.keys(t_28).length;
for(var t_31 in t_28) {
t_26++;
var t_32 = t_28[t_31];
frame.set("field_name", t_31);
frame.set("field", t_32);
frame.set("loop.index", t_26 + 1);
frame.set("loop.index0", t_26);
frame.set("loop.revindex", t_27 - t_26);
frame.set("loop.revindex0", t_27 - t_26 - 1);
frame.set("loop.first", t_26 === 0);
frame.set("loop.last", t_26 === t_27 - 1);
frame.set("loop.length", t_27);
output += "\n                        ";
output += runtime.suppressValue((lineno = 104, colno = 41, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "render_partial"), "render_partial", context, ["partials/model_field.html",runtime.makeKeywordArgs({"nested": false,"field_name": t_31,"field": t_32,"level": 0})])), env.opts.autoescape);
output += "\n                      ";
;
}
}
}
frame = frame.pop();
output += "\n                      </tbody>\n                    </table>\n                  </div>\n                </div>\n              </div>\n            </div>\n            ";
;
}
}
}
frame = frame.pop();
output += "\n          </section>\n\n          ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"definitions")) {
output += "\n          <section id=\"definitions\">\n            <div class=\"px-4 sm:px-0\">\n              <h1 class=\"text-base font-semibold leading-6 text-gray-900\">Definitions</h1>\n              <p class=\"text-sm text-gray-500\">Domain specific definitions in the data contract</p>\n            </div>\n\n            ";
frame = frame.push();
var t_35 = runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"definitions");
if(t_35) {t_35 = runtime.fromIterator(t_35);
var t_33;
if(runtime.isArray(t_35)) {
var t_34 = t_35.length;
for(t_33=0; t_33 < t_35.length; t_33++) {
var t_36 = t_35[t_33][0];
frame.set("[object Object]", t_35[t_33][0]);
var t_37 = t_35[t_33][1];
frame.set("[object Object]", t_35[t_33][1]);
frame.set("loop.index", t_33 + 1);
frame.set("loop.index0", t_33);
frame.set("loop.revindex", t_34 - t_33);
frame.set("loop.revindex0", t_34 - t_33 - 1);
frame.set("loop.first", t_33 === 0);
frame.set("loop.last", t_33 === t_34 - 1);
frame.set("loop.length", t_34);
output += "\n            ";
output += runtime.suppressValue((lineno = 123, colno = 29, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "render_partial"), "render_partial", context, ["partials/definition.html",runtime.makeKeywordArgs({"definition_name": t_36,"definition": t_37})])), env.opts.autoescape);
output += "\n            ";
;
}
} else {
t_33 = -1;
var t_34 = runtime.keys(t_35).length;
for(var t_38 in t_35) {
t_33++;
var t_39 = t_35[t_38];
frame.set("definition_name", t_38);
frame.set("definition", t_39);
frame.set("loop.index", t_33 + 1);
frame.set("loop.index0", t_33);
frame.set("loop.revindex", t_34 - t_33);
frame.set("loop.revindex0", t_34 - t_33 - 1);
frame.set("loop.first", t_33 === 0);
frame.set("loop.last", t_33 === t_34 - 1);
frame.set("loop.length", t_34);
output += "\n            ";
output += runtime.suppressValue((lineno = 123, colno = 29, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "render_partial"), "render_partial", context, ["partials/definition.html",runtime.makeKeywordArgs({"definition_name": t_38,"definition": t_39})])), env.opts.autoescape);
output += "\n            ";
;
}
}
}
frame = frame.pop();
output += "\n          </section>\n          ";
;
}
output += "\n\n          ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"examples")) {
output += "\n          <section id=\"examples\">\n            <div class=\"px-4 sm:px-0\">\n              <h1 class=\"text-base font-semibold leading-6 text-gray-900\">Examples</h1>\n              <p class=\"text-sm text-gray-500\">Examples for models in the data contract</p>\n            </div>\n            ";
frame = frame.push();
var t_42 = runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"examples");
if(t_42) {t_42 = runtime.fromIterator(t_42);
var t_41 = t_42.length;
for(var t_40=0; t_40 < t_42.length; t_40++) {
var t_43 = t_42[t_40];
frame.set("example", t_43);
frame.set("loop.index", t_40 + 1);
frame.set("loop.index0", t_40);
frame.set("loop.revindex", t_41 - t_40);
frame.set("loop.revindex0", t_41 - t_40 - 1);
frame.set("loop.first", t_40 === 0);
frame.set("loop.last", t_40 === t_41 - 1);
frame.set("loop.length", t_41);
output += "\n              ";
output += runtime.suppressValue((lineno = 135, colno = 31, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "render_partial"), "render_partial", context, ["partials/example.html",runtime.makeKeywordArgs({"example": t_43})])), env.opts.autoescape);
output += "\n            ";
;
}
}
frame = frame.pop();
output += "\n          </section>\n          ";
;
}
output += "\n\n          ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"servicelevels")) {
output += "\n          <section id=\"servicelevels\">\n            ";
output += runtime.suppressValue((lineno = 142, colno = 29, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "render_partial"), "render_partial", context, ["partials/datacontract_servicelevels.html",runtime.makeKeywordArgs({"datacontract": runtime.contextOrFrameLookup(context, frame, "datacontract")})])), env.opts.autoescape);
output += "\n          </section>\n          ";
;
}
output += "\n\n          ";
if(runtime.contextOrFrameLookup(context, frame, "quality_specification")) {
output += "\n            <section id=\"quality\">\n              <div class=\"px-4 sm:px-0\">\n                <h1 class=\"text-base font-semibold leading-6 text-gray-900\">\n                  Quality\n                </h1>\n                <p class=\"text-sm text-gray-500\">\n                  <span>";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"quality")),"type"), env.opts.autoescape);
output += "</span>\n                </p>\n              </div>\n              <div class=\"mt-2 overflow-hidden shadow sm:rounded-lg bg-white\">\n                <div class=\"px-4 py-5 sm:px-6\">\n                  <div id=\"schema-specification\" >\n                      <pre><code class=\"text-sm\">";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "quality_specification"), env.opts.autoescape);
output += "</code></pre>\n                  </div>\n                </div>\n              </div>\n            </section>\n          ";
;
}
output += "\n\n        </div>\n      </div>\n\n      <div class=\"mt-6 text-sm text-gray-400\">\n        Created at ";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "formatted_date"), env.opts.autoescape);
output += " with <a href=\"https://editor.datacontract.com\" class=\"text-gray-400 hover:text-gray-500\">Data Contract Editor</a> v";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "datacontract_cli_version"), env.opts.autoescape);
output += "\n      </div>\n\n    </div>\n  </main>";
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
output += "<div class=\" px-4 sm:px-0\">\n  <h1 class=\"text-base font-semibold leading-6 text-gray-900\" id=\"info\">Info</h1>\n  <p class=\"text-sm text-gray-500\">Information about the data contract</p>\n</div>\n<div class=\"mt-2 overflow-hidden shadow sm:rounded-lg bg-white\">\n\n  <div class=\"px-4 py-5 sm:px-6\">\n\n    ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"links")) {
output += "\n      <div class=\"flex flex-wrap gap-3\">\n        ";
frame = frame.push();
var t_3 = runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"links");
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
output += "\n        <a href=\"";
output += runtime.suppressValue(t_5, env.opts.autoescape);
output += "\" class=\"flex flex-col text-center rounded-md bg-white px-2 py-2 text-sm font-medium text-gray-500 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 mb-6\" target=\"_blank\" style=\"min-width: 100px\">\n          <div class=\"mx-auto w-8 h-8 my-2\">\n            <svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\"><g><path d=\"M23.91,5.29a3.13,3.13,0,0,0-.72-1.23.35.35,0,0,0-.49,0,.34.34,0,0,0,0,.48,2.66,2.66,0,0,1,.54,1,1.56,1.56,0,0,1-.1,1,19.42,19.42,0,0,1-3.49,3.64,9.62,9.62,0,0,1-2.74,1.8,5.51,5.51,0,0,1-1.71.45.91.91,0,0,1-.73-.3c-.2-.22-.52-.52-.82-.83.66-.65,1.32-1.35,2.08-2.09a.3.3,0,0,0,0-.43.31.31,0,0,0-.43,0c-.84.6-1.6,1.14-2.32,1.69a7.18,7.18,0,0,1-.32-.81,5.23,5.23,0,0,1-.23-1,3.23,3.23,0,0,1,.94-2.5,31.64,31.64,0,0,1,3.65-3,5.24,5.24,0,0,1,1.63-1,2.56,2.56,0,0,1,1.77,0,2.08,2.08,0,0,1,.65.41,2.31,2.31,0,0,1,.49.61.3.3,0,0,0,.54-.26A2.78,2.78,0,0,0,21.52,2a2.91,2.91,0,0,0-.84-.57,3.23,3.23,0,0,0-1.81-.18,5.64,5.64,0,0,0-2.38,1.13,30.94,30.94,0,0,0-3.91,3,4.26,4.26,0,0,0-1.29,3.34,6.18,6.18,0,0,0,.27,1.23A11.36,11.36,0,0,0,12,11.06l0,.07-1.21,1c-.76.67-1.5,1.37-2.38,2.07a.34.34,0,0,0-.09.48.35.35,0,0,0,.48.09c1-.58,1.81-1.14,2.62-1.74.36-.26.71-.54,1-.83l.24-.21.82.82a2,2,0,0,0,1.6.67,6.72,6.72,0,0,0,2-.57,10.52,10.52,0,0,0,3-2.1,19.88,19.88,0,0,0,3.58-4.07A2.3,2.3,0,0,0,23.91,5.29Z\" fill=\"#191919\" fill-rule=\"evenodd\"></path><path d=\"M11.86,14.07a.34.34,0,0,0,0,.48.81.81,0,0,1,.29.57,1.28,1.28,0,0,1-.27.65,29.38,29.38,0,0,1-3.6,3.65,9.07,9.07,0,0,1-2.73,1.79,5.43,5.43,0,0,1-1.71.45,1,1,0,0,1-.73-.31c-.22-.25-.6-.61-.93-1a2.71,2.71,0,0,1-.43-.56,9.71,9.71,0,0,1-.39-1,4.53,4.53,0,0,1-.22-1,3.21,3.21,0,0,1,1-2.51,30.47,30.47,0,0,1,3.66-3,5.14,5.14,0,0,1,1.65-1,2.62,2.62,0,0,1,1.79,0,.3.3,0,0,0,.4-.16.31.31,0,0,0-.17-.4,3.16,3.16,0,0,0-1.79-.19A5.63,5.63,0,0,0,5.27,11.7a30.41,30.41,0,0,0-3.93,2.94A4.21,4.21,0,0,0,0,18a6,6,0,0,0,.19,1A9.53,9.53,0,0,0,.7,20.3a3.53,3.53,0,0,0,.47.69c.36.41.83.84,1.09,1.13a2,2,0,0,0,1.59.68,6.21,6.21,0,0,0,2.05-.56,10,10,0,0,0,3-2.1,30.27,30.27,0,0,0,3.6-4,2,2,0,0,0,.36-1.07,1.46,1.46,0,0,0-.53-1A.35.35,0,0,0,11.86,14.07Z\" fill=\"#191919\" fill-rule=\"evenodd\"></path><path d=\"M6.43,15.15l1.16-.79A.31.31,0,0,0,7.73,14a.3.3,0,0,0-.41-.13L6,14.49a7.39,7.39,0,0,0-2.3,1.83,2.35,2.35,0,0,0-.38,2.26,1,1,0,0,0,1,.68,2.41,2.41,0,0,0,1.17-.43,9.29,9.29,0,0,0,.91-.75c.66-.6,1.25-1.26,1.86-1.85a.35.35,0,0,0,0-.49.36.36,0,0,0-.49,0c-.57.45-1.13.95-1.73,1.42a10.58,10.58,0,0,1-1.17.81c-1.23.74-.36-.89-.3-1A7.43,7.43,0,0,1,6.43,15.15Z\" fill=\"#0c6fff\" fill-rule=\"evenodd\"></path><path d=\"M19,7a6.13,6.13,0,0,1-1.26,1.28c-.21.15-.5.38-.78.56a1.9,1.9,0,0,1-.49.25.34.34,0,0,0-.25.41.34.34,0,0,0,.41.26,2.47,2.47,0,0,0,.55-.2c.35-.18.73-.44,1-.61a6.9,6.9,0,0,0,1.57-1.33A8.69,8.69,0,0,0,20.9,6a3.7,3.7,0,0,0,.43-1.13A1,1,0,0,0,21,4a1.36,1.36,0,0,0-.89-.39,3,3,0,0,0-1.08.17,6.4,6.4,0,0,0-1.63.82,15.32,15.32,0,0,0-2,1.7,4.54,4.54,0,0,0-.65.74,2.69,2.69,0,0,0-.31.61,3.5,3.5,0,0,0-.07.9.33.33,0,0,0,.17.24A.31.31,0,0,0,15,8.63c.18-.26-.17-.6.47-1.3A5.64,5.64,0,0,1,16,6.88a19,19,0,0,1,2-1.42,5.88,5.88,0,0,1,1.39-.61A1.87,1.87,0,0,1,20,4.73c.54,0,.12.31-.08.76A7.29,7.29,0,0,1,19,7Z\" fill=\"#0c6fff\" fill-rule=\"evenodd\"></path></g></svg>\n          </div>\n          <div>";
output += runtime.suppressValue(t_4, env.opts.autoescape);
output += "</div>\n        </a>\n        ";
;
}
} else {
t_1 = -1;
var t_2 = runtime.keys(t_3).length;
for(var t_6 in t_3) {
t_1++;
var t_7 = t_3[t_6];
frame.set("name", t_6);
frame.set("href", t_7);
frame.set("loop.index", t_1 + 1);
frame.set("loop.index0", t_1);
frame.set("loop.revindex", t_2 - t_1);
frame.set("loop.revindex0", t_2 - t_1 - 1);
frame.set("loop.first", t_1 === 0);
frame.set("loop.last", t_1 === t_2 - 1);
frame.set("loop.length", t_2);
output += "\n        <a href=\"";
output += runtime.suppressValue(t_7, env.opts.autoescape);
output += "\" class=\"flex flex-col text-center rounded-md bg-white px-2 py-2 text-sm font-medium text-gray-500 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 mb-6\" target=\"_blank\" style=\"min-width: 100px\">\n          <div class=\"mx-auto w-8 h-8 my-2\">\n            <svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\"><g><path d=\"M23.91,5.29a3.13,3.13,0,0,0-.72-1.23.35.35,0,0,0-.49,0,.34.34,0,0,0,0,.48,2.66,2.66,0,0,1,.54,1,1.56,1.56,0,0,1-.1,1,19.42,19.42,0,0,1-3.49,3.64,9.62,9.62,0,0,1-2.74,1.8,5.51,5.51,0,0,1-1.71.45.91.91,0,0,1-.73-.3c-.2-.22-.52-.52-.82-.83.66-.65,1.32-1.35,2.08-2.09a.3.3,0,0,0,0-.43.31.31,0,0,0-.43,0c-.84.6-1.6,1.14-2.32,1.69a7.18,7.18,0,0,1-.32-.81,5.23,5.23,0,0,1-.23-1,3.23,3.23,0,0,1,.94-2.5,31.64,31.64,0,0,1,3.65-3,5.24,5.24,0,0,1,1.63-1,2.56,2.56,0,0,1,1.77,0,2.08,2.08,0,0,1,.65.41,2.31,2.31,0,0,1,.49.61.3.3,0,0,0,.54-.26A2.78,2.78,0,0,0,21.52,2a2.91,2.91,0,0,0-.84-.57,3.23,3.23,0,0,0-1.81-.18,5.64,5.64,0,0,0-2.38,1.13,30.94,30.94,0,0,0-3.91,3,4.26,4.26,0,0,0-1.29,3.34,6.18,6.18,0,0,0,.27,1.23A11.36,11.36,0,0,0,12,11.06l0,.07-1.21,1c-.76.67-1.5,1.37-2.38,2.07a.34.34,0,0,0-.09.48.35.35,0,0,0,.48.09c1-.58,1.81-1.14,2.62-1.74.36-.26.71-.54,1-.83l.24-.21.82.82a2,2,0,0,0,1.6.67,6.72,6.72,0,0,0,2-.57,10.52,10.52,0,0,0,3-2.1,19.88,19.88,0,0,0,3.58-4.07A2.3,2.3,0,0,0,23.91,5.29Z\" fill=\"#191919\" fill-rule=\"evenodd\"></path><path d=\"M11.86,14.07a.34.34,0,0,0,0,.48.81.81,0,0,1,.29.57,1.28,1.28,0,0,1-.27.65,29.38,29.38,0,0,1-3.6,3.65,9.07,9.07,0,0,1-2.73,1.79,5.43,5.43,0,0,1-1.71.45,1,1,0,0,1-.73-.31c-.22-.25-.6-.61-.93-1a2.71,2.71,0,0,1-.43-.56,9.71,9.71,0,0,1-.39-1,4.53,4.53,0,0,1-.22-1,3.21,3.21,0,0,1,1-2.51,30.47,30.47,0,0,1,3.66-3,5.14,5.14,0,0,1,1.65-1,2.62,2.62,0,0,1,1.79,0,.3.3,0,0,0,.4-.16.31.31,0,0,0-.17-.4,3.16,3.16,0,0,0-1.79-.19A5.63,5.63,0,0,0,5.27,11.7a30.41,30.41,0,0,0-3.93,2.94A4.21,4.21,0,0,0,0,18a6,6,0,0,0,.19,1A9.53,9.53,0,0,0,.7,20.3a3.53,3.53,0,0,0,.47.69c.36.41.83.84,1.09,1.13a2,2,0,0,0,1.59.68,6.21,6.21,0,0,0,2.05-.56,10,10,0,0,0,3-2.1,30.27,30.27,0,0,0,3.6-4,2,2,0,0,0,.36-1.07,1.46,1.46,0,0,0-.53-1A.35.35,0,0,0,11.86,14.07Z\" fill=\"#191919\" fill-rule=\"evenodd\"></path><path d=\"M6.43,15.15l1.16-.79A.31.31,0,0,0,7.73,14a.3.3,0,0,0-.41-.13L6,14.49a7.39,7.39,0,0,0-2.3,1.83,2.35,2.35,0,0,0-.38,2.26,1,1,0,0,0,1,.68,2.41,2.41,0,0,0,1.17-.43,9.29,9.29,0,0,0,.91-.75c.66-.6,1.25-1.26,1.86-1.85a.35.35,0,0,0,0-.49.36.36,0,0,0-.49,0c-.57.45-1.13.95-1.73,1.42a10.58,10.58,0,0,1-1.17.81c-1.23.74-.36-.89-.3-1A7.43,7.43,0,0,1,6.43,15.15Z\" fill=\"#0c6fff\" fill-rule=\"evenodd\"></path><path d=\"M19,7a6.13,6.13,0,0,1-1.26,1.28c-.21.15-.5.38-.78.56a1.9,1.9,0,0,1-.49.25.34.34,0,0,0-.25.41.34.34,0,0,0,.41.26,2.47,2.47,0,0,0,.55-.2c.35-.18.73-.44,1-.61a6.9,6.9,0,0,0,1.57-1.33A8.69,8.69,0,0,0,20.9,6a3.7,3.7,0,0,0,.43-1.13A1,1,0,0,0,21,4a1.36,1.36,0,0,0-.89-.39,3,3,0,0,0-1.08.17,6.4,6.4,0,0,0-1.63.82,15.32,15.32,0,0,0-2,1.7,4.54,4.54,0,0,0-.65.74,2.69,2.69,0,0,0-.31.61,3.5,3.5,0,0,0-.07.9.33.33,0,0,0,.17.24A.31.31,0,0,0,15,8.63c.18-.26-.17-.6.47-1.3A5.64,5.64,0,0,1,16,6.88a19,19,0,0,1,2-1.42,5.88,5.88,0,0,1,1.39-.61A1.87,1.87,0,0,1,20,4.73c.54,0,.12.31-.08.76A7.29,7.29,0,0,1,19,7Z\" fill=\"#0c6fff\" fill-rule=\"evenodd\"></path></g></svg>\n          </div>\n          <div>";
output += runtime.suppressValue(t_6, env.opts.autoescape);
output += "</div>\n        </a>\n        ";
;
}
}
}
frame = frame.pop();
output += "\n      </div>\n    ";
;
}
output += "\n\n    <dl class=\"grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2\">\n      <div class=\"sm:col-span-1\">\n        <dt class=\"text-sm font-medium text-gray-500\">Title</dt>\n        <dd class=\"mt-1 text-sm text-gray-900\">";
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
frame = frame.push();
var t_10 = runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"info")),"model_extra");
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
output += "\n      <div class=\"sm:col-span-1\">\n        <dt class=\"text-sm font-medium text-gray-500\">";
output += runtime.suppressValue(t_11, env.opts.autoescape);
output += "</dt>\n        <dd class=\"mt-1 text-sm text-gray-900\">";
output += runtime.suppressValue(t_12, env.opts.autoescape);
output += "</dd>\n      </div>\n      ";
;
}
} else {
t_8 = -1;
var t_9 = runtime.keys(t_10).length;
for(var t_13 in t_10) {
t_8++;
var t_14 = t_10[t_13];
frame.set("key", t_13);
frame.set("value", t_14);
frame.set("loop.index", t_8 + 1);
frame.set("loop.index0", t_8);
frame.set("loop.revindex", t_9 - t_8);
frame.set("loop.revindex0", t_9 - t_8 - 1);
frame.set("loop.first", t_8 === 0);
frame.set("loop.last", t_8 === t_9 - 1);
frame.set("loop.length", t_9);
output += "\n      <div class=\"sm:col-span-1\">\n        <dt class=\"text-sm font-medium text-gray-500\">";
output += runtime.suppressValue(t_13, env.opts.autoescape);
output += "</dt>\n        <dd class=\"mt-1 text-sm text-gray-900\">";
output += runtime.suppressValue(t_14, env.opts.autoescape);
output += "</dd>\n      </div>\n      ";
;
}
}
}
frame = frame.pop();
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
output += "\n\n      ";
frame = frame.push();
var t_3 = runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "datacontract")),"terms")),"model_extra");
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
output += "\n      <div class=\"sm:col-span-1\">\n        <dt class=\"text-sm font-medium text-gray-500\">";
output += runtime.suppressValue(t_4, env.opts.autoescape);
output += "</dt>\n        <dd class=\"mt-1 text-sm text-gray-900\">";
output += runtime.suppressValue(t_5, env.opts.autoescape);
output += "</dd>\n      </div>\n      ";
;
}
} else {
t_1 = -1;
var t_2 = runtime.keys(t_3).length;
for(var t_6 in t_3) {
t_1++;
var t_7 = t_3[t_6];
frame.set("key", t_6);
frame.set("value", t_7);
frame.set("loop.index", t_1 + 1);
frame.set("loop.index0", t_1);
frame.set("loop.revindex", t_2 - t_1);
frame.set("loop.revindex0", t_2 - t_1 - 1);
frame.set("loop.first", t_1 === 0);
frame.set("loop.last", t_1 === t_2 - 1);
frame.set("loop.length", t_2);
output += "\n      <div class=\"sm:col-span-1\">\n        <dt class=\"text-sm font-medium text-gray-500\">";
output += runtime.suppressValue(t_6, env.opts.autoescape);
output += "</dt>\n        <dd class=\"mt-1 text-sm text-gray-900\">";
output += runtime.suppressValue(t_7, env.opts.autoescape);
output += "</dd>\n      </div>\n      ";
;
}
}
}
frame = frame.pop();
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
output += "</div>\n            </th>\n          </tr>\n          </thead>\n          <tbody class=\"divide-y divide-gray-200 bg-white\">\n            <tr id=\"/definitions/";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "definition_name"), env.opts.autoescape);
output += "\">\n              <td class=\"whitespace-nowrap py-2 pl-4 pr-2 text-sm font-medium text-gray-900 sm:pl-6 w-2/12\">\n                <div class=\"py-2 text-sm\">\n                  ";
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
output += "\n                  ";
frame = frame.push();
var t_11 = runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "definition")),"model_extra");
if(t_11) {t_11 = runtime.fromIterator(t_11);
var t_9;
if(runtime.isArray(t_11)) {
var t_10 = t_11.length;
for(t_9=0; t_9 < t_11.length; t_9++) {
var t_12 = t_11[t_9][0];
frame.set("[object Object]", t_11[t_9][0]);
var t_13 = t_11[t_9][1];
frame.set("[object Object]", t_11[t_9][1]);
frame.set("loop.index", t_9 + 1);
frame.set("loop.index0", t_9);
frame.set("loop.revindex", t_10 - t_9);
frame.set("loop.revindex0", t_10 - t_9 - 1);
frame.set("loop.first", t_9 === 0);
frame.set("loop.last", t_9 === t_10 - 1);
frame.set("loop.length", t_10);
output += "\n                  <span class=\"inline-flex items-center rounded-md bg-gray-50 px-1 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 mr-1 mt-1\">";
output += runtime.suppressValue(t_12, env.opts.autoescape);
output += ":";
output += runtime.suppressValue(t_13, env.opts.autoescape);
output += "</span>\n                  ";
;
}
} else {
t_9 = -1;
var t_10 = runtime.keys(t_11).length;
for(var t_14 in t_11) {
t_9++;
var t_15 = t_11[t_14];
frame.set("key", t_14);
frame.set("value", t_15);
frame.set("loop.index", t_9 + 1);
frame.set("loop.index0", t_9);
frame.set("loop.revindex", t_10 - t_9);
frame.set("loop.revindex0", t_10 - t_9 - 1);
frame.set("loop.first", t_9 === 0);
frame.set("loop.last", t_9 === t_10 - 1);
frame.set("loop.length", t_10);
output += "\n                  <span class=\"inline-flex items-center rounded-md bg-gray-50 px-1 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 mr-1 mt-1\">";
output += runtime.suppressValue(t_14, env.opts.autoescape);
output += ":";
output += runtime.suppressValue(t_15, env.opts.autoescape);
output += "</span>\n                  ";
;
}
}
}
frame = frame.pop();
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
output += "\n      <span>";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "field")),"title"), env.opts.autoescape);
output += "</span><br>\n      ";
;
}
output += "\n      <span class=\"font-mono flex\">";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "field_name"), env.opts.autoescape);
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "field")),"$ref")) {
output += " <a href=\"";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "field")),"$ref"), env.opts.autoescape);
output += "\">\n        <svg title=\"Definition\" class=\"mr-1.5 h-5 w-5 flex-shrink-0\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-0.75 -0.75 24 24\"><defs></defs><path d=\"M3.046875 5.15625h16.40625s0.9375 0 0.9375 0.9375v10.3125s0 0.9375 -0.9375 0.9375H3.046875s-0.9375 0 -0.9375 -0.9375v-10.3125s0 -0.9375 0.9375 -0.9375\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\"></path><path d=\"m12.568125 10.3125 4.6875 0\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\"></path><path d=\"m12.568125 13.125 4.6875 0\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\"></path><path d=\"M5.068124999999999 8.4375h4.6875v4.6875h-4.6875Z\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\"></path></svg>\n      </a>";
;
}
output += "</span>\n    </div>\n  </td>\n  <td class=\"whitespace-nowrap px-1 py-2 text-sm text-gray-500 w-1/12\">\n    ";
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
output += "\n      ";
frame = frame.push();
var t_7 = runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "field")),"model_extra");
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
output += "\n      <span class=\"inline-flex items-center rounded-md bg-gray-50 px-1 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 mr-1 mt-1\">";
output += runtime.suppressValue(t_8, env.opts.autoescape);
output += ":";
output += runtime.suppressValue(t_9, env.opts.autoescape);
output += "</span>\n      ";
;
}
} else {
t_5 = -1;
var t_6 = runtime.keys(t_7).length;
for(var t_10 in t_7) {
t_5++;
var t_11 = t_7[t_10];
frame.set("key", t_10);
frame.set("value", t_11);
frame.set("loop.index", t_5 + 1);
frame.set("loop.index0", t_5);
frame.set("loop.revindex", t_6 - t_5);
frame.set("loop.revindex0", t_6 - t_5 - 1);
frame.set("loop.first", t_5 === 0);
frame.set("loop.last", t_5 === t_6 - 1);
frame.set("loop.length", t_6);
output += "\n      <span class=\"inline-flex items-center rounded-md bg-gray-50 px-1 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 mr-1 mt-1\">";
output += runtime.suppressValue(t_10, env.opts.autoescape);
output += ":";
output += runtime.suppressValue(t_11, env.opts.autoescape);
output += "</span>\n      ";
;
}
}
}
frame = frame.pop();
output += "\n    </div>\n  </td>\n</tr>\n\n";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "field")),"fields")) {
output += "\n";
frame = frame.push();
var t_14 = runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "field")),"fields");
if(t_14) {t_14 = runtime.fromIterator(t_14);
var t_12;
if(runtime.isArray(t_14)) {
var t_13 = t_14.length;
for(t_12=0; t_12 < t_14.length; t_12++) {
var t_15 = t_14[t_12][0];
frame.set("[object Object]", t_14[t_12][0]);
var t_16 = t_14[t_12][1];
frame.set("[object Object]", t_14[t_12][1]);
frame.set("loop.index", t_12 + 1);
frame.set("loop.index0", t_12);
frame.set("loop.revindex", t_13 - t_12);
frame.set("loop.revindex0", t_13 - t_12 - 1);
frame.set("loop.first", t_12 === 0);
frame.set("loop.last", t_12 === t_13 - 1);
frame.set("loop.length", t_13);
output += "\n  ";
output += runtime.suppressValue((lineno = 96, colno = 19, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "render_partial"), "render_partial", context, ["partials/model_field.html",runtime.makeKeywordArgs({"nested": true,"field_name": t_15,"field": t_16,"level": runtime.contextOrFrameLookup(context, frame, "level") + 1})])), env.opts.autoescape);
output += "\n";
;
}
} else {
t_12 = -1;
var t_13 = runtime.keys(t_14).length;
for(var t_17 in t_14) {
t_12++;
var t_18 = t_14[t_17];
frame.set("field_name", t_17);
frame.set("field", t_18);
frame.set("loop.index", t_12 + 1);
frame.set("loop.index0", t_12);
frame.set("loop.revindex", t_13 - t_12);
frame.set("loop.revindex0", t_13 - t_12 - 1);
frame.set("loop.first", t_12 === 0);
frame.set("loop.last", t_12 === t_13 - 1);
frame.set("loop.length", t_13);
output += "\n  ";
output += runtime.suppressValue((lineno = 96, colno = 19, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "render_partial"), "render_partial", context, ["partials/model_field.html",runtime.makeKeywordArgs({"nested": true,"field_name": t_17,"field": t_18,"level": runtime.contextOrFrameLookup(context, frame, "level") + 1})])), env.opts.autoescape);
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
output += "<li class=\"relative flex gap-x-6 px-4 py-5 sm:px-6\">\n  <div class=\"flex items-center gap-x-4\">\n    <div class=\"sm:flex sm:flex-col\">\n      <div class=\"flex flex-col\">\n        <dt class=\"text-sm font-medium text-gray-500\">Server</dt>\n        <dd class=\"mt-1 text-sm text-gray-900\">";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "server_name"), env.opts.autoescape);
output += "</dd>\n      </div>\n    </div>\n  </div>\n\n  ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "server")),"environment")) {
output += "\n  <div class=\"flex items-center gap-x-4\">\n    <div class=\"sm:flex sm:flex-col\">\n      <div class=\"flex flex-col\">\n        <dt class=\"text-sm font-medium text-gray-500\">Environment</dt>\n        <dd class=\"mt-1 text-sm text-gray-900\">";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "server")),"environment"), env.opts.autoescape);
output += "</dd>\n      </div>\n    </div>\n  </div>\n  ";
;
}
output += "\n\n  ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "server")),"type")) {
output += "\n  <div class=\"flex items-center gap-x-4\">\n    <div class=\"sm:flex sm:flex-col\">\n      <div class=\"flex flex-col\">\n        <dt class=\"text-sm font-medium text-gray-500\">Type</dt>\n        <dd class=\"mt-1 text-sm text-gray-900\">";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "server")),"type"), env.opts.autoescape);
output += "</dd>\n      </div>\n    </div>\n  </div>\n  ";
;
}
output += "\n\n  ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "server")),"project")) {
output += "\n  <div class=\"flex items-center gap-x-4\">\n    <div class=\"sm:flex sm:flex-col\">\n      <div class=\"flex flex-col\">\n        <dt class=\"text-sm font-medium text-gray-500\">Project</dt>\n        <dd class=\"mt-1 text-sm text-gray-900\">";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "server")),"project"), env.opts.autoescape);
output += "</dd>\n      </div>\n    </div>\n  </div>\n  ";
;
}
output += "\n\n  ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "server")),"dataset")) {
output += "\n  <div class=\"flex items-center gap-x-4\">\n    <div class=\"sm:flex sm:flex-col\">\n      <div class=\"flex flex-col\">\n        <dt class=\"text-sm font-medium text-gray-500\">Dataset</dt>\n        <dd class=\"mt-1 text-sm text-gray-900\">";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "server")),"dataset"), env.opts.autoescape);
output += "</dd>\n      </div>\n    </div>\n  </div>\n  ";
;
}
output += "\n\n  ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "server")),"location")) {
output += "\n  <div class=\"flex items-center gap-x-4\">\n    <div class=\"sm:flex sm:flex-col\">\n      <div class=\"flex flex-col\">\n        <dt class=\"text-sm font-medium text-gray-500\">Location</dt>\n        <dd class=\"mt-1 text-sm text-gray-900\">";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "server")),"location"), env.opts.autoescape);
output += "</dd>\n      </div>\n    </div>\n  </div>\n  ";
;
}
output += "\n\n  ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "server")),"endpointUrl")) {
output += "\n  <div class=\"flex items-center gap-x-4\">\n    <div class=\"sm:flex sm:flex-col\">\n      <div class=\"flex flex-col\">\n        <dt class=\"text-sm font-medium text-gray-500\">Endpoint URL</dt>\n        <dd class=\"mt-1 text-sm text-gray-900\">";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "server")),"endpointUrl"), env.opts.autoescape);
output += "</dd>\n      </div>\n    </div>\n  </div>\n  ";
;
}
output += "\n\n  ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "server")),"account")) {
output += "\n  <div class=\"flex items-center gap-x-4\">\n    <div class=\"sm:flex sm:flex-col\">\n      <div class=\"flex flex-col\">\n        <dt class=\"text-sm font-medium text-gray-500\">Account</dt>\n        <dd class=\"mt-1 text-sm text-gray-900\">";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "server")),"account"), env.opts.autoescape);
output += "</dd>\n      </div>\n    </div>\n  </div>\n  ";
;
}
output += "\n\n  ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "server")),"host")) {
output += "\n  <div class=\"flex items-center gap-x-4\">\n    <div class=\"sm:flex sm:flex-col\">\n      <div class=\"flex flex-col\">\n        <dt class=\"text-sm font-medium text-gray-500\">Host</dt>\n        <dd class=\"mt-1 text-sm text-gray-900\">";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "server")),"host"), env.opts.autoescape);
output += "</dd>\n      </div>\n    </div>\n  </div>\n  ";
;
}
output += "\n\n  ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "server")),"port")) {
output += "\n  <div class=\"flex items-center gap-x-4\">\n    <div class=\"sm:flex sm:flex-col\">\n      <div class=\"flex flex-col\">\n        <dt class=\"text-sm font-medium text-gray-500\">Port</dt>\n        <dd class=\"mt-1 text-sm text-gray-900\">";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "server")),"port"), env.opts.autoescape);
output += "</dd>\n      </div>\n    </div>\n  </div>\n  ";
;
}
output += "\n\n  ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "server")),"catalog")) {
output += "\n  <div class=\"flex items-center gap-x-4\">\n    <div class=\"sm:flex sm:flex-col\">\n      <div class=\"flex flex-col\">\n        <dt class=\"text-sm font-medium text-gray-500\">Catalog</dt>\n        <dd class=\"mt-1 text-sm text-gray-900\">";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "server")),"catalog"), env.opts.autoescape);
output += "</dd>\n      </div>\n    </div>\n  </div>\n  ";
;
}
output += "\n\n  ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "server")),"database")) {
output += "\n  <div class=\"flex items-center gap-x-4\">\n    <div class=\"sm:flex sm:flex-col\">\n      <div class=\"flex flex-col\">\n        <dt class=\"text-sm font-medium text-gray-500\">Database</dt>\n        <dd class=\"mt-1 text-sm text-gray-900\">";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "server")),"database"), env.opts.autoescape);
output += "</dd>\n      </div>\n    </div>\n  </div>\n  ";
;
}
output += "\n\n  ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "server")),"schema_")) {
output += "\n  <div class=\"flex items-center gap-x-4\">\n    <div class=\"sm:flex sm:flex-col\">\n      <div class=\"flex flex-col\">\n        <dt class=\"text-sm font-medium text-gray-500\">Schema</dt>\n        <dd class=\"mt-1 text-sm text-gray-900\">";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "server")),"schema_"), env.opts.autoescape);
output += "</dd>\n      </div>\n    </div>\n  </div>\n  ";
;
}
output += "\n\n  ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "server")),"topic")) {
output += "\n  <div class=\"flex items-center gap-x-4\">\n    <div class=\"sm:flex sm:flex-col\">\n      <div class=\"flex flex-col\">\n        <dt class=\"text-sm font-medium text-gray-500\">Topic</dt>\n        <dd class=\"mt-1 text-sm text-gray-900\">";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "server")),"topic"), env.opts.autoescape);
output += "</dd>\n      </div>\n    </div>\n  </div>\n  ";
;
}
output += "\n\n  ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "server")),"path")) {
output += "\n  <div class=\"flex items-center gap-x-4\">\n    <div class=\"sm:flex sm:flex-col\">\n      <div class=\"flex flex-col\">\n        <dt class=\"text-sm font-medium text-gray-500\">Path</dt>\n        <dd class=\"mt-1 text-sm text-gray-900\">";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "server")),"path"), env.opts.autoescape);
output += "</dd>\n      </div>\n    </div>\n  </div>\n  ";
;
}
output += "\n\n  ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "server")),"format")) {
output += "\n  <div class=\"flex items-center gap-x-4\">\n    <div class=\"sm:flex sm:flex-col\">\n      <div class=\"flex flex-col\">\n        <dt class=\"text-sm font-medium text-gray-500\">Format</dt>\n        <dd class=\"mt-1 text-sm text-gray-900\">";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "server")),"format"), env.opts.autoescape);
output += "</dd>\n      </div>\n    </div>\n  </div>\n  ";
;
}
output += "\n\n  ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "server")),"delimiter")) {
output += "\n  <div class=\"flex items-center gap-x-4\">\n    <div class=\"sm:flex sm:flex-col\">\n      <div class=\"flex flex-col\">\n        <dt class=\"text-sm font-medium text-gray-500\">Delimiter</dt>\n        <dd class=\"mt-1 text-sm text-gray-900\">";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "server")),"delimiter"), env.opts.autoescape);
output += "</dd>\n      </div>\n    </div>\n  </div>\n  ";
;
}
output += "\n\n  ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "server")),"description")) {
output += "\n  <div class=\"flex items-center gap-x-4\">\n    <div class=\"sm:flex sm:flex-col\">\n      <div class=\"flex flex-col\">\n        <dt class=\"text-sm font-medium text-gray-500\">Description</dt>\n        <dd class=\"mt-1 text-sm text-gray-900\">";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "server")),"description"), env.opts.autoescape);
output += "</dd>\n      </div>\n    </div>\n  </div>\n  ";
;
}
output += "\n\n  ";
frame = frame.push();
var t_3 = runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "server")),"model_extra");
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
output += "\n  <div class=\"flex items-center gap-x-4\">\n    <div class=\"sm:flex sm:flex-col\">\n      <div class=\"flex flex-col\">\n        <dt class=\"text-sm font-medium text-gray-500\">";
output += runtime.suppressValue(t_4, env.opts.autoescape);
output += "</dt>\n        <dd class=\"mt-1 text-sm text-gray-900\">";
output += runtime.suppressValue(t_5, env.opts.autoescape);
output += "</dd>\n      </div>\n    </div>\n  </div>\n  ";
;
}
} else {
t_1 = -1;
var t_2 = runtime.keys(t_3).length;
for(var t_6 in t_3) {
t_1++;
var t_7 = t_3[t_6];
frame.set("key", t_6);
frame.set("value", t_7);
frame.set("loop.index", t_1 + 1);
frame.set("loop.index0", t_1);
frame.set("loop.revindex", t_2 - t_1);
frame.set("loop.revindex0", t_2 - t_1 - 1);
frame.set("loop.first", t_1 === 0);
frame.set("loop.last", t_1 === t_2 - 1);
frame.set("loop.length", t_2);
output += "\n  <div class=\"flex items-center gap-x-4\">\n    <div class=\"sm:flex sm:flex-col\">\n      <div class=\"flex flex-col\">\n        <dt class=\"text-sm font-medium text-gray-500\">";
output += runtime.suppressValue(t_6, env.opts.autoescape);
output += "</dt>\n        <dd class=\"mt-1 text-sm text-gray-900\">";
output += runtime.suppressValue(t_7, env.opts.autoescape);
output += "</dd>\n      </div>\n    </div>\n  </div>\n  ";
;
}
}
}
frame = frame.pop();
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

