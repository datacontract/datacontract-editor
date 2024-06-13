import { LitElement, html } from "lit";
import * as monaco from "monaco-editor";
import { MarkerSeverity } from "monaco-editor";

import { loadInitialDocument, storeDataContractYaml } from "../../storage/storage.js";

export class EditorElement extends LitElement {
	get editor() {
		return this.querySelector("#editor");
	}

	render() {
		return html`<div id="editor" class="h-full w-full overflow-hidden"></div>`;
	}

	// render in the Light DOM
	createRenderRoot() {
		return this;
	}

	// after the first render, setup the editor
	firstUpdated() {
		// load initial content
		const value = loadInitialDocument();

		// create a model and the editor
		const model = monaco.editor.createModel(
			value,
			undefined,
			monaco.Uri.parse("file:///datacontract.yaml")
		);
		const editor = monaco.editor.create(this.editor, {
			model: model,
			language: "yaml",
			automaticLayout: true,
			minimap: {
				enabled: false,
			},
			fixedOverflowWidgets: true,
			scrollBeyondLastLine: false,
		});

		// store changes to the content to local storage and emit the new content
		editor.onDidChangeModelContent(() => {
			const content = editor.getValue();
			storeDataContractYaml(content);
			this.dispatchEvent(new CustomEvent('editor-content-changed', { detail:  { content } }));
		});

		// set up to detect editor errors and emit them
		monaco.editor.onDidChangeMarkers((resource) => {
			const markers = monaco.editor.getModelMarkers({resource});
    	const validationErrors = markers
        .filter((marker) => marker.severity !== MarkerSeverity.Hint)
        .map((marker) => ({
            text: marker.message,
            level: "ERROR",
            lineNumber: marker.startLineNumber,
            column: marker.startColumn
        }))

			this.dispatchEvent(new CustomEvent('editor-errors', { detail:  { validationErrors } }));
    });


		// make sure the editor re-renders itself on window resizes
		const resizeObserver = new ResizeObserver(() => {
			editor.layout();
		});
		resizeObserver.observe(this.editor);

		// emit current content for a first render
		this.dispatchEvent(new CustomEvent('editor-content-changed', { detail:  { content: editor.getValue() } }));
	}
}
customElements.define("dce-editor", EditorElement);
