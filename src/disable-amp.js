const expando = `__${Math.random()}`;

function observeDomChanges(callback) {
    new MutationObserver(callback).observe(document, {
        childList: true,
        subtree: true,
    });
}

// Redirects "/amp/" website to a stripped version
const persistentURL = document.URL;
if (persistentURL.endsWith("/amp/")) {
    document.location.replace(persistentURL.substring(0, persistentURL.indexOf("amp/")) + "?nonamp=1");
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

function preventAmp() {

    const elements = document.querySelectorAll('a.amp_r[data-amp-cur]');
    [...elements].forEach((el) => {
        if (el[expando]) {
            return;
        }

        // eslint-disable-next-line no-param-reassign
        el[expando] = true;

        const url = el.getAttribute('data-amp-cur');
        el.setAttribute('ping', url);

        el.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            // https://github.com/AdguardTeam/DisableAMP/pull/15
            document.location.href = url;
        }, true);
        hideAmpIcon(el);
    });
}

if (location.origin.includes(".google.")) {
    preventAmp();
    observeDomChanges(preventAmp);
}
