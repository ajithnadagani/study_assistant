import { useState, useEffect } from "react";
import { fetchRevision } from "../api";
import type { RevisionNotes } from "../api";

export default function Revision() {
  const [notes, setNotes] = useState<RevisionNotes | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function generate() {
    setLoading(true);
    setError("");
    setNotes(null);
    try {
      const data = await fetchRevision();
      setNotes(data);
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
          <p>Generating revision notes…</p>
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
      {notes && (
        <div className="revision-box">
          <h3 className="revision-title">{notes.title}</h3>
          <Section title="📌 Key Concepts" items={notes.key_concepts} color="blue" />
          <Section title="📖 Definitions" items={notes.definitions} color="purple" />
          <Section title="🔢 Formulas" items={notes.formulas} color="green" />
          <Section title="🎯 Exam Points" items={notes.exam_points} color="orange" />
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  items,
  color,
}: {
  title: string;
  items: string[];
  color: string;
}) {
  if (!items.length) return null;
  return (
    <div className={`revision-section revision-${color}`}>
      <h4>{title}</h4>
      <ul>
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
