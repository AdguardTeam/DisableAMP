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
    // '/amp/s/' -for https- and '/amp/' -for http- are the univocal tags exists after URL origin, useful to invoke an AMP page preview
    const origURL = ntc.getAttribute('data-amp');
    const redirURL = origURL.includes("https://") ? origURL.replace("https://", "https://" + document.location.host + "/amp/s/") : origURL.replace("http://", "http://" + document.location.host + "/amp/");
    // Encoding URL is needed to avoid redirection warning
    const encodedURL = redirURL.replace("?", "%3f");
    ntc.setAttribute('href', encodedURL);

    ntc.setAttribute('data-amp', "");
    ntc.setAttribute('data-amp-cur', "");
    ntc.setAttribute('ping', "");
};

function preventAmp() {
    if (document.location.origin.includes("www.google.") && document.URL.replace(document.location.origin, "").startsWith("/amp/")) {
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
