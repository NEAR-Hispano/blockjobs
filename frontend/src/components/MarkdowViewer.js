import React, { useEffect } from "react";

import SyntaxHighlighter from "react-syntax-highlighter/dist/esm/prism";
import { base16AteliersulphurpoolLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

import ReactMarkdown from "react-markdown";

export default function MarkdownViewer({ text }) {
  return (
    <ReactMarkdown
      className="prose"
      children={text}
      remarkPlugins={[remarkGfm, remarkBreaks]}
      components={{
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || "");
          return !inline && match ? (
            <SyntaxHighlighter
              children={String(children).replace(/\n$/, "")}
              style={base16AteliersulphurpoolLight}
              language={match[1]}
              PreTag="div"
              {...props}
            />
          ) : (
            <code className={"!" + className} {...props}>
              {children}
            </code>
          );
        },
      }}
    />
  );
}
