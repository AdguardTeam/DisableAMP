/**
 * @file Standalone metadata check invoked by pnpm run test:metadata.
 */

import fs from 'fs';
import path from 'path';

const DEFAULT_USERSCRIPT_PATH = path.resolve(__dirname, '../build/dev/disable-amp.user.js');
const REQUIRED_INCLUDE = '// @include      https://*/*/lite/';

const userscriptPath = process.argv[2] || DEFAULT_USERSCRIPT_PATH;

if (!fs.existsSync(userscriptPath)) {
    throw new Error(`Userscript file does not exist: ${userscriptPath}`);
}

const userscript = fs.readFileSync(userscriptPath, 'utf8');
const matches = userscript
    .split(/\r?\n/)
    .filter((line) => line === REQUIRED_INCLUDE);

if (matches.length !== 1) {
    throw new Error(`Expected exactly one ${REQUIRED_INCLUDE}, found ${matches.length}`);
}

process.stdout.write(`Verified metadata include: ${REQUIRED_INCLUDE}\n`);
