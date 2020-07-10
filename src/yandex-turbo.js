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
    const turboLinks = document.querySelectorAll('a[href^="https://yandex.ru/turbo/s/"]');
    [...turboLinks].forEach((link) => {
        const url = link.href.replace('yandex.ru/turbo/s/', '');
        link.setAttribute('href', url);

        link.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            document.location.href = url;
        }, true);

        hideTurboIcon(link);
    });
};

/**
 * Redirects from Yandex Turbo page to normal version
 */
const redirectTurboPages = () => {
    const originalUrl = document.location.href.split('turbopages.org/s/').pop();
    const protocol = document.location.protocol;
    if (originalUrl && protocol) {
        document.location.href = `${protocol}//${originalUrl}`;
    }
};

export {
    disableTurbo,
    redirectTurboPages,
};
