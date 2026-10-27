import {
    test,
    expect,
    type Locator,
    type Page,
} from '@playwright/test';
import {
    GOOGLE_SEARCH_URL,
    LIBERO_AMP_URL,
    LIBERO_ARTICLE_URL,
    LIBERO_GOOGLE_AMP_URL,
    injectUserscript,
    routeGoogleSearchFixtures,
} from './fixtures';

const AMP_ATTRIBUTES = [
    'ping',
    'data-ved',
    'data-amp-cur',
    'data-amp-title',
    'data-amp',
    'data-amp-vgi',
    'jsaction',
];

const RESULT_ATTRIBUTES = {
    'data-amp-cur': LIBERO_GOOGLE_AMP_URL,
    'data-amp-title': 'Libero Quotidiano',
    'data-ved': 'CAAQ',
    ping: '/url?sa=t',
    jsaction: 'click',
};

type ResultLinkOptions = {
    id: string;
    href: string;
    attributes: Record<string, string>;
    contentHtml?: string;
};

/**
 * Adds a result link after the userscript is injected, imitating results
 * rendered dynamically by Google.
 *
 * @param page Playwright page to add the result to.
 * @param options Result link options.
 *
 * @returns Promise that resolves after the result is added.
 */
const addResultLink = async (page: Page, options: ResultLinkOptions): Promise<void> => {
    await page.evaluate(({
        id,
        href,
        attributes,
        contentHtml,
    }) => {
        const link = document.createElement('a');
        link.id = id;
        link.setAttribute('href', href);

        if (contentHtml) {
            link.innerHTML = contentHtml;
        } else {
            link.textContent = 'Libero Quotidiano';
        }

        Object.entries(attributes).forEach(([name, value]) => {
            link.setAttribute(name, value);
        });

        document.querySelector('#results')?.append(link);
    }, options);
};

/**
 * Adds a Google Search AMP result link.
 *
 * @param page Playwright page to add the result to.
 *
 * @returns Promise that resolves after the result is added.
 */
const addSearchResult = async (page: Page): Promise<void> => {
    await addResultLink(page, {
        id: 'amp-result',
        href: LIBERO_ARTICLE_URL,
        attributes: {
            ...RESULT_ATTRIBUTES,
            'data-amp': LIBERO_AMP_URL,
        },
    });
};

/**
 * Adds a Google News AMP result link.
 *
 * @param page Playwright page to add the result to.
 *
 * @returns Promise that resolves after the result is added.
 */
const addNewsResult = async (page: Page): Promise<void> => {
    await addResultLink(page, {
        id: 'amp-news-result',
        href: LIBERO_ARTICLE_URL,
        attributes: {
            ...RESULT_ATTRIBUTES,
            'data-amp-vgi': LIBERO_AMP_URL,
        },
    });
};

/**
 * Adds an AMP image result link with a preceding sibling result link.
 *
 * @param page Playwright page to add the result to.
 *
 * @returns Promise that resolves after the results are added.
 */
const addImageResult = async (page: Page): Promise<void> => {
    await addResultLink(page, {
        id: 'amp-image-sibling',
        href: LIBERO_ARTICLE_URL,
        attributes: RESULT_ATTRIBUTES,
    });
    await addResultLink(page, {
        id: 'amp-image-result',
        href: LIBERO_ARTICLE_URL,
        attributes: RESULT_ATTRIBUTES,
        contentHtml: '<div class="image"><span></span><svg></svg></div>',
    });
};

/**
 * Asserts that the userscript removed all AMP attributes from a result link
 * and kept the canonical URL.
 *
 * @param link Result link to check.
 *
 * @returns Promise that resolves when the link is cleaned up.
 */
const expectAmpLinkCleanup = async (link: Locator): Promise<void> => {
    await expect.poll(() => link.evaluate(
        (element, attributes) => attributes.filter((attribute) => element.hasAttribute(attribute)),
        AMP_ATTRIBUTES,
    )).toEqual([]);
    await expect(link).toHaveAttribute('href', LIBERO_ARTICLE_URL);
};

test.describe('Disable AMP Google Search link cleanup', () => {
    test.beforeEach(async ({ page }) => {
        await routeGoogleSearchFixtures(page);
    });

    // Regression test for AdguardTeam/DisableAMP#102: the userscript used to
    // replace the result URL with a sanitized `data-amp-cur` value, which broke
    // links on some sites.
    test('removes AMP attributes without rewriting the result URL', async ({ page }) => {
        await page.goto(GOOGLE_SEARCH_URL);
        await injectUserscript(page);

        await addSearchResult(page);

        await expectAmpLinkCleanup(page.locator('#amp-result'));
    });

    test('removes AMP attributes from news and image results', async ({ page }) => {
        await page.goto(GOOGLE_SEARCH_URL);
        await injectUserscript(page);

        await addNewsResult(page);
        await addImageResult(page);

        await expectAmpLinkCleanup(page.locator('#amp-news-result'));
        await expectAmpLinkCleanup(page.locator('#amp-image-result'));
        await expectAmpLinkCleanup(page.locator('#amp-image-sibling'));
    });

    test('opens the canonical article from a Google search result', async ({ page }) => {
        await page.goto(GOOGLE_SEARCH_URL);
        await injectUserscript(page);

        await addSearchResult(page);

        const result = page.locator('#amp-result');
        await expectAmpLinkCleanup(result);

        await result.click();

        await expect(page).toHaveURL(LIBERO_ARTICLE_URL);
        await expect(page.locator('h1')).toHaveText('Article page');
    });
});
