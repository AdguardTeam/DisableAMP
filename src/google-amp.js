import {
    sanitizeUrl,
    hideAmpIcon,
    sanitizeLinkElement,
    extractCanonicalFromJslog,
} from './utils';

const DISABLE_AMP_REDIRECTED = '__disable_amp_redirected';
const URL_PATTERN_REGEX = /^https?:\/\/.+/i;
const ARTICLE_VIEW_AMP = 'articleViewAmp';
const expando = `__${Math.random()}`;
const HTTPS = 'https://';

/**
 * Redirects amp version to normal
 */
export const ampRedirect = () => {
    // timeout to prevent automatic redirects to amp
    const REDIRECT_WAIT_TIME_OUT_MS = 30000;
    const disableAmpRedirectedDate = Number(sessionStorage.getItem(DISABLE_AMP_REDIRECTED));
    if (
        // Prevent redirecting to another page if run in an iframe
        window.self !== window.top
        // Do not redirect if since last redirect past less than REDIRECT_WAIT_TIME_OUT_MS
        || (disableAmpRedirectedDate
            && Date.now() - disableAmpRedirectedDate < REDIRECT_WAIT_TIME_OUT_MS)
    ) {
        return;
    }
    const canonicalLink = document.querySelector('head > link[rel="canonical"]');
    const ampProjectScript = document.querySelector('head > script[src^="https://cdn.ampproject.org"]');
    if (ampProjectScript && canonicalLink && URL_PATTERN_REGEX.test(canonicalLink.href)) {
        sessionStorage.setItem(DISABLE_AMP_REDIRECTED, Date.now());
        window.top.location.href = canonicalLink.href;
    }
};

/**
 * Replaces amp links by data-amp-cur attribute value
 */
const replaceByAmpCurAttribute = () => {
    const elements = document.querySelectorAll('a[data-amp-cur]');
    [...elements].forEach((el) => {
        if (el[expando]) {
            return;
        }

        // eslint-disable-next-line no-param-reassign
        el[expando] = true;

        const url = el.getAttribute('data-amp-cur') || el.getAttribute('data-amp');
        if (url) {
            sanitizeLinkElement(el, sanitizeUrl(url));
            return;
        }

        // Some websites manage to break the data-amp-cur attribute and use articleViewAmp htmls instead,
        // e.g http://www.mediatoday.co.kr/news/articleViewAmp.html?idxno=313292
        const { href } = el;
        if (href && href.includes(ARTICLE_VIEW_AMP)) {
            sanitizeLinkElement(el, href.replace(ARTICLE_VIEW_AMP, 'articleView'));
        }
    });
};

/**
 * Replaces amp links provided by amp cdn
 */
const replaceCdnAmp = () => {
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

export const preventAmp = () => {
    replaceByAmpCurAttribute();
    replaceCdnAmp();
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
