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

        hideTurboIcon(link);
    });
};

export default disableTurbo;
