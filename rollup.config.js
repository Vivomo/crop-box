import nodeResolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'
import { terser } from 'rollup-plugin-terser'
import pkg from './package.json'

const env = process.env.NODE_ENV;

const config = {
    input: './src/index.js',
    external: Object.keys(pkg.peerDependencies || {}),
    output: {
        format: 'umd',
        name: 'CropBox',
        globals: {
            CropBox: 'CropBox',
        }
    },
    plugins: [
        nodeResolve(),
        babel({
            exclude: '**/node_modules/**',
            runtimeHelpers: true
        })
    ]
};

if (env === 'production') {
    config.plugins.push(
        terser({
            compress: {
                pure_getters: true,
                unsafe: true,
                unsafe_comps: true,
                warnings: false
            }
        })
    )
}

export default config