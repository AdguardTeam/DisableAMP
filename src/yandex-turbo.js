/**
 * Hides Turbo page icon
 * @param {object} turboLink
 */
const hideTurboIcon = (turboLink) => {
    if (turboLink.querySelector('.text-with-icon')) {
        turboLink.style.position = 'absolute';
        turboLink.style.left = '-99999px';
    }
};

/**
 * Disables Yandex Turbo pages
 */
const disableTurbo = () => {
    const turboLinks = document.querySelectorAll('a[href^="https://yandex.ru/turbo/"]');
    [...turboLinks].forEach((link) => {
        const originalUrl = link.href
            .replace('yandex.ru/turbo/', '')
            .replace('/s/', '/');

        link.setAttribute('href', originalUrl);

        link.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            document.location.href = originalUrl;
        }, true);

        hideTurboIcon(link);
    });
};

/**
 * Redirects from Yandex Turbo page to normal version
 */
const redirectTurboPages = () => {
    const originalUrl = document.location.href
        .split('yandex.ru/turbo/')
        .pop()
        .replace('/s/', '/');

    const protocol = document.location.protocol;

    if (originalUrl && protocol) {
        document.location.href = `${protocol}//${originalUrl}`;
    }
};

export {
    disableTurbo,
    redirectTurboPages,
};
