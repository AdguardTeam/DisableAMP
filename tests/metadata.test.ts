/**
 * @file Standalone metadata check invoked by pnpm run test:metadata.
 */

import fs from 'fs';
import path from 'path';

const DEFAULT_USERSCRIPT_PATH = path.resolve(__dirname, '../build/dev/disable-amp.user.js');
const REQUIRED_INCLUDE = '// @include      https://*/*/lite/';
const REQUIRED_INCLUDE_AMP_IN_SEGMENT = '// @include      https://*/articleAmp/*';

const userscriptPath = process.argv[2] || DEFAULT_USERSCRIPT_PATH;

if (!fs.existsSync(userscriptPath)) {
    throw new Error(`Userscript file does not exist: ${userscriptPath}`);
}

const userscript = fs.readFileSync(userscriptPath, 'utf8');

// verify the /lite/ pattern is present
const matches = userscript
    .split(/\r?\n/)
    .filter((line) => line === REQUIRED_INCLUDE);

if (matches.length !== 1) {
    throw new Error(`Expected exactly one ${REQUIRED_INCLUDE}, found ${matches.length}`);
}

process.stdout.write(`Verified metadata include: ${REQUIRED_INCLUDE}\n`);

// verify the embedded-amp pattern is present
const ampInSegmentMatches = userscript
    .split(/\r?\n/)
    .filter((line) => line === REQUIRED_INCLUDE_AMP_IN_SEGMENT);

if (ampInSegmentMatches.length !== 1) {
    throw new Error(
        `Expected exactly one ${REQUIRED_INCLUDE_AMP_IN_SEGMENT}, found ${ampInSegmentMatches.length}`,
    );
}

process.stdout.write(`Verified metadata include: ${REQUIRED_INCLUDE_AMP_IN_SEGMENT}\n`);
