require("dotenv").config();
const express = require("express");
const fetch = require("node-fetch");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); // Middleware to parse JSON

// Webflow Webhook Route
app.post("/webhook", async (req, res) => {
  try {
    const webflowData = req.body;
    console.log("Received Webflow Webhook:", webflowData);

    // Format the message for Slack
    const slackMessage = formatSlackMessage(webflowData);

    // Send the message to Slack
    const slackResponse = await sendToSlack(slackMessage);
    if (!slackResponse.ok) {
      throw new Error(`Slack Error: ${slackResponse.statusText}`);
    }

    res.status(200).json({ success: true, message: "Webhook processed" });
  } catch (error) {
    console.error("Error handling webhook:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Function to format message for Slack
function formatSlackMessage(data) {
  const { triggerType, payload } = data;

  if (triggerType === "site_publish" && payload) {
    const { siteId, publishedOn, domains, publishedBy } = payload;
    const publishDate = new Date(publishedOn).toLocaleString();
    const domainsList = domains?.join(", ") || "No domains specified";

    return {
      text: `🚀 *Webflow Site Published* \n- **Site ID:** ${siteId} \n- **Published By:** ${publishedBy?.displayName || "Unknown"} \n- **Published On:** ${publishDate} \n- **Domains:** ${domainsList}`,
    };
  }

  return { text: `🌐 *Webflow Event: ${triggerType}* \n\`\`\`${JSON.stringify(data, null, 2)}\`\`\`` };
}

// Function to send message to Slack
async function sendToSlack(message) {
  const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!slackWebhookUrl) {
    throw new Error("Missing SLACK_WEBHOOK_URL in .env");
  }

  return fetch(slackWebhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(message),
  });
}

// Start the Express server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
