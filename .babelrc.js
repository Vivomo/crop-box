const loose = true;

module.exports = {
    presets: [['@babel/env', { loose, modules: false }]],
    plugins: [
        ['@babel/proposal-decorators', { legacy: true }],
        ['@babel/proposal-object-rest-spread', { loose }],
        ['@babel/transform-runtime', { useESModules: true }],
    ].filter(Boolean),
};