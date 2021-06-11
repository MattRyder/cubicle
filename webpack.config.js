require('webpack');
const path = require('path');
const WebpackObfuscator = require('webpack-obfuscator');

const mode = 'development';

const plugins = [
    () => (mode === 'production' ? new WebpackObfuscator(
        { rotateStringArray: true },
    ) : undefined),
];

const config = {
    mode,
    entry: './src/index.ts',
    devtool: 'inline-source-map',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
    },
    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        compress: true,
        port: 8080,
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: 'babel-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.ts(x)?$/,
                loader: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },

    plugins,
    resolve: {
        extensions: [
            '.tsx',
            '.ts',
            '.js',
        ],
    },
};

module.exports = config;
