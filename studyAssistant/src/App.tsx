import { useRef, useState } from "react";
import Upload from "./components/Upload";
import Summary from "./components/Summary";
import Quiz from "./components/Quiz";
import Flashcards from "./components/Flashcards";
import Revision from "./components/Revision";
import "./App.css";

const TABS = [
  {
    id: "summary",
    label: "Summary",
    icon: "🧠",
    desc: "AI-generated overview",
  },
  {
    id: "quiz",
    label: "Quiz",
    icon: "🧩",
    desc: "Test your knowledge",
  },
  {
    id: "flashcards",
    label: "Flashcards",
    icon: "🗂",
    desc: "Flip & memorise",
  },
  {
    id: "revision",
    label: "Revision",
    icon: "⚡",
    desc: "Structured notes",
  },
] as const;

type TabId = (typeof TABS)[number]["id"];

const FEATURES = [
  { icon: "📄", label: "PDF & DOCX upload" },
  { icon: "🧠", label: "AI-powered summaries" },
  { icon: "🧩", label: "Auto-generated quizzes" },
  { icon: "🗂", label: "Smart flashcards" },
  { icon: "⚡", label: "Structured revision notes" },
  { icon: "🔍", label: "RAG-based retrieval" },
];

export default function App() {
  const [docsLoaded, setDocsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("summary");
  const featuresRef = useRef<HTMLElement>(null);

  function handleLoaded(loaded: boolean) {
    setDocsLoaded(loaded);
    if (loaded) {
      // Give React a tick to render the section before scrolling
      setTimeout(() => {
        featuresRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
    }
  }

  return (
    <div className="app">
      {/* ── HERO SECTION ── */}
      <section className="hero">
        {/* Left — branding */}
        <div className="hero-left">
          <div className="hero-logo-wrap">
            <img
              src="/final_logo.svg"
              alt="WisdomX AI logo"
              className="hero-logo"
            />
          </div>
          <div className="hero-text">
            <h1 className="hero-title">WisdomX AI</h1>
            <p className="hero-tagline">Study smarter, not harder.</p>
            <p className="hero-desc">
              Upload your notes or textbooks and let AI instantly transform them
              into summaries, quizzes, flashcards, and revision guides — powered
              by LLaMA&nbsp;3 and RAG.
            </p>
            <ul className="feature-list" aria-label="Features">
              {FEATURES.map((f) => (
                <li key={f.label} className="feature-item">
                  <span className="feature-icon" aria-hidden="true">
                    {f.icon}
                  </span>
                  {f.label}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right — upload */}
        <div className="hero-right">
          <div className="upload-card">
            <h2 className="upload-card-title">Get started</h2>
            <p className="upload-card-sub">
              Upload a PDF or DOCX file to unlock all AI features.
            </p>
            <Upload onLoaded={handleLoaded} />
          </div>
        </div>
      </section>

      {/* ── FEATURE SECTION (shown after docs are loaded) ── */}
      {docsLoaded && (
        <main className="app-main" ref={featuresRef}>
          {/* Mode selector cards */}
          <div className="mode-grid" role="tablist" aria-label="Study modes">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                className={`mode-card ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="mode-icon" aria-hidden="true">{tab.icon}</span>
                <span className="mode-label">{tab.label}</span>
                <span className="mode-desc">{tab.desc}</span>
                {activeTab === tab.id && <span className="mode-active-dot" aria-hidden="true" />}
              </button>
            ))}
          </div>

          {/* Panel */}
          <div className="tab-panel" role="tabpanel">
            {activeTab === "summary" && <Summary />}
            {activeTab === "quiz" && <Quiz />}
            {activeTab === "flashcards" && <Flashcards />}
            {activeTab === "revision" && <Revision />}
          </div>
        </main>
      )}
    </div>
  );
}
