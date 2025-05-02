// controllers/devUtilsController.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const fetch = require('node-fetch'); // Ensure you have node-fetch installed: npm install node-fetch

// Replace with your actual Stripe webhook endpoint ID
const STRIPE_WEBHOOK_ENDPOINT_ID = 'we_1RK4W0F5i98bmYv2r87anMm4';

async function getNgrokUrl() {
  try {
    const ngrokApiUrl = 'http://127.0.0.1:4040/api/tunnels'; // Default ngrok API URL
    const response = await fetch(ngrokApiUrl);
    const data = await response.json();

    if (data && data.tunnels && Array.isArray(data.tunnels) && data.tunnels.length > 0) {
      // Find the tunnel that is forwarding to your backend port (e.g., 5000)
      const httpTunnel = data.tunnels.find(tunnel => tunnel.config && tunnel.config.addr === 'http://localhost:5000');
      if (httpTunnel) {
        return httpTunnel.public_url; // This will be the https:// ngrok URL
      }
    }
    console.warn('Could not retrieve ngrok URL from API.');
    return null;
  } catch (error) {
    console.error('Error fetching ngrok URL from API:', error);
    return null;
  }
}

async function updateStripeWebhookUrl() {
  const newNgrokUrl = await getNgrokUrl();

  if (newNgrokUrl) {
    const webhookUrl = `${newNgrokUrl}/api/payment/webhook`;
    try {
      const webhookEndpoint = await stripe.webhookEndpoints.update(
        STRIPE_WEBHOOK_ENDPOINT_ID,
        { url: webhookUrl }
      );
      console.log('Stripe webhook URL updated successfully:', webhookEndpoint.url);
    } catch (error) {
      console.error('Error updating Stripe webhook URL:', error);
    }
  } else {
    console.warn('Ngrok URL not available, skipping Stripe webhook update.');
  }
}

async function initializeDevTools() {
  if (process.env.NODE_ENV === 'development') {
    console.log('Running in development mode, attempting to update Stripe webhook URL using API...');
    await updateStripeWebhookUrl();
    // You might want to call this periodically to handle ngrok restarts
    // setInterval(updateStripeWebhookUrl, 60 * 60 * 1000); // Check every hour
  }
}

module.exports = {
  initializeDevTools,
  updateStripeWebhookUrl, // Exporting for manual use if needed
};