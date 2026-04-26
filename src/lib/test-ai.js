/* eslint-disable @typescript-eslint/no-require-imports */
const OpenAI = require("openai");
require("dotenv").config({ path: ".env.local" });

const apiKey = process.env.OPENROUTER_API_KEY || "";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: apiKey,
});

async function testConnection() {
  console.log("Testing OpenRouter connection...");
  try {
    const completion = await openai.chat.completions.create({
      model: "openai/gpt-oss-120b:free",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Hello! Are you working?" }
      ],
    });

    console.log("Response:", completion.choices[0].message.content);
    console.log("Connection successful!");
  } catch (error) {
    console.error("Error testing connection:", error.message);
  }
}

testConnection();
