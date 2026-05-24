import { useState } from "react";
import { fetchSummary } from "../api";
import Markdown from "./Markdown";

export default function Summary() {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generate() {
    setLoading(true);
    setError("");
    setSummary("");
    try {
      const text = await fetchSummary();
      setSummary(text);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="tab-content">
      <h2>🧠 Summary</h2>
      <button className="btn btn-primary" onClick={generate} disabled={loading}>
        {loading ? "Generating…" : "Generate Summary"}
      </button>
      {error && <p className="error-msg">{error}</p>}
      {summary && (
        <div className="summary-box">
          <Markdown content={summary} />
        </div>
      )}
    </div>
  );
}
