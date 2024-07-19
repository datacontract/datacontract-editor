import { LitElement, html } from "lit";
import * as monaco from "monaco-editor";

import { getExample, getMinimal } from "../../templates/examples.js";
import {encodeYamlCode} from "../../sharing/encoding.js";

export class NavElement extends LitElement {

	static properties = {
		showNotification: { type: Boolean, attribute: false }
	}

	notificationTitle = '';
	notificationText = '';

  render() {
    return html` <nav class="bg-white shadow-sm">
      <div class="px-2 sm:px-4 lg:px-6">
        <div class="flex h-16 justify-between">
          <div class="flex">
            <div class="flex flex-shrink-0 items-center mr-6">
              <a
                class="text-xl text-gray-900 font-semibold"
                href="https://editor.datacontract.com"
              >
                Data Contract Editor
              </a>
            </div>
            <div class="sm:-my-px sm:ml-3 sm:flex sm:space-x-8 text-sm">
              <div class="relative inline-block text-left">
                <div
                  class="inline-flex h-full items-center border-b-4 px-1 pt-1 font-semibold border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                >
                  <button
                    type="button"
                    @click=${this.toggleFileMenu}
                    id="menu-file"
                    class="inline-flex"
                    aria-expanded="true"
                    aria-haspopup="true"
                  >
                    File
                    <svg
                      class="-mr-1 h-5 w-5 text-gray-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
                <div
                  class="hidden absolute left-0 z-10 mt-2 w-64 origin-top-left divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                  id="file_menu"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="menu-button"
                  tabindex="-1"
                >
                  <div class="py-1" role="none">
										<button
											@click=${this.handleOpenFile}
											class="text-gray-500 hover:text-gray-700 group flex items-center px-4 py-2 text-sm"
											role="menuitem"
											tabindex="-1"
											id="menu-item-open-file"
										>
											Open ...
										</button>
                    <button
                       @click=${this.handleLoadMinimal}
                      class="text-gray-500 hover:text-gray-700 group flex items-center px-4 py-2 text-sm"
                      role="menuitem"
                      tabindex="-1"
                      id="menu-item-load-minimal"
                    >
                      Load Minimal Example
                    </button>
                    <button
                       @click=${this.handleLoadExample}
                      class="text-gray-500 hover:text-gray-700 group flex items-center px-4 py-2 text-sm"
                      role="menuitem"
                      tabindex="-1"
                      id="menu-item-load-example"
                    >
                      Load Full Example
                    </button>
										<button
                       @click=${this.handleSave}
                      class="text-gray-500 hover:text-gray-700 group flex items-center px-4 py-2 text-sm"
                      role="menuitem"
                      tabindex="-1"
                      id="menu-item-save"
                    >
                      Save
                    </button>
                    <button
                       @click=${this.handleShare}
                      class="text-gray-500 hover:text-gray-700 group flex items-center px-4 py-2 text-sm"
                      role="menuitem"
                      tabindex="-1"
                      id="menu-item-share"
                    >
                      Share
                    </button>
                    <hr />
                    <button
                       @click=${this.handleClear}
                      class="text-gray-500 hover:text-gray-700 group flex items-center px-4 py-2 text-sm"
                      role="menuitem"
                      tabindex="-1"
                      id="menu-item-clear"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>

              <button
                class="inline-flex items-center border-b-4 px-1 pt-1 font-semibold border-transparent text-gray-300 hover:border-gray-300 hover:text-gray-500 cursor-not-allowed"
                disabled
              >
                Import
              </button>

              <button
                class="inline-flex items-center border-b-4 px-1 pt-1 font-semibold border-transparent text-gray-300 hover:border-gray-300 hover:text-gray-500 cursor-not-allowed"
                disabled
              >
                Export
              </button>

              <div class="relative inline-block text-left">
                <div
                  class="inline-flex h-full items-center border-b-4 px-1 pt-1 font-semibold border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                >
                  <button
                    type="button"
                    @click=${this.toggleAboutMenu}
                    id="menu-about"
                    class="inline-flex"
                    aria-expanded="true"
                    aria-haspopup="true"
                  >
                    About
                    <svg
                      class="-mr-1 h-5 w-5 text-gray-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
                <div
                  class="absolute hidden left-0 z-10 mt-2 w-64 origin-top-left divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                  id="about_menu"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="menu-button"
                  tabindex="-1"
                >
                  <div class="py-1" role="none">
                    <a
                      class="text-gray-500 hover:text-gray-700 group flex items-center px-4 py-2 text-sm"
                      href="https://github.com/datacontract/datacontract-editor"
                      role="menuitem"
                      tabindex="-1"
                      id="menu-item-0"
                    >
                      View on GitHub
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="size-5 ml-2 text-gray-500"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                        />
                      </svg>
                    </a>
                    <a
                      class="text-gray-500 hover:text-gray-700 group flex items-center px-4 py-2 text-sm"
                      href="https://datacontract.com/slack"
                      role="menuitem"
                      tabindex="-1"
                      id="menu-item-9"
                    >
                      Get support on Slack
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="size-5 ml-2 text-gray-500"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                        />
                      </svg>
                    </a>
                    <a
                      class="text-gray-500 hover:text-gray-700 group flex items-center px-4 py-2 text-sm"
                      href="https://datacontract.com/"
                      role="menuitem"
                      tabindex="-1"
                      id="menu-item-5"
                    >
                      Data Contract Specification
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="size-5 ml-2 text-gray-500"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                        />
                      </svg>
                    </a>
                    <a
                      class="text-gray-500 hover:text-gray-700 group flex items-center px-4 py-2 text-sm"
                      href="https://cli.datacontract.com/"
                      role="menuitem"
                      tabindex="-1"
                      id="menu-item-3"
                    >
                      Data Contract CLI
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="size-5 ml-2 text-gray-500"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                        />
                      </svg>
                    </a>
                    <a
                      class="text-gray-500 hover:text-gray-700 group flex items-center px-4 py-2 text-sm"
                      href="https://gpt.datacontract.com/"
                      role="menuitem"
                      tabindex="-1"
                      id="menu-item-4"
                    >
                      Data Contract GPT
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="size-5 ml-2 text-gray-500"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                        />
                      </svg>
                    </a>
                    <a
                      class="text-gray-500 hover:text-gray-700 group flex items-center px-4 py-2 text-sm"
                      href="https://www.innoq.com/en/impressum/"
                      role="menuitem"
                      tabindex="-1"
                      id="menu-item-1"
                    >
                      Legal Notice
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="size-5 ml-2 text-gray-500"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                        />
                      </svg>
                    </a>
                    <a
                      class="text-gray-500 hover:text-gray-700 group flex items-center px-4 py-2 text-sm"
                      href="https://www.innoq.com/en/datenschutz/"
                      role="menuitem"
                      tabindex="-1"
                      id="menu-item-2"
                    >
                      Privacy
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="size-5 ml-2 text-gray-500"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                        />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="sm:ml-6 sm:flex sm:items-center">
            <a
              href="https://datacontract.com"
              class="text--link text-sm font-semibold"
              target="_blank"
              >datacontract.com</a
            >
          </div>
        </div>
      </div>
    </nav>
		${this.showNotification ? this.renderNotification(): ''}
		`;
  }

