import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));

const banner = `/*!
 * ${pkg.name} v${pkg.version}
 * ${pkg.description}
 * (c) ${new Date().getFullYear()} ${pkg.author}
 * Released under the ${pkg.license} License.
 */`;

const createConfig = (format, minify = false) => ({
  input: 'src/index.ts',
  output: {
    file: `dist/${format}/index${minify ? '.min' : ''}.js`,
    format,
    name: format === 'iife' ? '__dataone' : undefined,
    banner,
    sourcemap: true,
    globals: format === 'iife' ? {} : undefined,
  },
  external: format === 'iife' ? [] : Object.keys(pkg.dependencies || {}),
  plugins: [
    resolve({
      browser: true,
      preferBuiltins: false,
    }),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.json',
      declaration: false,
      declarationMap: false,
    }),
    ...(minify ? [terser()] : []),
  ],
});

export default [
  // ESM
  createConfig('esm'),
  createConfig('esm', true),

  // Iife
  createConfig('iife'),
  createConfig('iife', true),
];
