const { PostHog } = require('posthog-node');

const posthog = new PostHog('phc_G9YvR5XYou57t9lVyjkTxzRDZlC3WcEwkCD1Y7TYZnB', {
    host: 'https://us.i.posthog.com' || 'https://us.i.posthog.com',
});

module.exports = posthog;