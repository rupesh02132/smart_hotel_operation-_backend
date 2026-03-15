const axios = require("axios");

const sendSms = async (phone, message) => {
  try {
    const response = await axios.post(
      "https://www.fast2sms.com/dev/bulkV2",
      {
        route: "v3",
        sender_id: "TXTIND",
        message: message,
        language: "english",
        numbers: phone,
      },
      {
        headers: {
          authorization: process.env.FAST2SMS_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("SMS SEND ERROR:", error.response?.data || error.message);
    throw new Error("Failed to send SMS");
  }
};

module.exports = sendSms;
