import {
    hideAmpIcon,
    sanitizeLinkElement,
    extractCanonicalFromJslog,
    extractCanonicalLink,
} from './utils';

const HTTPS = 'https://';
const AMP_ATTRIBUTES_TO_REMOVE = [
    'ping',
    'data-ved',
    'data-amp-cur',
    'data-amp-title',
    'data-amp',
    'data-amp-vgi',
    'jsaction',
];
const AMP_IMAGE_LINK_SELECTOR = 'a[data-ved]:has(> div[class] > span + svg)';
const AMP_SEARCH_LINK_SELECTOR = 'a[data-amp]';
const AMP_NEWS_LINK_SELECTOR = 'a[data-amp-vgi]';

/**
 * Prevent AMP links from Google News, Search, and Images from opening within Google's iframe
 * e.g. google.com/amp/amp.website.com
 */
export const cleanAmpLink = () => {
    const ampImageLinks = document.querySelectorAll(AMP_IMAGE_LINK_SELECTOR);
    const siblingAmpLinks = [];

    ampImageLinks.forEach((link) => {
        const siblingAmpLink = link.previousElementSibling;
        if (!siblingAmpLink || !siblingAmpLink.hasAttribute('data-ved')) {
            return;
        }
        siblingAmpLinks.push(siblingAmpLink);
    });

    const ampSearchLinks = document.querySelectorAll(AMP_SEARCH_LINK_SELECTOR);

    const ampNewsLinks = document.querySelectorAll(AMP_NEWS_LINK_SELECTOR);

    const allAmpLinks = [
        ...ampSearchLinks,
        ...ampNewsLinks,
        ...ampImageLinks,
        ...siblingAmpLinks,
    ];

    allAmpLinks.forEach((link) => {
        AMP_ATTRIBUTES_TO_REMOVE.forEach((attr) => {
            link.removeAttribute(attr);
        });
    });
};

/**
 * Redirects amp version to normal
 */
export const ampRedirect = () => {
    // additional marker to check if the page is amp
    const ampMarker = document.querySelector('script[src^="https://cdn.ampproject.org/"]');
    if (!ampMarker) {
        return;
    }

    const canonicalLink = extractCanonicalLink();

    if (!canonicalLink) {
        return;
    }
    // redirect to canonical link if current page is not iframe
    document.location.href = canonicalLink;
};

/**
 * Replaces amp links provided by amp cdn
 */
export const replaceCdnAmp = () => {
    const ampLinks = document.querySelectorAll('a[data-amp-cdn]');
    ampLinks.forEach((ampLink) => {
        let fixedUrl = ampLink.href;

        if (fixedUrl.includes('cdn.ampproject.org')) {
            fixedUrl = HTTPS + fixedUrl.substr(fixedUrl.indexOf('cdn.ampproject.org/wp/s/') + 24);
        }

        if (fixedUrl.substr(8).startsWith('amp.')) {
            fixedUrl = HTTPS + fixedUrl.substr(12);
        }

        fixedUrl = fixedUrl.replace('?amp&', '?&');

        if (fixedUrl !== ampLink.href) {
            ampLink.setAttribute('href', fixedUrl);

            ampLink.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                document.location.href = fixedUrl;
            }, true);
            hideAmpIcon(ampLink);
        }
    });
};

export const preventNewsAmp = () => {
    if (window.self !== window.top) {
        return;
    }
    const linkElements = document.querySelectorAll('article > a[jslog]');
    linkElements.forEach((el) => {
        // news.google.com keep amp links as encoded `jslog` attribute value
        const jslog = el.getAttribute('jslog');
        const canonicalUrl = extractCanonicalFromJslog(jslog);
        if (canonicalUrl) {
            sanitizeLinkElement(el, canonicalUrl);
        }
    });
};
