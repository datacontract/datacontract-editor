import { loader } from '@monaco-editor/react';

import * as monaco from 'monaco-editor';

// Configure Monaco Editor web workers for Vite
// Uses new URL() + import.meta.url pattern (Vite recommended)
if (typeof window !== 'undefined') {
  window.MonacoEnvironment = {
    getWorker(_, label) {
      if (label === 'yaml') {
        return new Worker(new URL('./yaml.worker.js', import.meta.url), { type: 'module' });
      }
      return new Worker(
        new URL('monaco-editor/esm/vs/editor/editor.worker.js', import.meta.url),
        { type: 'module' }
      );
    },
  };
}

loader.config({ monaco });

loader.init();

export { monaco };
