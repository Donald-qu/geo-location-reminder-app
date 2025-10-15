import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Twilio from "twilio";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const client = Twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

app.post("/send-sms", async (req, res) => {
  const { to, body } = req.body;

  if (!to || !body) {
    return res.status(400).json({ error: "Missing 'to' or 'body' in request" });
  }

  try {
    const message = await client.messages.create({
      to,
      body,
      messagingServiceSid: process.env.TWILIO_MSG_SERVICE_SID,
    });
    res.status(200).json({ success: true, sid: message.sid });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
