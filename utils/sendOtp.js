const axios = require("axios");

const sendOtp = async (phone, otp) => {
  const url = "https://www.fast2sms.com/dev/bulkV2";

  const response = await axios.post(url, {
    route: "otp",
    variables_values: otp,
    numbers: phone,
  }, {
    headers: {
      authorization: process.env.FAST2SMS_API_KEY,
      "Content-Type": "application/json",
    },
  });

  return response.data;
};

module.exports = sendOtp;
