import * as monaco from 'monaco-editor'
import {MarkerSeverity} from 'monaco-editor'
import {configureMonacoYaml} from 'monaco-yaml'
import Split from 'split.js'
import ParserWorker from './parser.worker.js';
import renderDataContract from "./render.js";
import {getExample, getMinimal} from "./examples.js";

// init alpine
import Alpine from 'alpinejs'
window.Alpine = Alpine
Alpine.start()

window.MonacoEnvironment = {
    getWorker(moduleId, label) {
        switch (label) {
            case 'editorWorkerService':
                return new Worker(new URL('monaco-editor/esm/vs/editor/editor.worker', import.meta.url))
            case 'yaml':
                return new Worker(new URL('monaco-yaml/yaml.worker', import.meta.url))
            default:
                throw new Error(`Unknown label ${label}`)
        }
    }
}

configureMonacoYaml(monaco, {
    enableSchemaRequest: true,
    schemas: [
        {
            // If YAML file is opened matching this glob
            fileMatch: ['**/datacontract.yaml'],
            // And the following URI will be linked to as the source.
            uri: 'https://datacontract.com/datacontract.schema.json'
        },
        {
            // If YAML file is opened matching this glob
            fileMatch: ['**/definition.yaml'],
            // And the following URI will be linked to as the source.
            uri: 'https://datacontract.com/definition.schema.json'
        },
        {
            // If YAML file is opened matching this glob
            fileMatch: ['**/dataproduct.yaml'],
            // And the following URI will be linked to as the source.
            uri: 'https://dataproduct-specification.com/dataproduct.schema.json'
        }
    ]
})

let containerMonacoEditor = "editor";


function storeDataContractYaml(yaml) {
    localStorage.setItem("dataContractYaml", yaml);
    localStorage.setItem("dataContractYamlUpdated", new Date().toISOString());
}
function loadDataContractYaml() {
    return localStorage.getItem("dataContractYaml");
}
function isFirstLoadOfDataContractEditor() {
    return localStorage.getItem("dataContractYamlUpdated") === null;
}

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

if (urlParams.has("dc")) {
    const value = window.atob(urlParams.get("dc"));
    storeDataContractYaml(value);
    window.location.search = "";
}

if (isFirstLoadOfDataContractEditor()) {
    storeDataContractYaml(getExample());
}

const valueFromLocalStorage = loadDataContractYaml();
const value = valueFromLocalStorage;
let uri = "file:///datacontract.yaml";

const model = monaco.editor.createModel(value, undefined, monaco.Uri.parse(uri));

const editor = monaco.editor.create(document.getElementById(containerMonacoEditor), {
    model: model,
    language: "yaml",
    automaticLayout: true,
    minimap: {
        enabled: false
    },
    fixedOverflowWidgets: true,
    scrollBeyondLastLine: false
});



let preview = document.getElementById("preview");

document.getElementById("menu-item-clear").addEventListener("click", function () {
    editor.setValue("");

    document.getElementById("menu-file").click();
});

document.getElementById("menu-item-open-file").addEventListener("click", function () {

    document.getElementById("menu-file").click();

    // Returns a Promise of a single File object
    async function askUserToSelectFile() {
        const [fileHandle] = await window.showOpenFilePicker();
        return await fileHandle.getFile();
    }

    askUserToSelectFile()
        .then(file => file.text())
        .then(text => editor.setValue(text))
        .catch(console.error);
});

document.getElementById("menu-item-save").addEventListener("click", function () {
    document.getElementById("menu-file").click();

    const fileContent = editor.getValue()
    const bb = new Blob([fileContent ], { type: 'text/plain' });
    const a = document.createElement('a');
    a.download = 'datacontract.yaml';
    a.href = window.URL.createObjectURL(bb);
    a.click();
    a.remove();
});

Split(['#split-0', '#split-1'])

document.getElementById("menu-item-share").addEventListener("click", function () {
    document.getElementById("menu-file").click();

    const url = "localhost:9000/?dc=" + window.btoa(editor.getValue());
    navigator.clipboard.writeText(url);

    alert("Copied share URL to clipboard")
});

