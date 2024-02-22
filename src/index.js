import { redirectTurboPages } from './yandex-turbo';
import { preventNewsAmp, preventAmp, ampRedirect } from './google-amp';
import { observeDomChanges } from './utils';

(() => {
    const { href, origin } = document.location;

    if (href.includes('https://yandex.ru/turbo') || href.includes('turbopages.org')) {
        redirectTurboPages();
        return;
    }

    if (!origin.includes('.google.')) {
        ampRedirect();
        return;
    }

    if (origin.includes('news.google.')) {
        observeDomChanges(preventNewsAmp);
    } else {
        observeDomChanges(preventAmp);
    }
})();
