import { defineConfig } from '@playwright/test';

export default defineConfig({
    timeout: 10000,
    reporter: [['list']],
    use: {
        browserName: 'chromium',
        headless: true,
        ignoreHTTPSErrors: true,
    },
});
