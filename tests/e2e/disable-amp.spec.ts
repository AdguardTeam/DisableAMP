import path from 'path';
import { test, expect, type Page } from '@playwright/test';
import {
    CANONICAL_URL,
    LITE_URL,
    NO_MARKER_URL,
    NO_CANONICAL_URL,
    expectUrlToStay,
    routeFixtures,
} from './fixtures';

const USERSCRIPT_PATH = path.resolve(__dirname, '../../build/dev/disable-amp.user.js');

/**
 * Injects the generated userscript into the current page.
 *
 * @param page Playwright page to inject into.
 *
 * @returns Promise that resolves after the script tag is added.
 */
const injectUserscript = async (page: Page): Promise<void> => {
    await page.addScriptTag({ path: USERSCRIPT_PATH });
};

test.describe('Disable AMP direct userscript smoke', () => {
    test.beforeEach(async ({ page }) => {
        await routeFixtures(page);
    });

    test('redirects /lite/ AMP page to canonical URL', async ({ page }) => {
        await page.goto(LITE_URL);
        await injectUserscript(page);

        await page.waitForURL(CANONICAL_URL);
        await expect(page).toHaveURL(CANONICAL_URL);
    });

    test('keeps canonical page stable', async ({ page }) => {
        await page.goto(CANONICAL_URL);
        await injectUserscript(page);

        await expectUrlToStay(page, CANONICAL_URL);
    });

    test('does not redirect matched page without AMP marker', async ({ page }) => {
        await page.goto(NO_MARKER_URL);
        await injectUserscript(page);

        await expectUrlToStay(page, NO_MARKER_URL);
    });

    test('does not redirect AMP page without canonical link', async ({ page }) => {
        await page.goto(NO_CANONICAL_URL);
        await injectUserscript(page);

        await expectUrlToStay(page, NO_CANONICAL_URL);
    });
});
