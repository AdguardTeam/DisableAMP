import { expect, type Page, type Route } from '@playwright/test';

export const BASE_URL = 'https://example.test';

export const CANONICAL_URL = `${BASE_URL}/article/test/`;
export const LITE_URL = `${BASE_URL}/article/test/lite/`;
export const NO_MARKER_URL = `${BASE_URL}/article/no-marker/lite/`;
export const NO_CANONICAL_URL = `${BASE_URL}/article/no-canonical/lite/`;
export const ARTICLEAMP_URL = `${BASE_URL}/articleAmp/20120802443424/`;
export const ARTICLEAMP_CANONICAL_URL = `${BASE_URL}/article/20120802443424/`;
export const UNRELATED_URL = `${BASE_URL}/plain/`;

/**
 * Time to watch for unexpected redirects in stable-URL assertions.
 */
const URL_STABILITY_TIMEOUT_MS = 500;

type FixtureOptions = {
    wrapperScript?: string;
};

/**
 * Builds a minimal HTML document for fixture pages.
 *
 * @param head HTML content for the document head.
 * @param body HTML content for the document body.
 *
 * @returns Complete fixture document.
 */
const html = (head: string, body: string): string => (
    `<!doctype html><html><head>${head}</head><body>${body}</body></html>`
);
const ampScript = '<script async src="https://cdn.ampproject.org/v0.js"></script>';

/**
 * Builds a canonical link tag for an AMP fixture page.
 *
 * @param url Canonical page URL.
 *
 * @returns Canonical link HTML.
 */
const canonical = (url: string): string => `<link rel="canonical" href="${url}">`;

const canonicalPage = html('', '<h1>Canonical page</h1>');
const ampPage = html(`${ampScript}${canonical(CANONICAL_URL)}`, '<h1>AMP lite page</h1>');
const noMarkerPage = html(canonical(CANONICAL_URL), '<h1>No AMP marker</h1>');
const noCanonicalPage = html(ampScript, '<h1>No canonical</h1>');
const articleAmpCanonicalPage = html('', '<h1>articleAmp canonical page</h1>');
const articleAmpPage = html(
    `${ampScript}${canonical(ARTICLEAMP_CANONICAL_URL)}`,
    '<h1>articleAmp page</h1>',
);

/**
 * Registers deterministic page fixtures for Disable AMP browser tests.
 *
 * @param page Playwright page to register routes on.
 * @param options Fixture options.
 *
 * @returns Promise that resolves after all routes are registered.
 */
export const routeFixtures = async (page: Page, options: FixtureOptions = {}): Promise<void> => {
    const scriptTag = options.wrapperScript
        ? '<script src="/userscripts.js"></script>'
        : '';

    await page.route(`${BASE_URL}/**`, (route: Route) => {
        const url = new URL(route.request().url());
        let body;

        if (url.pathname === '/article/test/lite/') {
            body = ampPage.replace('<head>', `<head>${scriptTag}`);
        } else if (url.pathname === '/article/test/') {
            body = canonicalPage.replace('<head>', `<head>${scriptTag}`);
        } else if (url.pathname === '/article/no-marker/lite/') {
            body = noMarkerPage.replace('<head>', `<head>${scriptTag}`);
        } else if (url.pathname === '/article/no-canonical/lite/') {
            body = noCanonicalPage.replace('<head>', `<head>${scriptTag}`);
        } else if (url.pathname === '/articleAmp/20120802443424/') {
            body = articleAmpPage.replace('<head>', `<head>${scriptTag}`);
        } else if (url.pathname === '/article/20120802443424/') {
            body = articleAmpCanonicalPage.replace('<head>', `<head>${scriptTag}`);
        } else {
            body = html(scriptTag, '<h1>Unrelated page</h1>');
        }

        return route.fulfill({
            contentType: 'text/html',
            body,
        });
    });

    await page.route('https://cdn.ampproject.org/**', (route: Route) => route.fulfill({
        contentType: 'application/javascript',
        body: '',
    }));

    await page.route(`${BASE_URL}/userscripts.js`, (route: Route) => route.fulfill({
        contentType: 'application/javascript',
        body: options.wrapperScript || '',
    }));
};

/**
 * Asserts that no navigation away from the expected URL happens.
 *
 * @param page Playwright page to observe.
 * @param expectedUrl URL that must remain active.
 *
 * @returns Promise that resolves when the URL remains stable.
 */
export const expectUrlToStay = async (page: Page, expectedUrl: string): Promise<void> => {
    await expect(page).toHaveURL(expectedUrl);

    await expect(page.waitForURL(
        (url) => url.href !== expectedUrl,
        { timeout: URL_STABILITY_TIMEOUT_MS },
    ).then(() => true, () => false)).resolves.toBe(false);

    await expect(page).toHaveURL(expectedUrl);
};
