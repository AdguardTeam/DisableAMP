import { test, expect } from '@playwright/test';
import {
    CANONICAL_URL,
    LITE_URL,
    UNRELATED_URL,
    USERSCRIPT_PATH,
    expectUrlToStay,
    routeFixtures,
} from '../e2e/fixtures';
import { createWrapperBundle } from './wrapper-bundle';

test.describe('Disable AMP userscripts-wrapper e2e', () => {
    let wrapperScript: string;

    test.beforeAll(() => {
        wrapperScript = createWrapperBundle(USERSCRIPT_PATH);
    });

    test.beforeEach(async ({ page }) => {
        await routeFixtures(page, { wrapperScript });
    });

    test('wrapper allows /lite/ URL and redirects to canonical URL', async ({ page }) => {
        await page.goto(LITE_URL);

        await page.waitForURL(CANONICAL_URL);
        await expect(page).toHaveURL(CANONICAL_URL);
    });

    test('wrapper does not execute userscript outside include patterns', async ({ page }) => {
        await page.goto(UNRELATED_URL);

        await expectUrlToStay(page, UNRELATED_URL);
    });
});
