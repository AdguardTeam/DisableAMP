/**
 * Redirects from ampproject.org pages to normal version
 */
export const redirectAmpProjectPages = () => {
    const canonicalLinkElement = document.querySelector('link[rel="canonical"][href]');
    if (!canonicalLinkElement) {
        return;
    }
    const canonicalLocationHref = canonicalLinkElement.href;

    if (canonicalLocationHref) {
        document.location.href = canonicalLocationHref;
    }
};
