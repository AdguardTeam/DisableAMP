const URL_PATTERN_REGEX = /^https?:\/\/.+/i;
const expando = `__${Math.random()}`;

function observeDomChanges(callback) {
    new MutationObserver(callback).observe(document, {
        childList: true,
        subtree: true,
    });
}

/**
 * Hide AMP icon for AMP element in google search results
 * @param amp element
 */
const hideAmpIcon = (amp) => {
    const ampIcon = amp.querySelector('[aria-label="AMP logo"], [aria-label="Logo AMP"]');
    if (ampIcon) {
        ampIcon.style.display = 'none';
    }
};

/**
 * Redirects amp version to normal
 */
const ampRedirect = () => {
    if (document.location.pathname.includes('/amp/')) {
        const originalUrl = document.querySelector('#amp-hdr .amp-cantxt')?.textContent;
        if (originalUrl && URL_PATTERN_REGEX.test(originalUrl)) {
            document.location.replace(originalUrl);
        }
    }
};

function preventAmp() {
    ampRedirect();
    const elements = document.querySelectorAll('a.amp_r[data-amp-cur]');
    [...elements].forEach((el) => {
        if (el[expando]) {
            return;
        }

        // eslint-disable-next-line no-param-reassign
        el[expando] = true;

        hideAmpIcon(el);

        const url = el.getAttribute('data-amp-cur');
        if (!url) {
            return;
        }
        el.setAttribute('href', url);

        el.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            // https://github.com/AdguardTeam/DisableAMP/pull/15
            document.location.href = url;
        }, true);
    });
}

preventAmp();
observeDomChanges(preventAmp);
