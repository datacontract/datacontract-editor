import * as monaco from 'monaco-editor'
import {MarkerSeverity} from 'monaco-editor'
import {configureMonacoYaml} from 'monaco-yaml'
import nunjucks from "nunjucks";
import yaml from 'js-yaml';


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
    }
});



let preview = document.getElementById("preview");

const env = nunjucks.configure('templates', {autoescape: false});
env.addGlobal('render_partial', function (partialName, context) {
    return nunjucks.render(partialName, context);
});

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

document.getElementById("menu-item-share").addEventListener("click", function () {
    document.getElementById("menu-file").click();

    const url = "localhost:9000/?dc=" + window.btoa(editor.getValue());
    navigator.clipboard.writeText(url);

    alert("Copied share URL to clipboard")
});

document.getElementById("menu-item-load-minimal").addEventListener("click", function () {
    editor.setValue(`dataContractSpecification: 0.9.3
id: my-data-contract-id
info:
  title: My Data Contract
  version: 0.0.1
`);
    document.getElementById("menu-file").click();
});

document.getElementById("menu-item-load-example").addEventListener("click", function () {
    editor.setValue(`dataContractSpecification: 0.9.3
id: urn:datacontract:checkout:orders-latest
info:
  title: Orders Latest
  version: 1.0.0
  description: |
    Successful customer orders in the webshop. 
    All orders since 2020-01-01. 
    Orders with their line items are in their current state (no history included).
  owner: Checkout Team
  contact:
    name: John Doe (Data Product Owner)
    url: https://teams.microsoft.com/l/channel/example/checkout
servers:
  production:
    type: s3
    location: s3://datacontract-example-orders-latest/data/{model}/*.json
    format: json
    delimiter: new_line
terms:
  usage: |
    Data can be used for reports, analytics and machine learning use cases.
    Order may be linked and joined by other tables
  limitations: |
    Not suitable for real-time use cases.
    Data may not be used to identify individual customers.
    Max data processing per day: 10 TiB
  billing: 5000 USD per month
  noticePeriod: P3M
models:
  orders:
    description: One record per order. Includes cancelled and deleted orders.
    type: table
    fields:
      order_id:
        $ref: '#/definitions/order_id'
        required: true
        unique: true
        primary: true
      order_timestamp:
        description: The business timestamp in UTC when the order was successfully registered in the source system and the payment was successful.
        type: timestamp
        required: true
        example: "2024-09-09T08:30:00Z"
      order_total:
        description: Total amount the smallest monetary unit (e.g., cents).
        type: long
        required: true
        example: "9999"
      customer_id:
        description: Unique identifier for the customer.
        type: text
        minLength: 10
        maxLength: 20
      customer_email_address:
        description: The email address, as entered by the customer. The email address was not verified.
        type: text
        format: email
        required: true
        pii: true
        classification: sensitive
      processed_timestamp:
        description: The timestamp when the record was processed by the data platform.
        type: timestamp
        required: true
        config:
          jsonType: string
          jsonFormat: date-time
  line_items:
    description: A single article that is part of an order.
    type: table
    fields:
      lines_item_id:
        type: text
        description: Primary key of the lines_item_id table
        required: true
        unique: true
        primary: true
      order_id:
        $ref: '#/definitions/order_id'
        references: orders.order_id
      sku:
        description: The purchased article number
        $ref: '#/definitions/sku'
definitions:
  order_id:
    domain: checkout
    name: order_id
    title: Order ID
    type: text
    format: uuid
    description: An internal ID that identifies an order in the online shop.
    example: 243c25e5-a081-43a9-aeab-6d5d5b6cb5e2
    pii: true
    classification: restricted
  sku:
    domain: inventory
    name: sku
    title: Stock Keeping Unit
    type: text
    pattern: ^[A-Za-z0-9]{8,14}$
    example: "96385074"
    description: |
      A Stock Keeping Unit (SKU) is an internal unique identifier for an article. 
      It is typically associated with an article's barcode, such as the EAN/GTIN.
examples:
  - type: csv # csv, json, yaml, custom
    model: orders
    description: An example list of order records.
    data: | # expressed as string or inline yaml or via "$ref: data.csv"
      order_id,order_timestamp,order_total,customer_id,customer_email_address,processed_timestamp
      "1001","2030-09-09T08:30:00Z",2500,"1000000001","mary.taylor82@example.com","2030-09-09T08:31:00Z"
      "1002","2030-09-08T15:45:00Z",1800,"1000000002","michael.miller83@example.com","2030-09-09T08:31:00Z"
      "1003","2030-09-07T12:15:00Z",3200,"1000000003","michael.smith5@example.com","2030-09-09T08:31:00Z"
      "1004","2030-09-06T19:20:00Z",1500,"1000000004","elizabeth.moore80@example.com","2030-09-09T08:31:00Z"
      "1005","2030-09-05T10:10:00Z",4200,"1000000004","elizabeth.moore80@example.com","2030-09-09T08:31:00Z"
      "1006","2030-09-04T14:55:00Z",2800,"1000000005","john.davis28@example.com","2030-09-09T08:31:00Z"
      "1007","2030-09-03T21:05:00Z",1900,"1000000006","linda.brown67@example.com","2030-09-09T08:31:00Z"
      "1008","2030-09-02T17:40:00Z",3600,"1000000007","patricia.smith40@example.com","2030-09-09T08:31:00Z"
      "1009","2030-09-01T09:25:00Z",3100,"1000000008","linda.wilson43@example.com","2030-09-09T08:31:00Z"
      "1010","2030-08-31T22:50:00Z",2700,"1000000009","mary.smith98@example.com","2030-09-09T08:31:00Z"
  - type: csv
    model: line_items
    description: An example list of line items.
    data: |
      lines_item_id,order_id,sku
      "LI-1","1001","5901234123457"
      "LI-2","1001","4001234567890"
      "LI-3","1002","5901234123457"
      "LI-4","1002","2001234567893"
      "LI-5","1003","4001234567890"
      "LI-6","1003","5001234567892"
      "LI-7","1004","5901234123457"
      "LI-8","1005","2001234567893"
      "LI-9","1005","5001234567892"
      "LI-10","1005","6001234567891"
servicelevels:
  availability:
    description: The server is available during support hours
    percentage: 99.9%
  retention:
    description: Data is retained for one year
    period: P1Y
    unlimited: false
  latency:
    description: Data is available within 25 hours after the order was placed
    threshold: 25h
    sourceTimestampField: orders.order_timestamp
    processedTimestampField: orders.processed_timestamp
  freshness:
    description: The age of the youngest row in a table.
    threshold: 25h
    timestampField: orders.order_timestamp
  frequency:
    description: Data is delivered once a day
    type: batch # or streaming
    interval: daily # for batch, either or cron
    cron: 0 0 * * * # for batch, either or interval
  support:
    description: The data is available during typical business hours at headquarters
    time: 9am to 5pm in EST on business days
    responseTime: 1h
  backup:
    description: Data is backed up once a week, every Sunday at 0:00 UTC.
    interval: weekly
    cron: 0 0 * * 0
    recoveryTime: 24 hours
    recoveryPoint: 1 week
quality:
  type: SodaCL   # data quality check format: SodaCL, montecarlo, custom
  specification: # expressed as string or inline yaml or via "$ref: checks.yaml"
    checks for orders:
      - row_count >= 5
      - duplicate_count(order_id) = 0
    checks for line_items:
      - values in (order_id) must exist in orders (order_id)
      - row_count >= 5
    `);

    document.getElementById("menu-file").click();

});

import Worker from './parser.worker.js';
const worker = new Worker();
worker.onmessage = function (message) {
    if (message.data.status === "error") {
        const htmlPreview = `<div>ERROR: ${message.data.error}</div>`
        preview.innerHTML = htmlPreview;
    }
    if (message.data.status === "success") {
        const htmlPreview = nunjucks.render('datacontract.html', {datacontract: message.data.json});
        preview.innerHTML = htmlPreview;
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
