import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const exampleRoot = fileURLToPath(new URL('.', import.meta.url));
const workspaceRoot = resolve(exampleRoot, '../..');

export default defineConfig({
    root: exampleRoot,
    base: './',
    server: {
        fs: {
            allow: [workspaceRoot],
        },
    },
    build: {
        outDir: resolve(exampleRoot, 'dist'),
        emptyOutDir: true,
        rollupOptions: {
            input: resolve(exampleRoot, 'index.html'),
        },
    },
});