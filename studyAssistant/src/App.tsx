import { useState } from "react";
import Upload from "./components/Upload";
import Summary from "./components/Summary";
import Quiz from "./components/Quiz";
import Flashcards from "./components/Flashcards";
import Revision from "./components/Revision";
import "./App.css";

const TABS = [
  { id: "summary", label: "🧠 Summary" },
  { id: "quiz", label: "🧩 Quiz" },
  { id: "flashcards", label: "🗂 Flashcards" },
  { id: "revision", label: "⚡ Revision" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function App() {
  const [docsLoaded, setDocsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("summary");

  return (
    <div className="app">
      <header className="app-header">
        <h1>📚 AI Study Assistant</h1>
        <p className="subtitle">
          Upload your notes and let AI do the heavy lifting
        </p>
      </header>

      <main className="app-main">
        <Upload onLoaded={setDocsLoaded} />

        {docsLoaded ? (
          <div className="tabs-container">
            <div className="tab-bar" role="tablist">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
                  onClick={() => setActiveTab(tab.id)}>
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="tab-panel">
              {activeTab === "summary" && <Summary />}
              {activeTab === "quiz" && <Quiz />}
              {activeTab === "flashcards" && <Flashcards />}
              {activeTab === "revision" && <Revision />}
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-icon">👆</span>
            <p>Upload and process your files to unlock all AI features</p>
          </div>
        )}
      </main>
    </div>
  );
}
