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
 * Replace href link for AMP element in google search results,
 * to extend the behaviour of a short click also to long click
 */
const newTabContext = (ntc) => {
    // '/amp/s/' is the univocal tag to invoke an AMP page preview
    ntc.setAttribute('href', ntc.getAttribute('data-amp').replace("https://", document.location.origin + "/amp/s/").replace("?", "%3f"));

    ntc.setAttribute('data-amp', "");
    ntc.setAttribute('data-amp-cur', "");
    ntc.setAttribute('ping', "");
};

function preventAmp() {
    if (document.URL.includes("https://www.google.") && document.URL.includes("/amp/s/")) {
        document.getElementsByTagName("BODY")[0].style.display = "none";
        window.addEventListener("DOMContentLoaded", function(){
            document.location.replace(document.getElementById('amp-hdr').getElementsByClassName('amp-cantxt notranslate')[0].textContent);
        });
    } else {
        const elements = document.querySelectorAll('a.amp_r');
        [...elements].forEach((el) => {
            if (el[expando]) {
                return;
            }

            // eslint-disable-next-line no-param-reassign
            el[expando] = true;

            hideAmpIcon(el);
            newTabContext(el);
        });
    }
}

preventAmp();
observeDomChanges(preventAmp);
