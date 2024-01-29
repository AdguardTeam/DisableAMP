/**
 * Redirects from Yandex Turbo page to normal version
 */
export const redirectTurboPages = () => {
    const postMessage = document.querySelector('script[data-name="post-message"][data-message]');
    if (!postMessage) {
        return;
    }
    const dataMessage = postMessage.getAttribute('data-message');
    const dataJson = JSON.parse(dataMessage);

    if (dataJson && dataJson.originalUrl) {
        document.location.href = dataJson.originalUrl;
    }
};
