const axios = require('axios');
let zohoAccessToken = process.env.ZOHO_ACCESS_TOKEN;
const zohoBaseUrl = process.env.ZOHO_BASE_URL
const zohoClientId = process.env.ZOHO_CLIENT_ID;
const zohoClientSecret = process.env.ZOHO_CLIENT_SECRET;
const zohoRefreshToken = process.env.ZOHO_REFRESH_TOKEN;
const {
    handleTokenRefresh
} = require("./refreshTokenService")




const createLead = async (payload, res) => {
    const {
        email: inviteeEmail = "",
        name: inviteeLastName = "",
        scheduled_event,
        text_reminder_number: inviteeMobile = ""
    } = payload


    const eventOwnerEmail = scheduled_event.event_memberships[0].user_email
    const eventName = scheduled_event.name;

    const eventNameKey = '';
    if(eventName === "Meet Your Personal CFO"){
        eventNameKey = 'Discovery_Call_Date';
    } else if(eventName === 'Insurance Consultation'){
        eventNameKey = 'Insurance_Consultation';
    }

    try {
        // Create or update contact in Zoho CRM
        const getUserResponse = await axios.get(`${zohoBaseUrl}/users?type=AllUsers`, {
            headers: {
                Authorization: `Zoho-oauthtoken ${zohoAccessToken}`
            }
        })


        const zohoOwner = getUserResponse.data.users.find((user) => user.email === eventOwnerEmail)

        const {
            id: zohoOwnerId = "",
            full_name: zohoOwnerName = ""
        } = zohoOwner

        const discorverCallDate = scheduled_event.start_time.split('T')[0];
        const response = await axios.post(`${zohoBaseUrl}/Leads`, {
            data: [{
                Owner: {
                    id: zohoOwnerId,
                    full_name: zohoOwnerName
                },
                Email: inviteeEmail,
                Last_Name: inviteeLastName,
                Mobile: inviteeMobile,
                [eventNameKey]: discorverCallDate
            }]
        }, {
            headers: {
                Authorization: `Zoho-oauthtoken ${zohoAccessToken}`
            }
        });

        res.status(200).send('Webhook processed and contact created/updated');
    } catch (error) {
        if (error.response && error.response.status === 401) {
            // Access token might be expired, refresh it and retry

            const newAccessToken = await handleTokenRefresh("https://accounts.zoho.in/oauth/v2/token", {
                grant_type: 'refresh_token',
                refresh_token: zohoRefreshToken,
                client_id: zohoClientId,
                client_secret: zohoClientSecret,
            }, {}, "ZOHO_ACCESS_TOKEN");
            zohoAccessToken = newAccessToken;
            await createLead(payload, res);
        } else {
            res.status(500).send('Failed to process webhook');
            console.error('Error creating/updating contact in Zoho CRM:', error.response ? error.response.data : error.message);
        }
    }
}

module.exports = {
    createLead
}