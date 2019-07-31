const pkg = require('./package.json');

const releaseChannels = {
    common: {
        fields: {
            USERSCRIPT_VERSION: pkg.version,
            USERSCRIPT_NAME: {
                messageKey: 'name',
                metaName: 'name',
                usePostfix: true,
            },
            USERSCRIPT_DESCRIPTION: {
                messageKey: 'description',
                metaName: 'description',
            },
        },
    },
    dev: {
        postfix: 'Dev',
        fields: {
            DOWNLOAD_URL: '',
            UPDATE_URL: '',
        },
    },
    beta: {
        postfix: 'Beta',
        fields: {
            DOWNLOAD_URL: 'https://userscripts.adtidy.org/beta/disable-amp/1.0/disable-amp.user.js',
            UPDATE_URL: 'https://userscripts.adtidy.org/beta/disable-amp/1.0/disable-amp.meta.js',
        },
    },
    release: {
        fields: {
            DOWNLOAD_URL: 'https://userscripts.adtidy.org/release/disable-amp/1.0/disable-amp.user.js',
            UPDATE_URL: 'https://userscripts.adtidy.org/release/disable-amp/1.0/disable-amp.meta.js',
        },
    },
};

module.exports = releaseChannels;
