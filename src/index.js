import { redirectTurboPages } from './yandex-turbo';
import disableAmp, { ampRedirect } from './google-amp';

const observeDomChanges = (callback) => {
    new MutationObserver(callback).observe(document, {
        childList: true,
        subtree: true,
    });
};

const { href, origin } = document.location;

if (href.includes('https://yandex.ru/turbo') || href.includes('turbopages.org')) {
    redirectTurboPages();
} else if (origin.includes('google.')) {
    observeDomChanges(disableAmp);
} else {
    ampRedirect();
}
