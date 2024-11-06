import { extractCanonicalLink } from './utils';
/**
 * Redirects from Yandex Turbo page to normal version
 */
export const redirectTurboPages = () => {
    const canonicalLink = extractCanonicalLink();
    if (canonicalLink) {
        document.location.href = canonicalLink;
        return;
    }

    const postMessage = document.querySelector('script[data-name="post-message"][data-message]');
    if (!postMessage || !canonicalLink) {
        return;
    }
    const dataMessage = postMessage.getAttribute('data-message');
    const dataJson = JSON.parse(dataMessage);

    if (dataJson && dataJson.originalUrl) {
        document.location.href = dataJson.originalUrl;
    }
};
