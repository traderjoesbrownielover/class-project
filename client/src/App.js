import React, { useState } from "react";
import Editor from "@monaco-editor/react";

function App() {
  const [language, setLanguage] = useState("python");
  const [userCode, setUserCode] = useState(`# Write your function here\ndef isPalindrome(s):\n    import re\n    filtered = re.sub(r'[^a-zA-Z0-9]', '', s).lower()\n    return filtered == filtered[::-1]`);
  const [output, setOutput] = useState("");
  const [showHint, setShowHint] = useState(false);

  const testCases = [
    { input: "A man, a plan, a canal: Panama", expected: "True" },
    { input: "race a car", expected: "False" },
    { input: " ", expected: "True" }
  ];

  const runCode = async () => {
    try {
      const response = await fetch("https://class-project-fwoz.onrender.com/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, code: userCode, tests: testCases }),
      });
      const result = await response.json();
      setOutput(result.output);
    } catch (error) {
      setOutput("Error: Unable to connect to the execution server.");
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial", maxWidth: "800px", margin: "auto" }}>
      <h1>Valid Palindrome</h1>
      <p>
        Write a function that returns True if a string is a palindrome, ignoring non-alphanumeric characters and case.
      </p>

      {/* Hint Box */}
      <div
        onClick={() => setShowHint(!showHint)}
        style={{
          marginTop: "20px",
          backgroundColor: "#eef",
          padding: "10px 15px",
          borderRadius: "8px",
          cursor: "pointer",
          userSelect: "none",
          boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
          transition: "all 0.3s ease"
        }}
      >
        <strong>💡 Hint</strong>
        {showHint && (
          <div style={{ marginTop: "10px", color: "#333" }}>
            Try filtering the string to only alphanumeric characters, convert it to lowercase, then compare it with its reverse.
          </div>
        )}
      </div>

      <h2 style={{ marginTop: "30px" }}>Editor</h2>
      <Editor
        height="300px"
        language={language}
        value={userCode}
        onChange={(newValue) => setUserCode(newValue)}
      />

      <button onClick={runCode} style={{ marginTop: "10px", padding: "10px" }}>Run Code</button>

      {output && (
        <div style={{
          marginTop: "20px",
          backgroundColor: "#f4f4f4",
          padding: "15px",
          borderRadius: "8px",
          maxHeight: "300px",
          overflowY: "auto",
          whiteSpace: "pre-wrap",
          wordWrap: "break-word"
        }}>
          <h3 style={{ marginBottom: "10px" }}>Output and AI Feedback:</h3>
          <pre style={{ margin: 0 }}>{output}</pre>
        </div>
      )}
    </div>
  );
}

export default App;
