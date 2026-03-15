const { processMessage } = require("../service/chatbotService");
const { v4: uuidv4 } = require("uuid");

const chatbotReply = async (req, res) => {
  try {

    const { message, sessionId } = req.body || {};

    if (!message) {
      return res.status(400).json({
        answer: "⚠️ Message is required.",
      });
    }

    const activeSessionId = sessionId || uuidv4();

    const result = await processMessage(
      message,
      activeSessionId,
      req.user?._id || null
    );

    return res.status(200).json({
      sessionId: activeSessionId,
      ...result,
    });

  } catch (error) {

    console.log("Chatbot Error:", error.message);

    return res.status(500).json({
      answer: "⚠️ Smart Concierge temporarily unavailable.",
      recommendations: [],
    });

  }
};

module.exports = { chatbotReply };