document.getElementById("menu-item-load-minimal").addEventListener("click", function () {
    editor.setValue(getMinimal());
    document.getElementById("menu-file").click();
});

document.getElementById("menu-item-load-example").addEventListener("click", function () {
    editor.setValue(getExample());
    document.getElementById("menu-file").click();
});

const worker = new ParserWorker();
worker.onmessage = function (message) {
    if (message.data.status === "error") {
        console.log(message.data.error);
        document.getElementById("parsing").innerHTML = `
        <div class="rounded-md bg-red-50 p-4">
  <div class="flex">
    <div class="flex-shrink-0">
      <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" />
      </svg>
    </div>
    <div class="ml-3">
      <h3 class="text-sm font-medium text-red-800">YAML parsing failed</h3>
      <div class="mt-2 text-sm text-red-700">
        <ul role="list" class="list-disc space-y-1 pl-5">
          <li>${message.data.error.message}</li>
        </ul>
      </div>
    </div>
  </div>
</div>
        `;
        preview.innerHTML = "";
    }
    if (message.data.status === "success") {
        document.getElementById("parsing").innerHTML = "";
        preview.innerHTML = renderDataContract(message.data.json);
    }
};
function renderHtmlPreview(yamlContent) {
    worker.postMessage({
        command: "parse",
        dataContractYaml: yamlContent,
    });
}

function contentChanged() {
    let yaml = editor.getValue();
    storeDataContractYaml(yaml);
    renderHtmlPreview(yaml);
}

editor.onDidChangeModelContent(function (e) {
    contentChanged();
});

const resizeObserver = new ResizeObserver(entries => {
    editor.layout();
});
resizeObserver.observe(document.getElementById(containerMonacoEditor));

function showProblems(resource) {
    const problems = document.getElementById('problems');

    const markers = monaco.editor.getModelMarkers({resource});
    var validationErrors = [];
    for (const marker of markers) {
        if (marker.severity === MarkerSeverity.Hint) {
            continue;
        }
        validationErrors.push({
            text: marker.message,
            level: "ERROR",
            lineNumber: marker.startLineNumber,
            column: marker.startColumn
        });
    }

    let schemaUrl = "https://datacontract.com/datacontract.schema.json";
    renderProblems(schemaUrl, validationErrors);
}

function renderProblems(schemaUrl, validationErrors) {
    const problems = document.getElementById('problems');
    if (validationErrors.length === 0) {
        problems.innerHTML = ``;
    } else {
        var problemItems = "";
        for (const validationError of validationErrors) {
            problemItems += `<li 
class="cursor-pointer"
data-level="${validationError.level}"
data-lineNumber="${validationError.lineNumber}" 
data-column="${validationError.column}">Line ${validationError.lineNumber}: ${validationError.text}</li>`
        }

        problems.innerHTML = `
<div class="rounded-md bg-red-50 p-4">
  <div class="flex">
    <div class="flex-shrink-0">
      <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" />
      </svg>
    </div>
    <div class="ml-3">
      <h3 class="text-sm font-medium text-red-800">YAML <a href="${schemaUrl}">schema</a> validation failed</h3>
      <div class="mt-2 text-sm text-red-700">
        <ul role="list" class="list-disc space-y-1 pl-5" id="problem-list">
            ${problemItems}
        </ul>
      </div>
    </div>
  </div>
</div>
`;
        const problemListItems = problems.querySelectorAll('li');
        for (const problemListItem of problemListItems) {
            problemListItem.addEventListener('click', function (e) {
                editor.setPosition({
                    lineNumber: parseInt(e.target.dataset.linenumber),
                    column: parseInt(e.target.dataset.column)
                });
                editor.focus();
            });
        }

    }
}

monaco.editor.onDidChangeMarkers(function (resource) {
    showProblems(resource);
});
showProblems(model.uri);

contentChanged();
