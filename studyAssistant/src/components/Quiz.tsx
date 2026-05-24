import { useState, useEffect } from "react";
import { fetchQuiz } from "../api";
import type { MCQItem } from "../api";

const LABELS = ["A", "B", "C", "D", "E"];
const MAX_RETRIES = 2;

export default function Quiz() {
  const [questions, setQuestions] = useState<MCQItem[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Auto-generate on first mount
  useEffect(() => {
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function generate() {
    setLoading(true);
    setError("");
    let lastError = "";

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const qs = await fetchQuiz();
        setQuestions(qs);
        setCurrent(0);
        setSelected(null);
        setSubmitted(false);
        setScore(0);
        setDone(false);
        setLoading(false);
        return;
      } catch (e: any) {
        lastError = e.message;
        if (attempt < MAX_RETRIES) {
          await new Promise((r) => setTimeout(r, 1500));
        }
      }
    }

    setError(lastError);
    setLoading(false);
  }

  function submit() {
    if (!selected) return;
    setSubmitted(true);
    const q = questions[current];
    if (selected === getCorrectLabel(q)) {
      setScore((s) => s + 1);
    }
  }

  function next() {
    if (current + 1 >= questions.length) {
      setDone(true);
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
      setSubmitted(false);
    }
  }

  function getCorrectLabel(q: MCQItem): string {
    const ans = q.answer.trim();
    if (LABELS.includes(ans.toUpperCase())) return ans.toUpperCase();
    const idx = q.options.findIndex(
      (opt) => opt.trim().toLowerCase() === ans.toLowerCase(),
    );
    return idx >= 0 ? LABELS[idx] : ans;
  }

  // ── Loading state ──
  if (loading) {
    return (
      <div className="tab-content">
        <div className="auto-loading">
          <div className="spinner" aria-hidden="true" />
          <p>Generating quiz questions…</p>
        </div>
      </div>
    );
  }

  // ── Error state ──
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

  const q = questions[current];
  const correctLabel = q ? getCorrectLabel(q) : "";
  const progress = questions.length
    ? ((current + 1) / questions.length) * 100
    : 0;

  // ── Results screen ──
  if (done) {
    const pct = Math.round((score / questions.length) * 100);
    const medal =
      pct === 100 ? "🏆" : pct >= 80 ? "🥇" : pct >= 60 ? "🥈" : "🥉";

    return (
      <div className="tab-content">
        <div className="quiz-result">
          <div className="result-medal">{medal}</div>
          <h3>Quiz Complete</h3>
          <p className="score-text">
            You scored <strong>{score}</strong> out of{" "}
            <strong>{questions.length}</strong>
          </p>
          <div className="score-bar">
            <div
              className="score-fill"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="score-pct">{pct}%</p>

          <div className="result-actions">
            <button
              className="btn btn-outline"
              onClick={() => {
                setCurrent(0);
                setSelected(null);
                setSubmitted(false);
                setDone(false);
              }}
            >
              ↩ Review Same Quiz
            </button>
            <button className="btn btn-primary" onClick={generate}>
              ✦ Generate New Questions
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Active quiz ──
  return (
    <div className="tab-content">
      {questions.length > 0 && (
        <div className="quiz-card">
          {/* Header row: progress info + regenerate */}
          <div className="quiz-header">
            <div className="quiz-meta">
              <span className="quiz-counter">
                Question {current + 1} / {questions.length}
              </span>
              <span className="quiz-score-live">Score: {score}</span>
            </div>
            <button
              className="btn-ghost"
              onClick={generate}
              title="Generate new questions"
              aria-label="Generate new questions"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M21 2v6h-6" />
                <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
                <path d="M3 22v-6h6" />
                <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
              </svg>
              New Questions
            </button>
          </div>

          {/* Progress bar */}
          <div className="progress-bar" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>

          <h3 className="quiz-question">{q.question}</h3>

          <div className="options-grid">
            {q.options.map((opt, i) => {
              const label = LABELS[i] ?? String(i + 1);
              let cls = "option-btn";
              if (submitted) {
                if (label === correctLabel) cls += " correct";
                else if (label === selected) cls += " wrong";
              } else if (label === selected) {
                cls += " selected";
              }
              return (
                <button
                  key={label}
                  className={cls}
                  onClick={() => !submitted && setSelected(label)}
                  disabled={submitted}
                >
                  <span className="option-label">{label}</span>
                  <span className="option-text">{opt}</span>
                </button>
              );
            })}
          </div>

          {submitted && (
            <div
              className={`feedback ${
                selected === correctLabel ? "feedback-correct" : "feedback-wrong"
              }`}
            >
              <p>
                {selected === correctLabel
                  ? "✅ Correct!"
                  : `❌ Incorrect — correct answer: ${correctLabel}`}
              </p>
              <p className="explanation">💡 {q.explanation}</p>
            </div>
          )}

          <div className="quiz-actions">
            {!submitted ? (
              <button
                className="btn btn-primary"
                onClick={submit}
                disabled={!selected}
              >
                Submit Answer
              </button>
            ) : (
              <button className="btn btn-primary" onClick={next}>
                {current + 1 >= questions.length
                  ? "See Results →"
                  : "Next Question →"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
