// utils/openaiClient.js
require("dotenv").config();
const { OpenAI } = require("openai");

// ✅ Initialize OpenAI with latest API key
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

/**
 * 🔍 Generate full GPT-4o response with complete capabilities
 * @param {string} prompt - User's question (any topic)
 * @returns {Promise<string>} - GPT-4o response
 */
async function getGptReply(prompt) {
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: "You are GPT-4o (Omni) - OpenAI's most advanced multimodal AI with 128,000 token context window. You process text, vision, and audio with superior intelligence and speed. Provide comprehensive responses across all knowledge domains.",
                },
                {
                    role: "user",
                    content: prompt,
                },
            ],
            temperature: 0.7,
            max_tokens: 16384, // Increased for longer responses (GPT-4o supports up to 128K context)
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
        });

        return completion.choices[0].message.content.trim();
    } catch (error) {
        console.error("❌ GPT API ERROR:", error.message);
        throw new Error("GPT API connection issue: " + error.message);
    }
}

module.exports = {
    getGptReply,
};
