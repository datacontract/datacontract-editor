import Split from 'split-grid';

// Setup Editor Infrastructure
import './monaco/configure-yaml.js';
import './workers/monaco.workers.js';

// Init the movable split
Split({
	snapOffset: 0,
	columnGutters: [{
		track: 1,
		element: document.querySelector('.gutter-col'),
	}],
})

// Wire Editor Events to the other elements
const editor = document.querySelector('dce-editor');
const errorList = document.querySelector('dce-error-list');
const previewPane = document.querySelector('dce-preview-pane');

// wire error list to error events
editor.addEventListener('editor-errors', (e) => {
	const errors = e.detail.validationErrors;
	errorList.errors = errors;
});

// wire preview pane to editor content changes
editor.addEventListener('editor-content-changed', (e) => {
	const document = e.detail.content;
	previewPane.document = document;
});
// now that everything is wired up make the editor spit put the content for a first render
document.dispatchEvent(new CustomEvent('request-document'));
