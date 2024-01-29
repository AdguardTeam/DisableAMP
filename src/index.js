import { redirectTurboPages } from './yandex-turbo';
import { preventNewsAmp, preventAmp, ampRedirect } from './google-amp';
import { observeDomChanges } from './utils';

const { href, origin } = document.location;

if (href.includes('https://yandex.ru/turbo') || href.includes('turbopages.org')) {
    redirectTurboPages();
} else if (origin.includes('news.google.')) {
    observeDomChanges(preventNewsAmp);
} else if (origin.includes('.google.')) {
    observeDomChanges(preventAmp);
} else {
    ampRedirect();
}
