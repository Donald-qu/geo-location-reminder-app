// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Twilio from "twilio";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Twilio client
const client = Twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

// Endpoint to send SMS
app.post("/send-sms", async (req, res) => {
  const { to, body } = req.body;

  try {
    const message = await client.messages.create({
      to,
      body,
      messagingServiceSid: process.env.TWILIO_MSG_SERVICE_SID,
    });

    res.status(200).json({ success: true, messageSid: message.sid });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
