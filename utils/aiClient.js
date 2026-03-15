const axios = require("axios");

const askGemini = async (conversationHistory) => {
  try {
    const res = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: conversationHistory,
        generationConfig: {
          temperature: 0.6,
          topK: 40,
          topP: 0.9,
          maxOutputTokens: 400,
        },
      }
    );

    return (
      res.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "🤖 No AI response."
    );
  } catch (error) {
    console.log(
      "Gemini API Error:",
      error.response?.data || error.message
    );
    return null;
  }
};

module.exports = { askGemini };