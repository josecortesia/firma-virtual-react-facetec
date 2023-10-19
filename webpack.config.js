// Generated using webpack-cli https://github.com/webpack/webpack-cli

const Dotenv = require('dotenv-webpack');
const path = require('path');

const isProduction = process.env.NODE_ENV == 'production';

const config = {
    entry: './src/index.ts',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: "main.js"
    },
    plugins: [
        new Dotenv({
            path: "./.env.development"
        })
    ],
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/i,
                loader: 'ts-loader',
                exclude: ['/node_modules/'],
            },
            {
                test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
                type: 'asset',
            },
        ],
    },
    devtool: 'inline-source-map',
    resolve: {
        extensions: ['.ts', '.js']
    },
    performance: {
        hints: process.env.NODE_ENV === 'production' ? "warning" : false,
        maxAssetSize: 5000000,
        maxEntrypointSize: 5000000
    }
};

module.exports = () => {
    if (isProduction) {
        config.mode = 'production';
    } else {
        config.mode = 'development';
    }
    return config;
};
