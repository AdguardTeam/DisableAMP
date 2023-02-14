const exclusions = [
    // automatic redirect to amp in .htaccess
    'https://www.orfonline.org/*',
    'https://tehnichka.pro/*',
    // automatic redirect to yandex turbo in .htaccess
    'https://yandex.ru/turbo/s/terrnews.com/*',
    // infinite reload due to design
    'https://amp.dev/*',
];

module.exports = exclusions;
