import editorWorker from './editor.worker.js?worker';
import yamlWorker from './yaml.worker.js?worker';

self.MonacoEnvironment = {
	getWorker(_, label) {
		if (label === 'yaml') {
			return new yamlWorker();
		}
		return new editorWorker();
	}
};
