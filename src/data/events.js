const posthog = require('../config/posthog');

async function track(event, distinctId, properties = {}) {
    try {
        await posthog.capture({
            distinctId,
            event,
            properties
        });

        await posthog.flush(); // ✅ correto

        return { success: true };
    } catch (err) {
        throw err;
    }
}

function trackAsync(event, distinctId, properties = {}) {
    const start = Date.now();

    track(event, distinctId, properties)
        .then(() => {
            // console.log(`✅ [PostHog] ${event} OK (${Date.now() - start}ms)`);
        })
        .catch(err => {
            console.error(`❌ [PostHog] ${event} FAILED`, {
                error: err.message,
                stack: err.stack
            });
        });
}

module.exports = { track, trackAsync };