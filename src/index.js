import { redirectTurboPages } from './yandex-turbo';
import {
    preventNewsAmp,
    replaceCdnAmp,
    ampRedirect,
    cleanAmpLink,
} from './google-amp';
import { observeDomChanges } from './utils';

const SEARCH_PATH = '/search';
const GOOGLE_NEWS_PATH = 'news.google.';
const GOOGLE_PATH = 'google.';
const YANDEX_TURBO_PATH = 'https://yandex.ru/turbo';
const TURBOPAGES_PATH = 'turbopages.org';

(() => {
    const { href, origin } = document.location;

    if (href.includes(YANDEX_TURBO_PATH) || href.includes(TURBOPAGES_PATH)) {
        redirectTurboPages();
        return;
    }

    // clean links in google search result to prevent them from open in iframe
    if (origin.includes(GOOGLE_PATH) && href.includes(SEARCH_PATH)) {
        observeDomChanges(cleanAmpLink);
    }

    // redirect only amp links
    if (!origin.includes(GOOGLE_PATH)) {
        ampRedirect();
    }

    if (origin.includes(GOOGLE_NEWS_PATH)) {
        observeDomChanges(preventNewsAmp);
    } else {
        observeDomChanges(replaceCdnAmp);
    }
})();
