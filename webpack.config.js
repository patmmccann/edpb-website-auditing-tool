const path = require('path');
const webpack = require('webpack');

module.exports = {
    entry: {
        trackers:'./preloads/trackers.js',
        dnt:'./preloads/dnt.js',
        screenshots:'./preloads/screenshots.js',
    },
    output: {
        path: path.resolve(__dirname, 'electron/handlers/sessions'),
        filename: '[name].bundle.js',
    },
    externals: {
        electron: 'commonjs2 electron',  // Exclude Electron from the bundle
    },
    target: 'electron-preload',
    mode: 'production'
};