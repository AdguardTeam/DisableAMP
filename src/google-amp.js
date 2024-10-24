import { hideAmpIcon, sanitizeLinkElement, extractCanonicalFromJslog } from './utils';

const URL_PATTERN_REGEX = /^https?:\/\/.+/i;
const HTTPS = 'https://';
const AMP_ATTRIBUTES_TO_REMOVE = [
    'ping',
    'data-ved',
    'data-amp-cur',
    'data-amp-title',
    'data-amp',
    'data-amp-vgi',
];

/**
 * Prevent amp links from open in google iframe
 * e.g. google.com/amp/amp.website.com
 */
export const cleanAmpLink = () => {
    const ampLinks = document.querySelectorAll('a[data-amp]');
    ampLinks.forEach((link) => {
        AMP_ATTRIBUTES_TO_REMOVE.forEach((attr) => {
            link.removeAttribute(attr);
        });
    });
};

/**
 * Redirects amp version to normal
 */
export const ampRedirect = () => {
    const canonicalLink = document.querySelector('head > link[rel="canonical"]');
    if (!canonicalLink) {
        return;
    }

    if (!URL_PATTERN_REGEX.test(canonicalLink.href)) {
        return;
    }

    // iframe do not have this marker
    const ampMarker = document.querySelector('script[src^="https://cdn.ampproject.org/"]');
    if (!ampMarker) {
        return;
    }

    // redirect to canonical link if current page is not iframe
    document.location.href = canonicalLink.href;
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
