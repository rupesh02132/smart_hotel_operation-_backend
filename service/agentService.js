const { askGemini } = require("../utils/aiClient");
const { searchRoomsTool } = require("../utils/agentTools");
const { recommendRooms } = require("./recommendationService");

/* ================================
   HELPER: Extract JSON from AI
================================ */

const extractJSON = (text) => {
  try {

    // remove markdown ```json ``` if present
    const cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");

    if (start === -1 || end === -1) return null;

    return JSON.parse(cleaned.slice(start, end + 1));

  } catch {
    return null;
  }
};

/* ================================
   AGENT
================================ */

const runAgent = async (message, memory = []) => {

  const systemPrompt = `
You are SmartHotel AI Concierge.

You have tools:

search_rooms(city, maxPrice, guests, roomType)

If user asks for hotels return ONLY JSON:

{
 "tool":"search_rooms",
 "city":"Chennai",
 "maxPrice":3000,
 "guests":2,
 "roomType":"Deluxe"
}

If no tool is required respond normally in text.
`;

  const decision = await askGemini([
    ...memory,
    {
      role: "user",
      parts: [{ text: systemPrompt + "\nUser: " + message }]
    }
  ]);

  /* Extract JSON safely */

  const action = extractJSON(decision);

  /* If AI selected tool */

  if (action && action.tool === "search_rooms") {

    const rooms = await searchRoomsTool(action);

    const recommended = recommendRooms(rooms);

    if (!recommended.length) {
      return {
        answer: "Sorry, I couldn't find matching rooms."
      };
    }

    const roomList = recommended
      .map(
        (r, i) =>
          `${i + 1}. ${r.listing.title} (${r.listing.city})  
Room: ${r.roomType}  
Price: ₹${r.basePrice}/night`
      )
      .join("\n\n");

    return {
      answer: `Here are the best rooms I found:\n\n${roomList}`,
      rooms: recommended
    };
  }

  /* Otherwise return AI text */

  return {
    answer: decision || "I'm here to help you find hotels."
  };
};

module.exports = { runAgent };