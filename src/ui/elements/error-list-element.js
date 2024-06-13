import { LitElement, html } from "lit";
import * as monaco from "monaco-editor";

export class ErrorListElement extends LitElement {

	static properties = {
		errors: { type: Array, attribute: false }
	}

	constructor() {
		super();
		this.errors = [];
	}

	get editor() {
		return monaco.editor.getEditors()[0];
	}

  render() {
    return html`${this.errors.length ? this.renderErrors(): ''}`;
  }

  // render in the Light DOM
  createRenderRoot() {
    return this;
  }

	renderErrors() {
		return html`
		<div class="rounded-md bg-red-50 p-4">
			<div class="flex">
				<div class="flex-shrink-0">
					<svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
						<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" />
					</svg>
				</div>
				<div class="ml-3">
					<h3 class="text-sm font-medium text-red-800">YAML <a href="https://datacontract.com/datacontract.schema.json">schema</a> validation failed</h3>
					<div class="mt-2 text-sm text-red-700">
						<ul role="list" class="list-disc space-y-1 pl-5" id="problem-list">
								${this.errors.map((error) => html`
									<li class="cursor-pointer"
										@click=${this.handleClick}
										data-level="${error.level}"
										data-lineNumber="${error.lineNumber}"
										data-column="${error.column}">Line ${error.lineNumber}: ${error.text}
									</li>
									`)}
						</ul>
					</div>
				</div>
			</div>
		</div>
	`;
	}

	handleClick(e) {
		this.editor.setPosition({
			lineNumber: parseInt(e.target.dataset.linenumber),
			column: parseInt(e.target.dataset.column),
		});
		this.editor.focus();
	}

}
customElements.define("dce-error-list", ErrorListElement);
