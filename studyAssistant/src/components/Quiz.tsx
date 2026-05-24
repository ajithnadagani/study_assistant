import { useState } from "react";
import { fetchQuiz } from "../api";
import type { MCQItem } from "../api";

const LABELS = ["A", "B", "C", "D", "E"];

export default function Quiz() {
  const [questions, setQuestions] = useState<MCQItem[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null); // stores the letter e.g. "A"
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generate() {
    setLoading(true);
    setError("");
    try {
      const qs = await fetchQuiz();
      setQuestions(qs);
      setCurrent(0);
      setSelected(null);
      setSubmitted(false);
      setScore(0);
      setDone(false);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function submit() {
    if (!selected) return;
    setSubmitted(true);
    // q.answer may be "A", "B", "C", "D" or the full option text — handle both
    const q = questions[current];
    const correctLabel = getCorrectLabel(q);
    if (selected === correctLabel) {
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

  function restart() {
    setQuestions([]);
    setDone(false);
  }

  /** Normalise the answer to a letter label regardless of what the LLM returned */
  function getCorrectLabel(q: MCQItem): string {
    const ans = q.answer.trim();
    // If it's already a single letter matching our labels, use it directly
    if (LABELS.includes(ans.toUpperCase())) return ans.toUpperCase();
    // Otherwise find which option text matches
    const idx = q.options.findIndex(
      (opt) => opt.trim().toLowerCase() === ans.toLowerCase(),
    );
    return idx >= 0 ? LABELS[idx] : ans;
  }

  const q = questions[current];
  const progress = questions.length
    ? ((current + 1) / questions.length) * 100
    : 0;
  const correctLabel = q ? getCorrectLabel(q) : "";

  return (
    <div className="tab-content">
      <h2>🧩 Interactive Quiz</h2>
      <button className="btn btn-primary" onClick={generate} disabled={loading}>
        {loading ? "Generating…" : "Generate Quiz"}
      </button>
      {error && <p className="error-msg">{error}</p>}

      {questions.length > 0 && !done && (
        <div className="quiz-card">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <p className="quiz-counter">
            Question {current + 1} of {questions.length}
          </p>

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
                  disabled={submitted}>
                  <span className="option-label">{label}</span>
                  <span className="option-text">{opt}</span>
                </button>
              );
            })}
          </div>

          {submitted && (
            <div
              className={`feedback ${selected === correctLabel ? "feedback-correct" : "feedback-wrong"}`}>
              <p>
                {selected === correctLabel
                  ? "✅ Correct!"
                  : `❌ Wrong! Correct answer: ${correctLabel}`}
              </p>
              <p className="explanation">💡 {q.explanation}</p>
            </div>
          )}

          <div className="quiz-actions">
            {!submitted && (
              <button
                className="btn btn-primary"
                onClick={submit}
                disabled={!selected}>
                Submit Answer
              </button>
            )}
            {submitted && (
              <button className="btn btn-primary" onClick={next}>
                {current + 1 >= questions.length
                  ? "See Results"
                  : "Next Question →"}
              </button>
            )}
          </div>
        </div>
      )}

      {done && (
        <div className="quiz-result">
          <h3>🎉 Quiz Completed!</h3>
          <p className="score-text">
            Your Score: <strong>{score}</strong> / {questions.length}
          </p>
          <div className="score-bar">
            <div
              className="score-fill"
              style={{ width: `${(score / questions.length) * 100}%` }}
            />
          </div>
          <button className="btn btn-primary" onClick={restart}>
            Restart Quiz
          </button>
        </div>
      )}
    </div>
  );
}
