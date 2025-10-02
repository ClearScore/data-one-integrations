import { defineConfig } from 'rolldown-vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';
import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));

const banner = `/*!
 * ${pkg.name} v${pkg.version}
 * ${pkg.description}
 * (c) ${new Date().getFullYear()} ${pkg.author}
 * Released under the ${pkg.license} License.
 */`;

export default defineConfig({
    plugins: [
        dts({
            tsconfigPath: './tsconfig.json',
            outDir: 'dist/types',
            include: ['src/**/*'],
            exclude: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
        }) as any,
    ],
    build: {
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            name: '__dataone',
        },
        rollupOptions: {
            external: [],
            output: [
                {
                    format: 'es',
                    entryFileNames: 'esm/index.mjs',
                    banner,
                    exports: 'named',
                },
                {
                    format: 'es',
                    entryFileNames: 'esm/index.min.mjs',
                    banner,
                    exports: 'named',
                },
                {
                    format: 'iife',
                    entryFileNames: 'iife/index.js',
                    name: '__dataone',
                    banner,
                },
                {
                    format: 'iife',
                    entryFileNames: 'iife/index.min.js',
                    name: '__dataone',
                    banner,
                },
            ],
        },
        minify: 'terser',
        sourcemap: true,
        target: 'es2020',
    },
    define: {
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
    },
});
