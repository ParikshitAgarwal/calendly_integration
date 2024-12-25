const axios = require('axios');
const calendlyUserUrl = process.env.CALENDLY_USER_URL
const calendlyOrganizationUrl = process.env.CALENDLY_ORGANIZATION_URL
const calendlyWebhookSigninkey = process.env.CALENDLY_WEBHOOK_SIGNIN_KEY
const serverURL = process.env.SERVER_URL;
let calendlyApiToken = process.env.CALENDLY_API_TOKEN;
const calendlyRefreshToken = process.env.CALENDLY_REFRESH_TOKEN
const calendLyOauthToken = process.env.CALENDLY_OAUTH_TOKEN;
const {
    handleTokenRefresh
} = require("./refreshTokenService")

const createWebhookSubscription = async () => {


    const options = {
        method: 'POST',
        url: 'https://api.calendly.com/webhook_subscriptions',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${calendlyApiToken}`
        },
        data: {
            url: `${serverURL}/webhook`,
            events: [
                'invitee.created'
            ],
            organization: calendlyOrganizationUrl,
            user: calendlyUserUrl,
            scope: 'organization',
            signing_key: calendlyWebhookSigninkey
        }
    };
    try {
        const {
            data
        } = await axios.request(options);
        console.log('Webhook subscription created:', data);
    } catch (error) {
        console.error('Error creating webhook subscription:', error.response ? error.response.data : error.message);

        if (error.response && error.response.status === 401) {
            const newAccessToken = await handleTokenRefresh("https://auth.calendly.com/oauth/token", {
                    grant_type: 'refresh_token',
                    refresh_token: calendlyRefreshToken,
                }, {
                    Authorization: `Basic ${calendLyOauthToken}`
                },
                "CALENDLY_API_TOKEN"
            );


            calendlyApiToken = newAccessToken

            await createWebhookSubscription();

        }
    }
}

module.exports = {
    createWebhookSubscription
}