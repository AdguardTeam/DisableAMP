const expando = `__${Math.random()}`;

function observeDomChanges(callback) {
    new MutationObserver(callback).observe(document, {
        childList: true,
        subtree: true,
    });
}

/**
 * Redirects "/amp/" website to a stripped version
 */
function avoidPersistance() {
    const url = document.URL;
    if (url.includes("/amp/")) {
      document.location.replace(url.substring(0, url.indexOf("amp/")) + "?nonamp=1");
    }
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
    avoidPersistance();

    const elements = document.querySelectorAll('a.amp_r[data-amp-cur]');
    [...elements].forEach((el) => {
        if (el[expando]) {
            return;
        }

        // eslint-disable-next-line no-param-reassign
        el[expando] = true;

        el.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const url = el.getAttribute('data-amp-cur');
            // https://github.com/AdguardTeam/DisableAMP/pull/15
            document.location.href = url;
        }, true);
        hideAmpIcon(el);
    });
}

preventAmp();
observeDomChanges(preventAmp);
