import MarkdownIt from "markdown-it"
import hljs from "highlight.js/lib/core"
import "highlight.js/styles/github-dark.css"
import javascript from "highlight.js/lib/languages/javascript"
import typescript from "highlight.js/lib/languages/typescript"
import python from "highlight.js/lib/languages/python"
import go from "highlight.js/lib/languages/go"
import rust from "highlight.js/lib/languages/rust"
import java from "highlight.js/lib/languages/java"
import cpp from "highlight.js/lib/languages/cpp"
import csharp from "highlight.js/lib/languages/csharp"
import bash from "highlight.js/lib/languages/bash"
import json from "highlight.js/lib/languages/json"
import yaml from "highlight.js/lib/languages/yaml"
import sql from "highlight.js/lib/languages/sql"
import css from "highlight.js/lib/languages/css"
import xml from "highlight.js/lib/languages/xml"

hljs.registerLanguage("javascript", javascript)
hljs.registerLanguage("typescript", typescript)
hljs.registerLanguage("python", python)
hljs.registerLanguage("go", go)
hljs.registerLanguage("rust", rust)
hljs.registerLanguage("java", java)
hljs.registerLanguage("cpp", cpp)
hljs.registerLanguage("csharp", csharp)
hljs.registerLanguage("bash", bash)
hljs.registerLanguage("json", json)
hljs.registerLanguage("yaml", yaml)
hljs.registerLanguage("sql", sql)
hljs.registerLanguage("css", css)
hljs.registerLanguage("xml", xml)

interface MarkdownRendererProps {
  content: string
  className?: string
}

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true,
})

md.set({
  highlight: (str: string, lang: string) => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value
      } catch {
        // ignore
      }
    }
    return ''
  },
})

const getReadingTime = (content: string) => {
  const chars = content.length
  const minutes = Math.max(1, Math.ceil(chars / 500))
  return minutes
}

const MarkdownRenderer = ({ content, className = "" }: MarkdownRendererProps) => {
  const htmlContent = md.render(content)
  const readingTime = getReadingTime(content)

  return (
    <div className={`markdown-body ${className}`}>
      <style>{`
        .markdown-body {
          line-height: 1.8;
          color: #374151;
        }
        .markdown-body h1 {
          font-size: 2em;
          font-weight: 700;
          margin-top: 1.5em;
          margin-bottom: 0.5em;
          padding-bottom: 0.3em;
          border-bottom: 2px solid #e5e7eb;
        }
        .markdown-body h2 {
          font-size: 1.5em;
          font-weight: 600;
          margin-top: 1.4em;
          margin-bottom: 0.5em;
          padding-bottom: 0.2em;
          border-bottom: 1px solid #f3f4f6;
        }
        .markdown-body h3 {
          font-size: 1.25em;
          font-weight: 600;
          margin-top: 1.3em;
          margin-bottom: 0.4em;
        }
        .markdown-body p {
          margin-bottom: 1em;
        }
        .markdown-body a {
          color: #2563eb;
          text-decoration: underline;
          transition: color 0.2s;
        }
        .markdown-body a:hover {
          color: #1d4ed8;
        }
        .markdown-body strong {
          font-weight: 700;
          color: #111827;
        }
        .markdown-body em {
          font-style: italic;
        }
        .markdown-body ul {
          list-style-type: disc;
          padding-left: 1.5em;
          margin-bottom: 1em;
        }
        .markdown-body ol {
          list-style-type: decimal;
          padding-left: 1.5em;
          margin-bottom: 1em;
        }
        .markdown-body li {
          margin-bottom: 0.25em;
        }
        .markdown-body blockquote {
          border-left: 4px solid #e5e7eb;
          padding-left: 1em;
          margin-left: 0;
          margin-right: 0;
          margin-bottom: 1em;
          color: #6b7280;
          background-color: #f9fafb;
          padding: 0.75em 1em;
          border-radius: 0.375rem;
        }
        .markdown-body pre {
          background-color: #1f2937;
          color: #e5e7eb;
          padding: 1em;
          margin: 1em 0;
          overflow-x: auto;
          border-radius: 0.5rem;
          font-size: 0.875em;
          line-height: 1.6;
        }
        .markdown-body pre code {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          background: none;
          color: inherit;
          padding: 0;
          border-radius: 0;
          font-size: inherit;
        }
        .markdown-body code {
          background-color: #f3f4f6;
          color: #ef4444;
          padding: 0.2em 0.4em;
          border-radius: 0.25em;
          font-size: 0.875em;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        }
        .markdown-body pre code {
          background: none;
          color: inherit;
          padding: 0;
          border-radius: 0;
        }
        .markdown-body img {
          max-width: 100%;
          height: auto;
          margin: 1.5em 0;
          border-radius: 0.5rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .markdown-body hr {
          border: none;
          border-top: 2px solid #e5e7eb;
          margin: 2em 0;
        }
        .markdown-body table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 1em;
        }
        .markdown-body table th,
        .markdown-body table td {
          border: 1px solid #e5e7eb;
          padding: 0.5em 0.75em;
          text-align: left;
        }
        .markdown-body table th {
          background-color: #f9fafb;
          font-weight: 600;
        }
        .markdown-body table tr:nth-child(even) {
          background-color: #f9fafb;
        }
      `}</style>
      <div className="reading-time-info text-sm text-gray-500 mb-4 pb-4 border-b border-gray-200">
        预计阅读时间：{readingTime} 分钟
      </div>
      <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
    </div>
  )
}

export default MarkdownRenderer