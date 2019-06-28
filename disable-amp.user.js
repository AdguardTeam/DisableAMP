// ==UserScript==
// @name         Disable AMP
// @namespace    adguard
// @version      1.0.1
// @description  This is a very simple userscript that disables AMP on the Google search results page.
// @downloadURL  https://userscripts.adtidy.org/release/disable-amp/1.0/disable-amp.user.js
// @updateURL    https://userscripts.adtidy.org/release/disable-amp/1.0/disable-amp.meta.js
// @homepageURL  https://adguard.com/
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