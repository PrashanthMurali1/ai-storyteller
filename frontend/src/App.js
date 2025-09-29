import React, { useState } from "react";
import "./App.css";

function extractNumberedOptions(text) {
  // Find "1. ... 2. ... 3. ..." even across line breaks
  const re = /(?:^|\s)(\d+)\.\s+([\s\S]+?)(?=(?:\s\d+\.\s+)|$)/g;
  const out = [];
  let m;
  while ((m = re.exec(text)) !== null) {
    out.push(m[2].trim().replace(/\s+/g, " "));
  }
  return out;
}

function normalizeResult(data) {
  // Prefer structured fields if available
  let story = (data && (data.story || data.answer || "")) || "";
  let choices = Array.isArray(data?.choices) ? data.choices : [];

  // Strip leading STORY: if present
  const stripStoryLabel = (s) => s.replace(/^STORY:\s*/i, "").trim();

  if (!choices.length) {
    const upper = story.toUpperCase();
    const idx = upper.indexOf("CHOICES:");
    if (idx !== -1) {
      const before = story.slice(0, idx);
      const after = story.slice(idx + "CHOICES:".length);
      story = stripStoryLabel(before);
      choices = extractNumberedOptions(after);
    } else {
      // Fallback: try to find numbered options at the end
      const firstNumIdx = story.search(/(?:^|\n|\s)\d+\.\s+/);
      const found = extractNumberedOptions(story.slice(firstNumIdx >= 0 ? firstNumIdx : story.length));
      if (found.length >= 2) {
        choices = found;
        if (firstNumIdx >= 0) {
          story = stripStoryLabel(story.slice(0, firstNumIdx));
        } else {
          story = stripStoryLabel(story);
        }
      } else {
        story = stripStoryLabel(story);
      }
    }
  } else {
    story = stripStoryLabel(story);
  }

  return { story, choices };
}

function App() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [storyHistory, setStoryHistory] = useState([]);

  const handleSearch = async () => {
    if (!query) return;
    setLoading(true);

    try {
      const endpoint = `http://127.0.0.1:8000/story?query=${encodeURIComponent(
        query
      )}`;
      const res = await fetch(endpoint);
      const data = await res.json();

      const normalized = normalizeResult(data);
      setStoryHistory((prev) => [{ query, result: normalized }, ...prev]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setQuery("");
    }
  };

  return (
    <div className="container">
      <h1>Storyteller</h1>

      {/* Search */}
      <div className="search-box">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Begin or continue your story..."
        />
        <button onClick={handleSearch} disabled={loading} className="blue">
          {loading ? "Generating..." : "Continue"}
        </button>
      </div>

      {/* Story results */}
      {storyHistory.map((item, idx) => (
        <div className="result-box" key={idx}>
          <p className="you-line">
            <strong>You:</strong> {item.query}
          </p>

          <div className="story">{item.result.story}</div>

          {item.result.choices && item.result.choices.length > 0 && (
            <div className="choices">
              <strong>Choices:</strong>
              <ul>
                {item.result.choices.map((choice, i) => (
                  <li key={i}>{choice}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default App;
