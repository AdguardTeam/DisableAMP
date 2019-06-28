// ==UserScript==
// @name         Disable AMP
// @namespace    adguard
// @version      1.0.0
// @description  This is a very simple userscript that disables AMP pages on the Google search results page.
// @author       AdGuard
// @match        https://www.google.*/*
// @grant        none
// @run-at       document-end
// ==/UserScript==
const expando = '__' + Math.random();

function observeDomChanges(callback) {
    new MutationObserver(callback).observe(document, {
        childList: true,
        subtree: true,
    });
}

function preventAmp() {
    let elements = document.querySelectorAll('a.amp_r[data-amp-cur]');
    [...elements].forEach((el) => {
        if (el[expando]) {
            return;
        } else {
            el[expando] = true;
        }

        el.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            let url = el.getAttribute('data-amp-cur');
            document.location.replace(url);
        }, true);
    });
}

preventAmp();
observeDomChanges(preventAmp);