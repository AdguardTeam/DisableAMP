const fs = require('fs');
const { execFileSync } = require('child_process');

if (process.env.CI || !fs.existsSync('.git')) {
    process.exit(0);
}

execFileSync('husky', { stdio: 'inherit' });