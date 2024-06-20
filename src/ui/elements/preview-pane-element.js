import { LitElement, html } from "lit";
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { renderParsingError } from "../../templates/parsing-error.js";
import { renderDataContract } from "../../templates/render.js";

import parserWorker from '../..//workers/parser.worker.js?worker';

export class PreviewPaneElement extends LitElement {
	static properties = {
		document: { type: String, attribute: false },
		parsedContent: { type: String, state: true },
	};

	render() {
		return html`${unsafeHTML(this.parsedContent)}`;
	}

	// render in the Light DOM
	createRenderRoot() {
		return this;
	}

	connectedCallback() {
		super.connectedCallback();
		this.parserWorker = new parserWorker();
		this.parserWorker.onmessage = this.workerMessage.bind(this);
	}

	updated(changedProperties) {
		super.updated(changedProperties);
		if (changedProperties.has('document')) {
			this.parserWorker.postMessage({
				command: "parse",
				dataContractYaml: this.document,
			});
		}
	}

	workerMessage(message) {
		if (message.data.status === "error") {
			console.log(message.data.error);
			this.parsedContent = renderParsingError(message.data.error.message);
		}
		if (message.data.status === "success") {
			this.parsedContent = renderDataContract(message.data.json);
		}
	}
}
customElements.define("dce-preview-pane", PreviewPaneElement);
