import { disableTurbo, redirectTurboPages } from './yandex-turbo';
import disableAmp from './google-amp';


const observeDomChanges = (callback) => {
    new MutationObserver(callback).observe(document, {
        childList: true,
        subtree: true,
    });
};

if (document.location.origin.includes('google.')) {
    observeDomChanges(disableAmp);
}

if (document.location.origin.includes('yandex.')) {
    observeDomChanges(disableTurbo);
}

if (document.location.origin.includes('turbopages.org')) {
    redirectTurboPages();
}
