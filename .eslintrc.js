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
        'jsdoc',
    ],
    settings: {
        'import/resolver': {
            node: {
                extensions: ['.js', '.ts'],
            },
        },
    },
    rules: {
        indent: ['error', 4, {
            SwitchCase: 1,
        }],
        'max-len': ['error', { code: 120, ignoreUrls: true }],
        'import-newlines/enforce': ['error', 3, 120],
        'import/no-extraneous-dependencies': ['error', {
            devDependencies: true,
            packageDir: [__dirname],
        }],
        'no-restricted-syntax': ['error', 'LabeledStatement', 'WithStatement'],
        'no-constant-condition': ['error', { checkLoops: false }],
        'prefer-regex-literals': 0,
        'import/prefer-default-export': 0,
        'no-bitwise': 0,
        'no-new': 0,
        'no-continue': 0,
        'arrow-body-style': 0,
    },
    overrides: [
        {
            files: [
                'playwright.config.ts',
                'tests/**/*.ts',
            ],
            parser: '@typescript-eslint/parser',
            parserOptions: {
                sourceType: 'module',
            },
            rules: {
                'import/extensions': ['error', 'ignorePackages', {
                    js: 'never',
                    ts: 'never',
                }],
                'no-unused-vars': 'off',
                'jsdoc/check-tag-names': 'error',
                'jsdoc/check-types': 'error',
                'jsdoc/require-description-complete-sentence': 'error',
                'jsdoc/require-param': 'error',
                'jsdoc/require-param-description': 'error',
                'jsdoc/require-returns': 'error',
                'jsdoc/require-returns-check': 'error',
                'jsdoc/require-returns-description': 'error',
                'jsdoc/require-jsdoc': ['error', {
                    contexts: [
                        'ExportNamedDeclaration > VariableDeclaration > VariableDeclarator > ArrowFunctionExpression',
                        'Program > VariableDeclaration > VariableDeclarator > ArrowFunctionExpression',
                    ],
                }],
            },
        },
    ],
};