  // render in the Light DOM
  createRenderRoot() {
    return this;
  }

  get editor() {
		return monaco.editor.getEditors()[0];
	}

	connectedCallback() {
		super.connectedCallback();
		// setup listener for menu autoclose
		this.clickListener = document.addEventListener('click', (event) => {
			// if the click was inside one of our two menus, do nothing
			if (event.target.closest('#file_menu') || event.target.closest('#menu-file')) {
				return;
			}
			if (event.target.closest('#about_menu') || event.target.closest('#menu-about')) {
				return;
			}
			// otherwise check if any of the menus are open and close them
			if (this.aboutMenuOpen()) {
				this.toggleAboutMenu();
			}
			if (this.fileMenuOpen()) {
				this.toggleFileMenu();
			}

		}, false);
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		// remove the listener, when we disconnect
		document.removeEventListener(this.clickListener);
	}

	renderNotification() {
		return html`<div id="notification" class="transition-opacity duration-300 opacity-0 shadow-lg w-full max-w-96 overflow-hidden rounded-lg bg-white border border-green-400" style="position: absolute; z-index: 1000; top: 2rem; right: 2rem;"><div class="p-4"><div class="flex items-start"><div class="shrink-0"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" aria-hidden="true" class="size-5 text-green-400"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></div><div class="ml-3 w-0 flex-1 pt-0.5"><p class="text-sm font-medium text-gray-900">${this.notificationTitle}</p><p class="mt-2 text-sm text-gray-900">${this.notificationText}</p></div><div class="ml-4 flex shrink-0"><button type="button" @click=${this.toggleNotification} class="inline-flex rounded-md bg-white text-gray-400"><span class="sr-only">Close</span><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" class="size-5 hover:text-red-500"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"></path></svg></button></div></div></div></div>`;
	}

