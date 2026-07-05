const geminiModel = require("../Config/gemini.js");

const summarizeChat = async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || messages.length === 0) {
      return res.status(400).json({ error: "No messages provided" });
    }

    const prompt = `Summarize this conversation concisely:\n\n${messages.join("\n")}`;

    const result = await geminiModel.generateContent(prompt);
    const summary = result.response.text();

    res.status(200).json({ summary });
  } catch (error) {
    console.error("Gemini summarize error:", error.message);
    res.status(500).json({ error: "Failed to generate summary" });
  }
};

module.exports = { summarizeChat };