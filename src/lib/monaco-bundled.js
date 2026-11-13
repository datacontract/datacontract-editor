// The Monaco that this build carries: the editor core, the YAML language, monaco-yaml and the
// workers. The module name `#monaco` resolves to this file (see vite.config.js), except in the
// `shared-monaco` build, where the host page supplies Monaco.
import { configureMonacoYaml } from 'monaco-yaml';
import { conf as yamlConf, language as yamlTokens } from 'monaco-editor/esm/vs/basic-languages/yaml/yaml.js';

// Import the editor core (all editor features, no languages) instead of the
// `monaco-editor` barrel, which would pull in every basic-language and the
// json/css/html/ts language services. We only ever edit YAML.
import * as monaco from 'monaco-editor/esm/vs/editor/edcore.main.js';
import 'monaco-editor/esm/vs/basic-languages/yaml/yaml.contribution.js';

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

// The `monaco-editor` barrel patches `editor.createWebWorker` so it also accepts
// the legacy `{ label, moduleId, createData }` signature, which is what
// monaco-yaml (via monaco-worker-manager) still uses. `edcore.main.js` ships
// without that patch, so re-apply it here — otherwise the YAML worker is never
// spawned and every language-service request fails with
// "Missing requestHandler or method: doValidation".
const createWebWorkerFromDescriptor = monaco.editor.createWebWorker;
monaco.editor.createWebWorker = function createWebWorker(options) {
  if (options.worker !== undefined) {
    return createWebWorkerFromDescriptor(options);
  }
  const worker = Promise.resolve(
    window.MonacoEnvironment.getWorker('workerMain.js', options.label ?? 'monaco-editor-worker')
  ).then((w) => {
    w.postMessage('ignore');
    w.postMessage(options.createData);
    return w;
  });
  return createWebWorkerFromDescriptor({
    worker,
    host: options.host,
    keepIdleModels: options.keepIdleModels,
  });
};

export { monaco, configureMonacoYaml, yamlConf, yamlTokens };
