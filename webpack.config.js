const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

const pkg = require('./package.json');
const MetaDataPlugin = require('./metadata.plugin');
const metaSettings = require('./meta.settings');

const BUILD_DIR = 'build';
const SOURCE_DIR = 'src';
const MODE_TYPES = { DEV: 'dev', BETA: 'beta', RELEASE: 'release' };
const MODE = MODE_TYPES[process.env.NODE_ENV] || MODE_TYPES.DEV;
const USERSCRIPT_NAME = 'disable-amp';
const CI_BUILD_CONFIG = 'variables.txt';

const config = {
    mode: MODE === MODE_TYPES.DEV ? 'development' : 'production',
    entry: {
        main: path.resolve(__dirname, SOURCE_DIR, 'index.js'),
    },
    output: {
        path: path.resolve(__dirname, BUILD_DIR, MODE),
        filename: `${USERSCRIPT_NAME}.user.js`,
    },
    optimization: {
        minimize: MODE === MODE_TYPES.RELEASE || MODE === MODE_TYPES.BETA,
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                },
            },
        ],
    },
    plugins: [
        new CleanWebpackPlugin(),
        new CopyPlugin([{
            from: `./${CI_BUILD_CONFIG}`,
            transform: (content) => {
                const str = content.toString();
                return str.replace('[VERSION]', pkg.version);
            },
        }]),
        new MetaDataPlugin({
            filename: USERSCRIPT_NAME,
            ...metaSettings.common,
            ...(metaSettings[MODE] || {}),
            fields: {
                ...metaSettings.common.fields,
                ...((metaSettings[MODE] && metaSettings[MODE].fields) || {}),
            },
        }),
    ],
};

module.exports = config;
