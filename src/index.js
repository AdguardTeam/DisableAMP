import { redirectTurboPages } from './yandex-turbo';
import disableAmp, { ampRedirect } from './google-amp';

const observeDomChanges = (callback) => {
    new MutationObserver(callback).observe(document, {
        childList: true,
        subtree: true,
    });
};

if (document.location.href.includes('https://yandex.ru/turbo')) {
    redirectTurboPages();
} else if (document.location.origin.includes('google.')) {
    observeDomChanges(disableAmp);
} else {
    ampRedirect();
}
