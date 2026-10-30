
const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();

app.use(cors());
app.use(express.json({ limit: "2mb" }));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.get("/", (req, res) => {
  res.send("AI Galaxy backend is running!");
});

// AI CHAT
app.post("/api/chat", async (req, res) => {
  try {
    const messages = req.body.messages;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Messages required" });
    }

    const safeMessages = messages.slice(-12).map(m => {
      if (!["user", "assistant"].includes(m.role)) {
        throw new Error("Invalid message role");
      }

      if (typeof m.content !== "string" || m.content.length > 4000) {
        throw new Error("Invalid message content");
      }

      return { role: m.role, content: m.content };
    });

    const response = await openai.responses.create({
      model: "gpt-5.5",
      instructions: "You are Nova, the friendly AI assistant inside AI Galaxy. Be helpful, clear and concise.",
      input: safeMessages
    });

    res.json({ reply: response.output_text });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "AI chat is temporarily unavailable." });
  }
});

// AI IMAGE GENERATOR
app.post("/api/image", async (req, res) => {
  try {
    const prompt = req.body.prompt;

    if (typeof prompt !== "string" || !prompt.trim() || prompt.length > 2000) {
      return res.status(400).json({ error: "Enter a valid image prompt." });
    }

    const result = await openai.images.generate({
      model: "gpt-image-2.5-flare",
      prompt: prompt.trim(),
      size: "1024x1024"
    });

    res.json({
      image: result.data[0].b64_json
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Image generation is temporarily unavailable." });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("AI Galaxy server running on port " + PORT);
});
        
