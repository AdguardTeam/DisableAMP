import fs from 'fs';
import path from 'path';

const WRAPPER_DIR_ENV = 'USERSCRIPTS_WRAPPER_DIR';

type UserscriptSettings = unknown;

type UserscriptParser = {
    parse: (content: string) => UserscriptSettings;
    serializeAll: (
        userscripts: UserscriptSettings[],
        templateBefore: string,
        templateAfter: string,
    ) => string;
};

/**
 * Splits a wrapper template around a single replacement token.
 *
 * @param filePath Template file path.
 * @param token Replacement token to split by.
 *
 * @returns Template content before and after the token.
 */
const readSplitTemplate = (filePath: string, token: string): [string, string] => {
    const template = fs.readFileSync(filePath, 'utf8');
    const parts = template.split(token);

    if (parts.length !== 2) {
        throw new Error(`Expected ${filePath} to contain ${token} exactly once`);
    }

    return [parts[0], parts[1]];
};

/**
 * Reads the userscripts-wrapper checkout path from the environment.
 *
 * @returns Absolute or relative userscripts-wrapper checkout path.
 */
const getWrapperDir = (): string => {
    const wrapperDir = process.env[WRAPPER_DIR_ENV];

    if (!wrapperDir) {
        throw new Error(`${WRAPPER_DIR_ENV} is required for wrapper e2e tests`);
    }

    return wrapperDir;
};

/**
 * Builds a userscripts-wrapper bundle that contains the generated Disable AMP userscript.
 *
 * @param userscriptPath Path to the generated Disable AMP userscript.
 *
 * @returns Browser-executable userscripts-wrapper bundle.
 */
export const createWrapperBundle = (userscriptPath: string): string => {
    const wrapperDir = getWrapperDir();
    const parseUserscriptPath = path.join(wrapperDir, 'tests/parse-userscript.js');
    const wrapperTemplatePath = path.join(wrapperDir, 'build/userscriptTemplate.js');
    const transformerTemplatePath = path.join(wrapperDir, 'build/userscriptTransformer.js');

    // userscripts-wrapper exposes this helper as CommonJS from its test harness.
    // eslint-disable-next-line global-require, import/no-dynamic-require
    const { parse, serializeAll } = require(parseUserscriptPath) as UserscriptParser;
    const [wrapperBefore, wrapperAfter] = readSplitTemplate(wrapperTemplatePath, '$_userscripts_');
    const [transformerBefore, transformerAfter] = readSplitTemplate(
        transformerTemplatePath,
        '$_userscript_content_',
    );

    const userscript = fs.readFileSync(userscriptPath, 'utf8');
    const settings = [parse(userscript)];

    return wrapperBefore + serializeAll(settings, transformerBefore, transformerAfter) + wrapperAfter;
};
