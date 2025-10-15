export const sendSMS = async (to, body) => {
    try {
      const response = await fetch("http://localhost:5000/send-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, body }),
      });
      return await response.json();
    } catch (err) {
      console.error("Error sending SMS:", err);
    }
  };
  