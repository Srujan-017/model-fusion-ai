import React, { useMemo, useState } from "react";

const renderInline = (value) => {
  const parts = value.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g).filter(Boolean);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }

    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }

    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={index}>{part.slice(1, -1)}</code>;
    }

    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
};

const CodeBlock = ({ code, language, index }) => {
  const [copied, setCopied] = useState(false);
  const cleanCode = code.replace(/\n+$/, "");
  const lines = cleanCode.split("\n");

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(cleanCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="code-showcase" style={{ "--block-index": index }}>
      <div className="code-showcase-header">
        <div className="code-language">{language || "code"}</div>
        <button type="button" onClick={copyCode}>
          {copied ? "Copied" : "Copy code"}
        </button>
      </div>
      <pre className="code-frame" aria-label={`${language || "Code"} block`}>
        {lines.map((line, lineIndex) => (
          <span className="code-line" key={lineIndex}>
            <span className="code-number">{lineIndex + 1}</span>
            <code>{line || " "}</code>
          </span>
        ))}
      </pre>
    </div>
  );
};

const buildBlocks = (text = "") => {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const blocks = [];
  let paragraph = [];
  let list = null;
  let code = null;

  const flushParagraph = () => {
    if (!paragraph.length) return;
    blocks.push({ type: "paragraph", text: paragraph.join(" ") });
    paragraph = [];
  };

  const flushList = () => {
    if (!list) return;
    blocks.push(list);
    list = null;
  };

  const flushCode = () => {
    if (!code) return;
    blocks.push({ ...code, code: code.lines.join("\n") });
    code = null;
  };

  lines.forEach(rawLine => {
    const trimmed = rawLine.trim();

    if (code) {
      if (trimmed.startsWith("```")) {
        flushCode();
        return;
      }

      code.lines.push(rawLine);
      return;
    }

    const fenceMatch = trimmed.match(/^```([A-Za-z0-9#+._-]*)\s*$/);
    if (fenceMatch) {
      flushParagraph();
      flushList();
      code = { type: "code", language: fenceMatch[1] || "code", lines: [] };
      return;
    }

    if (!trimmed) {
      flushParagraph();
      flushList();
      return;
    }

    const headingMatch = trimmed.match(/^(#{1,3})\s+(.+)$/);
    const boldHeadingMatch = trimmed.match(/^\*\*(.+?)\*\*:?$/);
    const numberedMatch = trimmed.match(/^(\d+)\.\s+(.+)$/);
    const bulletMatch = trimmed.match(/^[-*]\s+(.+)$/);
    const quoteMatch = trimmed.match(/^>\s+(.+)$/);

    if (headingMatch || boldHeadingMatch) {
      flushParagraph();
      flushList();
      blocks.push({
        type: "heading",
        level: headingMatch ? headingMatch[1].length : 3,
        text: headingMatch?.[2] || boldHeadingMatch[1],
      });
      return;
    }

    if (quoteMatch) {
      flushParagraph();
      flushList();
      blocks.push({ type: "quote", text: quoteMatch[1] });
      return;
    }

    if (numberedMatch || bulletMatch) {
      flushParagraph();
      const nextType = numberedMatch ? "ordered-list" : "unordered-list";
      const item = numberedMatch?.[2] || bulletMatch[1];

      if (!list || list.type !== nextType) {
        flushList();
        list = { type: nextType, items: [] };
      }

      list.items.push(item);
      return;
    }

    flushList();
    paragraph.push(trimmed);
  });

  flushParagraph();
  flushList();
  flushCode();

  return blocks.length ? blocks : [{ type: "paragraph", text }];
};

const AssistantContent = ({ text }) => {
  const blocks = useMemo(() => buildBlocks(text), [text]);

  return (
    <div className="response-content">
      {blocks.map((block, index) => {
        const style = { "--block-index": index };

        if (block.type === "code") {
          return <CodeBlock key={index} code={block.code} language={block.language} index={index} />;
        }

        if (block.type === "heading") {
          return (
            <h3 key={index} className={`response-heading level-${block.level}`} style={style}>
              {renderInline(block.text)}
            </h3>
          );
        }

        if (block.type === "quote") {
          return (
            <blockquote key={index} className="response-quote" style={style}>
              {renderInline(block.text)}
            </blockquote>
          );
        }

        if (block.type === "ordered-list") {
          return (
            <ol key={index} className="response-list ordered" style={style}>
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>{renderInline(item)}</li>
              ))}
            </ol>
          );
        }

        if (block.type === "unordered-list") {
          return (
            <ul key={index} className="response-list" style={style}>
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>{renderInline(item)}</li>
              ))}
            </ul>
          );
        }

        return (
          <p key={index} className="response-paragraph" style={style}>
            {renderInline(block.text)}
          </p>
        );
      })}
    </div>
  );
};

export default function Message({ role, text, image, streaming = false }) {
  const [copied, setCopied] = useState(false);
  const isUser = role === "user";
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 180));

  const copyResponse = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };

  if (isUser) {
    return (
      <div className="message-row is-user">
        <div className="message-wrap">
          <div className="message-meta">
            <span className="message-avatar">Y</span>
            <span>You</span>
          </div>
          <div className="message-bubble">
            {image?.src && (
              <figure className="message-image-card">
                <img src={image.src} alt={image.name || "Uploaded image"} />
                <figcaption>{image.name || "Uploaded image"}</figcaption>
              </figure>
            )}
            {text && <div className="message-text">{text}</div>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="message-row is-assistant">
      <article className="response-card">
        <header className="response-header">
          <div className="response-identity">
            <span className="response-logo">MF</span>
            <div>
              <div className="response-name">ModelFusion</div>
              <div className="response-subtitle">AI response</div>
            </div>
          </div>

          <div className="response-tools">
            <span>{streaming ? "writing..." : `${wordCount} words`}</span>
            <span>{streaming ? "live" : `${readTime} min read`}</span>
            <button type="button" onClick={copyResponse}>
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </header>

        <AssistantContent text={text} />
        {streaming && <div className="stream-cursor" />}
      </article>
    </div>
  );
}
