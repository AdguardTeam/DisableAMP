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
    const ampIcon = amp.querySelectorAll('[aria-label="Logo AMP"], [aria-label="AMP logo"]');
    [...ampIcon].forEach((el) => {
        if (el) {
            el.style.display = 'none';
        }
    });
};

function preventAmp() {
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
            document.location.replace(url);
        }, true);
        hideAmpIcon(el);
    });
}

preventAmp();
observeDomChanges(preventAmp);
