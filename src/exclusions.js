const exclusions = [
    // https://github.com/AdguardTeam/DisableAMP/issues/118
    'https://www.eurasiantimes.com/*',
    // automatic redirect to amp in .htaccess
    'https://www.orfonline.org/*',
    'https://tehnichka.pro/*',
    // https://github.com/AdguardTeam/DisableAMP/issues/115
    'https://www.teluguone.com/*',
    'https://teluguone.com/*',
    // https://github.com/AdguardTeam/DisableAMP/issues/110
    'https://www.onmanorama.com/*',
    // https://github.com/AdguardTeam/DisableAMP/issues/109
    'https://xn----7sbbeeptbfadjdvm5ab9bqj.xn--p1ai/*',
    // automatic redirect to yandex turbo in .htaccess
    'https://yandex.ru/turbo/s/terrnews.com/*',
    // infinite reload due to design
    'https://amp.dev/*',
];

module.exports = exclusions;
