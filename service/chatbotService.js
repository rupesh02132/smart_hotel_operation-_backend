const ChatSession = require("../models/ChatSession");
const { runAgent } = require("./agentService");

const processMessage = async (message, sessionId, userId = null) => {

  let session = await ChatSession.findOne({ sessionId });

  if (!session) {
    session = await ChatSession.create({
      sessionId,
      userId,
      messages: []
    });
  }

  /* Save user message */
  session.messages.push({
    role: "user",
    content: message
  });

  /* Build conversation memory */
  const memory = session.messages.slice(-6).map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }]
  }));

  /* Run AI agent */
  const result = await runAgent(message, memory);

  /* Save AI response */
  session.messages.push({
    role: "assistant",
    content: result.answer
  });

  await session.save();

  return {
    answer: result.answer,
    recommendations:
      result.rooms?.map((r) => ({
        roomId: r._id,
        hotelId: r.listing._id,
        hotelName: r.listing.title,
        city: r.listing.city,
        roomType: r.roomType,
        price: r.basePrice,
        guests: r.guests,
        image: r.images?.[0] || null
      })) || []
  };
};

module.exports = { processMessage };