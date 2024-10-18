import { redirectTurboPages } from './yandex-turbo';
import { redirectAmpProjectPages } from './amp-project';
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
        redirectAmpProjectPages();
        return;
    }

    if (origin.includes('news.google.')) {
        observeDomChanges(preventNewsAmp);
    } else {
        observeDomChanges(preventAmp);
    }
})();
