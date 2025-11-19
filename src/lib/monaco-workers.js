import { loader } from '@monaco-editor/react';

import * as monaco from 'monaco-editor';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import YamlWorker from './yaml.worker.js?worker';

// Configure Monaco Editor web workers for Vite
self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === 'yaml') {
      return new YamlWorker();
    }
    return new editorWorker();
  },
};

loader.config({ monaco });

loader.init();

export { monaco };
