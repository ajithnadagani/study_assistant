import { useState } from "react";
import { fetchFlashcards } from "../api";
import type { FlashcardItem } from "../api";

interface FlipCardProps {
  readonly card: FlashcardItem;
  readonly index: number;
}

function FlipCard({ card, index }: FlipCardProps) {
  const [flipped, setFlipped] = useState(false);

  return (
    <button
      className={`flip-card ${flipped ? "flipped" : ""}`}
      onClick={() => setFlipped((f) => !f)}
      aria-label={`Flashcard ${index + 1}. ${flipped ? "Answer: " + card.answer : "Question: " + card.question}. Click to flip.`}
      aria-pressed={flipped}>
      <div className="flip-card-inner">
        <div className="flip-card-front">
          <span className="card-label">Question</span>
          <p>{card.question}</p>
          <span className="card-hint">Click to flip</span>
        </div>
        <div className="flip-card-back">
          <span className="card-label">Answer</span>
          <p>{card.answer}</p>
          <span className="card-hint">Click to flip back</span>
        </div>
      </div>
    </button>
  );
}

export default function Flashcards() {
  const [cards, setCards] = useState<FlashcardItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generate() {
    setLoading(true);
    setError("");
    setCards([]);
    try {
      const data = await fetchFlashcards();
      setCards(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="tab-content">
      <h2>🗂 Flashcards</h2>
      <button className="btn btn-primary" onClick={generate} disabled={loading}>
        {loading ? "Generating…" : "Generate Flashcards"}
      </button>
      {error && <p className="error-msg">{error}</p>}
      {cards.length > 0 && (
        <>
          <p className="cards-hint">
            {cards.length} cards — click any card to reveal the answer
          </p>
          <div className="cards-grid">
            {cards.map((card, i) => (
              <FlipCard key={`${card.question}-${i}`} card={card} index={i} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
