const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");
const fs = require("fs");
const axios = require("axios");
require("dotenv").config();

console.log("Loaded API key (shortened):", process.env.OPENAI_API_KEY?.slice(0, 5));

const app = express();
app.use(cors());
app.use(express.json());

// Helper to call OpenAI API for feedback
const generateFeedback = async (prompt) => {
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 60,
        temperature: 0.7,
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data.choices[0].message.content.trim();
  } catch (err) {
    console.error("OpenAI API Error:", err.response?.data || err.message);
    return "Could not generate AI feedback.";
  }
};

// MAIN EXECUTION ROUTE
app.post("/execute", async (req, res) => {
  const { code, tests, functionName } = req.body;  // <-- Now receiving functionName
  const fileName = "solution.py";

  let feedback = "";

  // Build code file dynamically
  const codeWithTests = code + "\n\n" + tests.map((t, i) =>
    `print("TEST_CASE_${i}", ${functionName}(${t.input}) == ${t.expected})`
  ).join("\n");

  fs.writeFileSync(fileName, codeWithTests);

  exec(`python3 ${fileName}`, async (error, stdout, stderr) => {
    if (error || stderr) {
      const prompt = `
The following Python code produced an error. Help the user fix it by explaining the problem and suggesting what to try instead. Keep it under two sentences.

User Code:
${code}

Error:
${stderr || error.message}
`;
      feedback = await generateFeedback(prompt);
      return res.json({ output: "❌ Code execution failed.\n\n💡 Feedback: " + feedback });
    }

    const lines = stdout.trim().split("\n");
    const results = lines.map(line => {
      const parts = line.split(" ");
      const passed = parts[1] === "True";
      return passed;
    });

    const failedIndex = results.indexOf(false);
    if (failedIndex !== -1) {
      const test = tests[failedIndex];
      const prompt = `
The following Python function failed a test case. In two short sentences, explain what likely went wrong and what the user could try instead.

Function:
${code}

Test case:
Input: ${test.input}
Expected Output: ${test.expected}
Actual Output: False
`;
      feedback = await generateFeedback(prompt);
    }

    const passSummary = results.every(r => r) ? "✅ All test cases passed!" : "❌ Some test cases failed.";
    res.json({ output: passSummary + (feedback ? "\n\n💡 Feedback: " + feedback : "") });
  });
});

// Simple reroute /run -> /execute
app.post("/run", async (req, res) => {
  req.url = "/execute";
  app._router.handle(req, res);
});

app.listen(5002, () => console.log("Server running on port 5002"));
