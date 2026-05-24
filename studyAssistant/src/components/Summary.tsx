import { useState, useEffect } from "react";
import { fetchSummary } from "../api";
import Markdown from "./Markdown";

export default function Summary() {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  if (loading) {
    return (
      <div className="tab-content">
        <div className="auto-loading">
          <div className="spinner" aria-hidden="true" />
          <p>Generating summary…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tab-content">
        <div className="auto-error">
          <p className="error-msg">{error}</p>
          <button className="btn btn-primary" onClick={generate}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="tab-content">
      {summary && (
        <div className="summary-box">
          <Markdown content={summary} />
        </div>
      )}
    </div>
  );
}
