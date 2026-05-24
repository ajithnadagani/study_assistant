import { useRef, useState } from "react";
import { uploadFiles, resetDB } from "../api";

interface Props {
  readonly onLoaded: (loaded: boolean) => void;
}

export default function Upload({ onLoaded }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);

  function handleFiles(incoming: FileList | null) {
    if (!incoming) return;
    const arr = Array.from(incoming).filter((f) =>
      [".pdf", ".docx"].some((ext) => f.name.toLowerCase().endsWith(ext)),
    );
    setFiles((prev) => {
      const names = new Set(prev.map((f) => f.name));
      return [...prev, ...arr.filter((f) => !names.has(f.name))];
    });
  }

  async function handleProcess() {
    if (!files.length) {
      setStatus("Please select files first.");
      return;
    }
    setLoading(true);
    setStatus("");
    try {
      const res = await uploadFiles(files);
      setStatus(res.message);
      onLoaded(res.docs_loaded);
    } catch (e: any) {
      setStatus(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleReset() {
    setLoading(true);
    try {
      await resetDB();
      setFiles([]);
      setStatus("Vector database reset.");
      onLoaded(false);
      // Clear the file input so the same file can be re-selected after reset
      if (inputRef.current) inputRef.current.value = "";
    } catch {
      setStatus("Reset failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="upload-section">
      <div
        className={`drop-zone ${dragging ? "dragging" : ""}`}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        role="button"
        tabIndex={0}
        aria-label="Upload files. Click or drag and drop PDF or DOCX files here.">
        <span className="drop-icon">📂</span>
        <p>Drag & drop PDF / DOCX files here, or click to browse</p>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx"
          multiple
          hidden
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {files.length > 0 && (
        <ul className="file-list">
          {files.map((f) => (
            <li key={f.name}>
              <span>📄 {f.name}</span>
              <button
                className="remove-btn"
                onClick={() =>
                  setFiles((prev) => prev.filter((x) => x.name !== f.name))
                }>
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="upload-actions">
        <button
          className="btn btn-primary"
          onClick={handleProcess}
          disabled={loading}>
          {loading ? "Processing…" : "🚀 Process Files"}
        </button>
        <button
          className="btn btn-danger"
          onClick={handleReset}
          disabled={loading}>
          🗑 Reset DB
        </button>
      </div>

      {status && <p className="status-msg">{status}</p>}
    </div>
  );
}
