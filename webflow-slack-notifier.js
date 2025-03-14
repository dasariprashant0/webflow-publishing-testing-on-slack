const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

const SLACK_WEBHOOK_URL = 'https://hooks.slack.com/services/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';

app.post('/webflow-publish', async (req, res) => {
    console.log('Received request:', req.body);
    try {
        const { triggerType, payload } = req.body;
        if (triggerType === 'site_publish') {
            const { siteId, domains, publishedBy } = payload;
            const message = `🚀 Webflow project with Site ID *${siteId}* has been published on: ${domains.join(', ')} by ${publishedBy.displayName}`;

            const response = await axios.post(SLACK_WEBHOOK_URL, { text: message });
            console.log('Slack response:', response.data);
            res.status(200).send('Notification sent to Slack');
        } else {
            res.status(400).send('Invalid trigger type');
        }
    } catch (error) {
        console.error('Error sending Slack message:', error.response ? error.response.data : error.message);
        res.status(500).send('Failed to send Slack message');
    }
});

app.listen(3000, () => console.log('Server running on port 3000')); 
