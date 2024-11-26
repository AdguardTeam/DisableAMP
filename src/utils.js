const AMP_TOKEN_REGEXP = /(amp\/|amp-|\.amp)/;
/**
 * An array of CSS selectors used to identify canonical links in a document.
 * @type {string[]}
 */
const CANONICAL_LINK_SELECTORS = [
    '#amp-mobile-version-switcher > a',
    'head > link[rel="canonical"]',
];

/**
 * Check if given string is valid url
 * @param {string} url - url to check
 * @returns - true if url is valid, false otherwise
 */
const isValidUrl = (url) => {
    try {
        new URL(url);
        return true;
    } catch (e) {
        return false;
    }
};

export const observeDomChanges = (callback) => {
    new MutationObserver(callback).observe(document, {
        childList: true,
        subtree: true,
    });
};

/**
 * Get canonical link from elements with {@link CANONICAL_LINK_SELECTORS}.
 * @returns {string|null} canonical url or null if not found
 */
export const extractCanonicalLink = () => {
    // html links stores inside amp-mobile-version-switcher or inside canonical link tag
    const canonicalLink = CANONICAL_LINK_SELECTORS.reduce((found, selector) => {
        return found || document.querySelector(selector);
    }, null);

    if (!canonicalLink) {
        return null;
    }

    if (!isValidUrl(canonicalLink.href)) {
        return null;
    }

    // need to remove amp query parameter from canonical link
    // if it is present in the url
    const canonicalUrl = new URL(canonicalLink.href);

    if (canonicalUrl.searchParams.has('amp')) {
        canonicalUrl.searchParams.delete('amp');
    }

    return canonicalUrl.href;
};

/**
 * Hide AMP icon for AMP element in google search results
 * @param amp element
 */
export const hideAmpIcon = (amp) => {
    const ampIcon = amp.querySelector('[aria-label="AMP logo"], [aria-label="Logo AMP"]');
    if (ampIcon) {
        ampIcon.style.display = 'none';
    }
};

/**
 * Replaces href of amp link by canonical url
 * @param {Element} el link element
 * @param {string} url canonical url
 */
export const sanitizeLinkElement = (el, url) => {
    el.setAttribute('href', url);

    el.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        // https://github.com/AdguardTeam/DisableAMP/pull/15
        document.location.href = url;
    }, true);
    hideAmpIcon(el);
};

/**
 * Extracts canonical url from link tags which use jslog attribute to store
 * encoded data. Encoded data may store only canonical url or both canonical
 * and amp urls.
 *
 * @param {string} jslog
 * @returns {string|null} canonical url or null if there is no amp version
 */
export const extractCanonicalFromJslog = (jslog) => {
    const encodedData = jslog.substring(
        jslog.indexOf(':') + 1,
        jslog.indexOf('; track:click,vis'),
    );

    let decodedData;
    try {
        decodedData = JSON.parse(atob(encodedData));
    } catch (e) { /* do nothing */ }

    if (!decodedData) {
        return null;
    }

    const urls = decodedData
        .filter((item) => typeof item === 'string' && (item.startsWith('http') || item.startsWith('https')));

    // Data may only contain canonical url, this means website does not have amp version
    if (urls.length < 2) {
        return null;
    }

    // Canonical url will be the first one in most cases
    const canonicalUrl = urls.find((url) => !AMP_TOKEN_REGEXP.test(url));
    return canonicalUrl || null;
};
