import { loader } from '@monaco-editor/react';
// `#monaco` is src/lib/monaco-bundled.js, or the Monaco of the host page in the `shared-monaco`
// build (see vite.config.js). Everything from monaco-editor and monaco-yaml comes through it.
import { monaco, configureMonacoYaml, yamlConf, yamlTokens } from '#monaco';

// Give @monaco-editor/react this Monaco instance. Without this it loads one from a CDN.
loader.config({ monaco });

loader.init();

export { monaco, configureMonacoYaml, yamlConf, yamlTokens };
