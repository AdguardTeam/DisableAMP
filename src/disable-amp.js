const expando = `__${Math.random()}`;

function observeDomChanges(callback) {
    new MutationObserver(callback).observe(document, {
        childList: true,
        subtree: true,
    });
}

/**
 * Hide AMP icons in google search results
 */
const hideAmpIcons = () => {
    const ampIcons = document.querySelectorAll('[aria-label="AMP logo"]');
    [...ampIcons].forEach((icon) => {
        icon.style.display = 'none';
    })
};

function preventAmp() {
    hideAmpIcons();
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
    });
}

preventAmp();
observeDomChanges(preventAmp);
