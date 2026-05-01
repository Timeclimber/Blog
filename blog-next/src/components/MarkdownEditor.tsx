import { useState, useRef, useCallback } from "react"
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

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  onImageUpload?: (file: File) => Promise<string>
  placeholder?: string
  minHeight?: string
}

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
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

const MarkdownEditor = ({ value, onChange, onImageUpload, placeholder, minHeight = "300px" }: MarkdownEditorProps) => {
  const [isPreview, setIsPreview] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const insertText = useCallback((before: string, after: string = "", placeholder: string = "") => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    const textToInsert = selectedText || placeholder

    const newValue = value.substring(0, start) + before + textToInsert + after + value.substring(end)
    onChange(newValue)

    setTimeout(() => {
      textarea.focus()
      const newCursorPos = start + before.length + textToInsert.length
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }, [value, onChange])

  const handleToolbarAction = (action: string) => {
    switch (action) {
      case "bold":
        insertText("**", "**", "粗体文本")
        break
      case "italic":
        insertText("*", "*", "斜体文本")
        break
      case "heading1":
        insertText("# ", "", "标题")
        break
      case "heading2":
        insertText("## ", "", "标题")
        break
      case "heading3":
        insertText("### ", "", "标题")
        break
      case "quote":
        insertText("> ", "", "引用")
        break
      case "code":
        insertText("`", "`", "代码")
        break
      case "codeblock":
        insertText("\n```javascript\n", "\n```\n", "// 代码块")
        break
      case "link":
        insertText("[", "](https://)", "链接文本")
        break
      case "image":
        insertText("![", "](https://)", "图片描述")
        break
      case "ul":
        insertText("- ", "", "列表项")
        break
      case "ol":
        insertText("1. ", "", "列表项")
        break
      case "hr":
        insertText("\n---\n", "", "")
        break
    }
  }

  const handleImageUpload = async (file: File) => {
    if (!onImageUpload) return
    try {
      const url = await onImageUpload(file)
      insertText("![", `](${url})`, file.name)
    } catch {
      // upload failed
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    for (const file of Array.from(files)) {
      if (file.type.startsWith("image/")) {
        await handleImageUpload(file)
      }
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    if (!onImageUpload) return

    const files = e.dataTransfer.files
    for (const file of Array.from(files)) {
      if (file.type.startsWith("image/")) {
        await handleImageUpload(file)
      }
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const toolbarButtons = [
    { action: "heading1", icon: "H1", title: "一级标题" },
    { action: "heading2", icon: "H2", title: "二级标题" },
    { action: "heading3", icon: "H3", title: "三级标题" },
    { action: "bold", icon: "B", title: "粗体", className: "font-bold" },
    { action: "italic", icon: "I", title: "斜体", className: "italic" },
    { action: "quote", icon: "❝", title: "引用" },
    { action: "code", icon: "<>", title: "行内代码" },
    { action: "codeblock", icon: "```", title: "代码块" },
    { action: "link", icon: "🔗", title: "链接" },
    { action: "image", icon: "🖼️", title: "图片" },
    { action: "ul", icon: "•", title: "无序列表" },
    { action: "ol", icon: "1.", title: "有序列表" },
    { action: "hr", icon: "---", title: "分割线" },
  ]

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      <style>{`
        .markdown-preview {
          line-height: 1.8;
          color: #374151;
        }
        .markdown-preview h1 {
          font-size: 2em;
          font-weight: 700;
          margin-top: 1.5em;
          margin-bottom: 0.5em;
          padding-bottom: 0.3em;
          border-bottom: 2px solid #e5e7eb;
        }
        .markdown-preview h2 {
          font-size: 1.5em;
          font-weight: 600;
          margin-top: 1.4em;
          margin-bottom: 0.5em;
          padding-bottom: 0.2em;
          border-bottom: 1px solid #f3f4f6;
        }
        .markdown-preview h3 {
          font-size: 1.25em;
          font-weight: 600;
          margin-top: 1.3em;
          margin-bottom: 0.4em;
        }
        .markdown-preview p {
          margin-bottom: 1em;
        }
        .markdown-preview a {
          color: #2563eb;
          text-decoration: underline;
        }
        .markdown-preview strong {
          font-weight: 700;
          color: #111827;
        }
        .markdown-preview em {
          font-style: italic;
        }
        .markdown-preview ul {
          list-style-type: disc;
          padding-left: 1.5em;
          margin-bottom: 1em;
        }
        .markdown-preview ol {
          list-style-type: decimal;
          padding-left: 1.5em;
          margin-bottom: 1em;
        }
        .markdown-preview li {
          margin-bottom: 0.25em;
        }
        .markdown-preview blockquote {
          border-left: 4px solid #e5e7eb;
          padding: 0.75em 1em;
          margin: 0 0 1em 0;
          color: #6b7280;
          background-color: #f9fafb;
          border-radius: 0.375rem;
        }
        .markdown-preview pre {
          background-color: #1f2937;
          color: #e5e7eb;
          padding: 1em;
          margin: 1em 0;
          overflow-x: auto;
          border-radius: 0.5rem;
          font-size: 0.875em;
          line-height: 1.6;
        }
        .markdown-preview pre code {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          background: none;
          color: inherit;
          padding: 0;
          border-radius: 0;
          font-size: inherit;
        }
        .markdown-preview code {
          background-color: #f3f4f6;
          color: #ef4444;
          padding: 0.2em 0.4em;
          border-radius: 0.25em;
          font-size: 0.875em;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        }
        .markdown-preview img {
          max-width: 100%;
          height: auto;
          margin: 1.5em 0;
          border-radius: 0.5rem;
        }
        .markdown-preview hr {
          border: none;
          border-top: 2px solid #e5e7eb;
          margin: 2em 0;
        }
        .markdown-preview table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 1em;
        }
        .markdown-preview table th,
        .markdown-preview table td {
          border: 1px solid #e5e7eb;
          padding: 0.5em 0.75em;
          text-align: left;
        }
        .markdown-preview table th {
          background-color: #f9fafb;
          font-weight: 600;
        }
        .markdown-preview table tr:nth-child(even) {
          background-color: #f9fafb;
        }
      `}</style>
      {/* 工具栏 */}
      <div className="flex items-center gap-1 px-3 py-2 bg-gray-50 border-b border-gray-300 flex-wrap">
        {toolbarButtons.map((btn) => (
          <button
            key={btn.action}
            type="button"
            onClick={() => handleToolbarAction(btn.action)}
            className={`px-2 py-1 text-sm rounded hover:bg-gray-200 transition-colors ${btn.className || ""}`}
            title={btn.title}
          >
            {btn.icon}
          </button>
        ))}
        <div className="w-px h-6 bg-gray-300 mx-1" />
        {onImageUpload && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-2 py-1 text-sm rounded hover:bg-gray-200 transition-colors"
            title="上传图片"
          >
            📤 上传
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="flex-1" />
        <button
          type="button"
          onClick={() => setIsPreview(!isPreview)}
          className={`px-3 py-1 text-sm rounded transition-colors ${
            isPreview ? "bg-blue-600 text-white" : "hover:bg-gray-200"
          }`}
        >
          {isPreview ? "✏️ 编辑" : "👁️ 预览"}
        </button>
      </div>

      {/* 编辑区/预览区 */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative transition-colors ${isDragOver ? "bg-blue-50" : ""}`}
      >
        {isDragOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-blue-100 bg-opacity-90 z-10">
            <div className="text-blue-600 text-lg font-medium">拖拽图片到此处上传</div>
          </div>
        )}
        {isPreview ? (
          <div
            className="markdown-preview p-6 overflow-auto"
            style={{ minHeight }}
            dangerouslySetInnerHTML={{ __html: md.render(value || "*空内容*") }}
          />
        ) : (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || "开始写作... 支持 Markdown 语法"}
            className="w-full p-6 font-mono text-sm resize-y focus:outline-none"
            style={{ minHeight }}
          />
        )}
      </div>

      {/* 底部状态栏 */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-gray-50 border-t border-gray-300 text-xs text-gray-500">
        <div className="flex items-center gap-4">
          <span>{value.split(/\s+/).filter(Boolean).length} 字</span>
          <span>{value.split("\n").length} 行</span>
          <span>约 {Math.max(1, Math.ceil(value.length / 500))} 分钟阅读</span>
        </div>
        <span>支持 Markdown 语法</span>
      </div>
    </div>
  )
}

export default MarkdownEditor