	toggleNotification() {
		if (this.showNotification) {
			this.hideNotification();
		} else {
			this.displayNotification();
		}
	}

	async hideNotification() {
		this.querySelector('#notification').classList.toggle("opacity-0");
		await new Promise(resolve => setTimeout(resolve, 300));
		this.showNotification = false;
	}

	async displayNotification() {
		this.showNotification = true;
		await new Promise(resolve => setTimeout(resolve, 100));
		this.querySelector('#notification').classList.toggle("opacity-0");
	}

	notifyUser(title, text) {
		this.notificationTitle = title;
		this.notificationText = text;
		this.toggleNotification();
		setTimeout(() => this.toggleNotification(), 3000);
	}

	fileMenuOpen() {
		return !this.querySelector("#file_menu")?.classList.contains("hidden");
	}

	aboutMenuOpen() {
		return !this.querySelector("#about_menu")?.classList.contains("hidden");
	}

  toggleFileMenu() {
    this.querySelector("#file_menu")?.classList.toggle("hidden");
  }

  toggleAboutMenu() {
    this.querySelector("#about_menu")?.classList.toggle("hidden");
  }

  async handleOpenFile() {
		this.toggleFileMenu();

		if (window.showOpenFilePicker) {
			const [fileHandle] = await window.showOpenFilePicker({
				types: [{ description: "YAML Data Contracts", accept: { "text/plain": [".yml", ".yaml", ".txt"]} }]
			});
			const file = await fileHandle.getFile();
			const content = await file.text();
			this.editor.setValue(content);
			this.notifyUser('Datacontract loaded', 'Content loaded into the editor');
		} else {
			const fileInput = document.createElement('input');
			fileInput.setAttribute('type', 'file');
			fileInput.setAttribute('class', 'hidden');
			fileInput.addEventListener('change', async () => {
				const file = fileInput.files.item(0);
				const content = await file.text()
				this.editor.setValue(content);
				this.notifyUser('Datacontract loaded', 'Content loaded into the editor');
				fileInput.remove();
			});
			document.body.appendChild(fileInput);
			fileInput.click();
		}
	}

  handleLoadMinimal() {
		const content = getMinimal();
		this.editor.setValue(content);
		this.toggleFileMenu();
	}

  handleLoadExample() {
		const content = getExample();
		this.editor.setValue(content);
		this.toggleFileMenu();
	}

  async handleSave() {
		this.toggleFileMenu();
		const fileContent = this.editor.getValue();
		if (window.showSaveFilePicker) {
			const handle = await window.showSaveFilePicker({
				types: [{ description: "YAML Data Contracts", accept: { "text/plain": [".yml", ".yaml", ".txt"]} }]
			});
			let stream = await handle.createWritable();
			try {
				await stream.write(fileContent);
			} finally {
				await stream.close();
				this.notifyUser('Datacontract saved', 'File saved successfully');
			}
		} else {
			const bb = new Blob([fileContent], { type: 'text/plain' });
    	const a = document.createElement('a');
    	a.download = 'datacontract.yaml';
    	a.href = window.URL.createObjectURL(bb);
    	a.click();
    	a.remove();
		}

	}

  handleShare() {


		encodeYamlCode(this.editor.getValue()).then((encodedYaml) => {
			const shareUrl = `${location.protocol}//${location.host}/?dc=${encodedYaml}`;
			navigator.clipboard.writeText(shareUrl);
			this.toggleFileMenu();
			this.notifyUser('Sharing prepared', 'Sharelink copied to Clipboard');
		});
	}

  handleClear() {
		this.editor.setValue("");
		this.toggleFileMenu();
	}
}
customElements.define("dce-nav", NavElement);
