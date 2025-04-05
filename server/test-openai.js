const axios = require("axios");
require("dotenv").config();

(async () => {
  try {
    const res = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: "Say hello in 2 sentences." }],
        max_tokens: 50
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );
    console.log("Response:", res.data.choices[0].message.content);
  } catch (err) {
    console.error("Error:", err.response?.data || err.message);
  }
})();