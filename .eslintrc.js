module.exports = {
    env: {
        browser: true,
        node: true,
        es6: true,
    },
    extends: 'airbnb-base',
    plugins: [
        'import',
        'import-newlines',
    ],
    rules: {
        indent: ['error', 4, {
            SwitchCase: 1,
        }],
        'max-len': ['error', { code: 120, ignoreUrls: true }],
        'import-newlines/enforce': ['error', 3, 120],
        'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
        'no-restricted-syntax': ['error', 'LabeledStatement', 'WithStatement'],
        'no-constant-condition': ['error', { checkLoops: false }],
        'prefer-regex-literals': 0,
        'import/prefer-default-export': 0,
        'no-bitwise': 0,
        'no-new': 0,
        'no-continue': 0,
        'arrow-body-style': 0,
    },
};
