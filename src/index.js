import * as monaco from 'monaco-editor'
import {MarkerSeverity} from 'monaco-editor'
import {configureMonacoYaml} from 'monaco-yaml'
import Split from 'split.js'
import ParserWorker from './parser.worker.js';
import renderDataContract from "./render.js";
import {getExample, getMinimal} from "./examples.js";

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
}
function loadDataContractYaml() {
    return localStorage.getItem("dataContractYaml");
}

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
if (urlParams.has("dc")) {
    const value = window.atob(urlParams.get("dc"));
    storeDataContractYaml(value);
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
        const htmlPreview = `<div>ERROR: ${message.data.error}</div>`
        preview.innerHTML = htmlPreview;
    }
    if (message.data.status === "success") {
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
    while (problems.lastChild) {
        problems.lastChild.remove();
    }
    var errors = 0;
    for (const marker of markers) {
        if (marker.severity === MarkerSeverity.Hint) {
            continue;
        }
        const wrapper = document.createElement('div');
        wrapper.setAttribute('role', 'button');
        const codicon = document.createElement('span');
        const text = document.createElement('span');
        wrapper.classList.add('problem');
        if (MarkerSeverity.Warning) {
            codicon.textContent = 'Warning' + ': ';
            wrapper.classList.add('text-red-700');
        } else if (MarkerSeverity.Hint) {
            codicon.textContent = 'Hint' + ': ';
        } else if (MarkerSeverity.Info) {
            codicon.textContent = 'Info' + ': ';
        } else {
            codicon.textContent = 'Error' + ': ';
            wrapper.classList.add('text-red-700');
        }
        text.classList.add('problem-text');
        text.textContent = marker.message;
        wrapper.append(codicon, text);
        wrapper.addEventListener('click', function () {
            editor.setPosition({lineNumber: marker.startLineNumber, column: marker.startColumn});
            editor.focus();
        });
        errors++;
        problems.append(wrapper);
    }
    const wrapper = document.createElement('div');

    let schemaUrl = "https://datacontract.com/datacontract.schema.json";

    wrapper.innerHTML = `<div><a class="text--link text-semibold" href="${schemaUrl}">schema</a> validation: <span class="text-${errors === 0 ? 'green' : 'red'}-700">${errors} errors or warnings found</span></div>`;
    problems.prepend(wrapper)
}

monaco.editor.onDidChangeMarkers(function (resource) {
    showProblems(resource);
});
showProblems(model.uri);

contentChanged();
