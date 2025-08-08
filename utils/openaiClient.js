// utils/openaiClient.js
require("dotenv").config();
const { OpenAI } = require("openai");

// 🔑 Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

/**
 * 🧠 Generate GPT-5 strategic response
 * @param {string} prompt - Strategic user input
 * @returns {Promise<string>} - GPT-5 system output
 */
async function getGptReply(prompt) {
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-5", // ✅ Replace with "gpt-5" once officially supported
            messages: [
                {
                    role: "system",
                    content: "You are GPT-5 — an elite sovereign capital strategist trained for Vault-level decision-making, simulation, and financial warfare.",
                },
                {
                    role: "user",
                    content: prompt,
                },
            ],
            temperature: 0.5,
            max_tokens: 32000, // Adjust based on GPT-5’s real token support
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
        });

        return completion.choices[0].message.content.trim();
    } catch (error) {
        console.error("❌ GPT-5 ERROR:", error.message);
        throw new Error("GPT-5 response failed: " + error.message);
    }
}

module.exports = {
    getGptReply,
};
