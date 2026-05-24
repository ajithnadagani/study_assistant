/**
 * Lightweight markdown renderer — no external dependencies.
 * Handles: headings (#/##/###), bold (**), bullet lists (- / *), horizontal rules (---), paragraphs.
 */

interface Props {
  readonly content: string;
}

export default function Markdown({ content }: Props) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let listBuffer: string[] = [];
  let key = 0;

  function flushList() {
    if (!listBuffer.length) return;
    elements.push(
      <ul key={key++} className="md-list">
        {listBuffer.map((item, i) => (
          <li key={i}>{renderInline(item)}</li>
        ))}
      </ul>,
    );
    listBuffer = [];
  }

  /** Render inline markdown: **bold**, *italic* */
  function renderInline(text: string): React.ReactNode {
    const parts: React.ReactNode[] = [];
    // split on **bold** or *italic*
    const regex = /(\*\*(.+?)\*\*|\*(.+?)\*)/g;
    let last = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > last) {
        parts.push(text.slice(last, match.index));
      }
      if (match[0].startsWith("**")) {
        parts.push(<strong key={match.index}>{match[2]}</strong>);
      } else {
        parts.push(<em key={match.index}>{match[3]}</em>);
      }
      last = match.index + match[0].length;
    }
    if (last < text.length) parts.push(text.slice(last));
    return parts.length === 1 ? parts[0] : parts;
  }

  for (const raw of lines) {
    const line = raw.trimEnd();

    // Heading 3
    if (line.startsWith("### ")) {
      flushList();
      elements.push(
        <h3 key={key++} className="md-h3">
          {renderInline(line.slice(4))}
        </h3>,
      );
      continue;
    }
    // Heading 2
    if (line.startsWith("## ")) {
      flushList();
      elements.push(
        <h2 key={key++} className="md-h2">
          {renderInline(line.slice(3))}
        </h2>,
      );
      continue;
    }
    // Heading 1
    if (line.startsWith("# ")) {
      flushList();
      elements.push(
        <h1 key={key++} className="md-h1">
          {renderInline(line.slice(2))}
        </h1>,
      );
      continue;
    }
    // Horizontal rule
    if (/^[-*_]{3,}$/.test(line.trim())) {
      flushList();
      elements.push(<hr key={key++} className="md-hr" />);
      continue;
    }
    // Bullet list item (- or *)
    if (/^[-*]\s+/.test(line)) {
      listBuffer.push(line.replace(/^[-*]\s+/, ""));
      continue;
    }
    // Empty line
    if (!line.trim()) {
      flushList();
      continue;
    }
    // Regular paragraph
    flushList();
    elements.push(
      <p key={key++} className="md-p">
        {renderInline(line)}
      </p>,
    );
  }

  flushList();

  return <div className="md-body">{elements}</div>;
}
