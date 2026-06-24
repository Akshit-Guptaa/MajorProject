const { GoogleGenerativeAI } = require("@google/generative-ai");
const Listing = require("../models/listing.js");
const { generateEmbedding, cosineSimilarity } = require("../utils/embedding.js");
module.exports.generateDescription = async (req, res) => {
  const { title, location, category, price } = req.body;
  
  const getFallback = () => {
    const styles = [
      `Welcome to this beautiful listing in ${location}! "${title}" offers the perfect blend of comfort and style. At just ₹${price} per night, it is an ideal spot for anyone looking to explore the area.`,
      `Experience ${location} like a local at "${title}". This ${category ? category.toLowerCase() : 'wonderful'} escape features great amenities and a relaxing vibe. Book now for ₹${price} per night!`,
      `Looking for a cozy getaway? "${title}" in ${location} is ready for you. Available for ₹${price}/night, it provides a perfect stay for your next vacation.`
    ];
    return styles[Math.floor(Math.random() * styles.length)];
  };

  // Check if API key is present
  const hasValidKey = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 0;

  if (!hasValidKey) {
    console.log("Gemini API key is missing or invalid format. Using fallback template.");
    return res.json({
      description: getFallback(),
      info: "Generated using a local template (Gemini API key is not configured or format is invalid)."
    });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `Write a highly engaging, catchy, and professional property description for a travel listing platform based on these details:
- Title: ${title}
- Location: ${location}
- Category: ${category || "General"}
- Price: ₹${price} per night

The description should be 2 to 3 sentences long, highlight the best features of the place/vibe, and encourage travelers to book. Do not include any quotes or markdown styling.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    res.json({ description: text });
  } catch (err) {
    console.error("AI Generation Error (falling back to local template):", err);
    res.json({ 
      description: getFallback(),
      info: "Generated using a local template (Gemini API key was invalid or unreachable)." 
    });
  }
};

module.exports.chatWithAssistant = async (req, res) => {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required" });

    try {
        const hasValidKey = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 0;
        if (!hasValidKey) {
            return res.json({ reply: "I'm sorry, my AI brain is currently disconnected (Missing API Key)." });
        }

        // 1. Generate Embedding for user message
        const messageEmbedding = await generateEmbedding(message);

        // 2. Retrieve context from database (RAG)
        const allListings = await Listing.find({});
        let contextListings = [];

        if (messageEmbedding && messageEmbedding.some(v => v !== 0)) {
            let scoredListings = allListings.map(listing => {
                let score = 0;
                if (listing.embedding && listing.embedding.length > 0) {
                    score = cosineSimilarity(messageEmbedding, listing.embedding);
                }
                return { listing, score };
            });

            // Filter for decent similarity and get top 3
            scoredListings = scoredListings.filter(item => item.score > 0.3);
            scoredListings.sort((a, b) => b.score - a.score);
            contextListings = scoredListings.slice(0, 3).map(item => item.listing);
        }

        // 3. Format context string
        let contextString = "";
        if (contextListings.length > 0) {
            contextString = "Here are some relevant property listings from our database that you should strongly recommend if appropriate:\n";
            contextListings.forEach(l => {
                contextString += `- **${l.title}** in ${l.location}. Price: ₹${l.price}/night. Description: ${l.description}\n`;
            });
        }

        // 4. Augment Prompt and Generate Response
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `You are a friendly, laid-back AI assistant for the travel website 'TravelBug'.
The user has said:
"${message}"

${contextString}

Instructions:
- Be very conversational, relaxed, and brief.
- If the user just says "Hi" or wants to chat casually, respond warmly like a friend without immediately forcing them to plan a trip. Let them guide the conversation.
- Answer their questions naturally.
- Only recommend specific travel plans or listings if the user explicitly asks about traveling, locations, or properties.
- IF you do recommend a listing, use the context listings provided above and naturally incorporate them. Mention their title and price.
- Use Markdown formatting to make your response easy to read.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().trim();

        res.json({ reply: text });

    } catch (err) {
        console.error("Chatbot Error:", err.message || err);
        
        // --- SMART OFFLINE BOT ---
        // Since the Google API is struggling, let's create a smart offline bot 
        // that actually talks to the user based on keywords!
        let msg = message.toLowerCase();
        let fallbackReply = "I'm your offline travel assistant right now! 🎒 I can still help you. Try asking me about 'Delhi', 'Goa', 'Beaches', or 'Mountains'!";

        if (msg.includes("delhi") || msg.includes("capital")) {
            fallbackReply = "Delhi is an amazing choice! 🏰 While my main AI brain is resting, I can definitely recommend checking out the historical monuments in Delhi. Would you like to see properties there?";
        } else if (msg.includes("goa") || msg.includes("beach")) {
            fallbackReply = "Looking for some sun and sand? 🏖️ Goa has some of the best beachfront villas on our platform! Check out our homepage for the latest beach listings.";
        } else if (msg.includes("mountain") || msg.includes("cabin") || msg.includes("trek")) {
            fallbackReply = "Nothing beats the peaceful mountains! ⛰️ We have some beautiful cozy cabins available. Make sure to pack warm clothes!";
        } else if (msg.includes("hi") || msg.includes("hello")) {
            fallbackReply = "Hello there! 👋 I am running in Offline Mode to ensure you can still talk to me. Where would you like to travel today?";
        } else if (msg.includes("price") || msg.includes("cheap") || msg.includes("cost")) {
            fallbackReply = "We have listings for all budgets! 💸 You can sort the listings on the main page to find the most affordable stays for your next trip.";
        }

        res.json({ reply: fallbackReply });
    }
};
