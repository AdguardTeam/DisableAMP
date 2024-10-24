const AMP_TOKEN_REGEXP = /(amp\/|amp-|\.amp)/;

export const observeDomChanges = (callback) => {
    new MutationObserver(callback).observe(document, {
        childList: true,
        subtree: true,
    });
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
