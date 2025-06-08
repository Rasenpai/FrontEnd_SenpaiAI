import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Paperclip,
  FileText,
  Image,
  FileSpreadsheet,
  File,
  Eye,
} from "lucide-react";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [theme, setTheme] = useState("light");
  const [attachedFiles, setAttachedFiles] = useState([]);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const fileInputRef = useRef(null);

  // Supported file types with their extensions and icons
  const supportedTypes = {
    "image/*": { icon: Image, color: "text-green-500", label: "Image" },
    "application/pdf": { icon: FileText, color: "text-red-500", label: "PDF" },
    "application/msword": {
      icon: FileText,
      color: "text-blue-500",
      label: "Word",
    },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
      icon: FileText,
      color: "text-blue-500",
      label: "Word",
    },
    "application/vnd.ms-excel": {
      icon: FileSpreadsheet,
      color: "text-green-600",
      label: "Excel",
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
      icon: FileSpreadsheet,
      color: "text-green-600",
      label: "Excel",
    },
    "text/plain": { icon: FileText, color: "text-gray-500", label: "Text" },
    "text/csv": {
      icon: FileSpreadsheet,
      color: "text-orange-500",
      label: "CSV",
    },
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith("image/")) return supportedTypes["image/*"];
    return (
      supportedTypes[fileType] || {
        icon: File,
        color: "text-gray-500",
        label: "File",
      }
    );
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    const maxSize = 5 * 1024 * 1024; // 5MB

    files.forEach((file) => {
      if (file.size > maxSize) {
        alert(
          `File "${file.name}" terlalu besar. Maksimal ukuran file adalah 5MB.`
        );
        return;
      }

      const isSupported = Object.keys(supportedTypes).some((type) => {
        if (type === "image/*") return file.type.startsWith("image/");
        return file.type === type;
      });

      if (!isSupported) {
        alert(`Format file "${file.name}" tidak didukung.`);
        return;
      }

      // Create preview for images
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const fileData = {
            file,
            name: file.name,
            size: file.size,
            type: file.type,
            preview: e.target.result,
            id: Date.now() + Math.random(),
          };
          setAttachedFiles((prev) => [...prev, fileData]);
        };
        reader.readAsDataURL(file);
      } else {
        const fileData = {
          file,
          name: file.name,
          size: file.size,
          type: file.type,
          preview: null,
          id: Date.now() + Math.random(),
        };
        setAttachedFiles((prev) => [...prev, fileData]);
      }
    });

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (fileId) => {
    setAttachedFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  useEffect(() => {
    // Initialize theme based on system preference
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    setTheme(prefersDark ? "dark" : "light");
  }, []);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const isTyping = messages.some((msg) => msg.isTyping);
  const isInteractionDisabled = isLoading || isTyping;

  const sendMessage = async () => {
    if ((!input.trim() && attachedFiles.length === 0) || isInteractionDisabled)
      return;

    const userInput = input;
    const files = attachedFiles;

    const userMessage = {
      sender: "user",
      text: userInput,
      attachedFiles: files.length > 0 ? files : null,
    };
    setMessages([...messages, userMessage]);

    setInput("");
    setAttachedFiles([]);
    setIsLoading(true);

    const loadingMessage = {
      sender: "bot",
      text: "typing...",
      isLoading: true,
    };
    setMessages((prev) => [...prev, loadingMessage]);

    const BackEndUrl = import.meta.env.VITE_BACKEND_URL;

    try {
      const formData = new FormData();
      formData.append("message", userInput);
      files.forEach((file) => {
        formData.append("files", file); // file should be the actual File object
      });
      const res = await fetch(`${BackEndUrl}/ask`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      setMessages((prev) => {
        const filtered = prev.filter((msg) => !msg.isLoading);
        const botMessage = {
          sender: "bot",
          text: data.response,
          isTyping: true,
          image_base64: data.image_base64,
          image_url: data.image_url,
          image_type: data.image_type,
          special_user: data.special_user,
        };
        return [...filtered, botMessage];
      });
    } catch (err) {
      console.error("Error:", err);
      setMessages((prev) => {
        const filtered = prev.filter((msg) => !msg.isLoading);
        return [
          ...filtered,
          {
            sender: "bot",
            text: "Gagal menghubungi server. Silakan coba lagi.",
          },
        ];
      });
    } finally {
      setIsLoading(false);
    }
  };

  const TypingText = ({ fullText, messageIndex, onTypingComplete }) => {
    const [displayedText, setDisplayedText] = useState("");
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
      if (currentIndex < fullText.length) {
        const timer = setTimeout(() => {
          setDisplayedText((prev) => prev + fullText[currentIndex]);
          setCurrentIndex((prev) => prev + 1);
        }, 30);
        return () => clearTimeout(timer);
      } else if (onTypingComplete) {
        onTypingComplete(messageIndex);
      }
    }, [currentIndex, fullText, messageIndex, onTypingComplete]);

    return (
      <div className="text-sm leading-relaxed">
        <MarkdownRenderer text={displayedText} />
        {currentIndex < fullText.length && (
          <span className="animate-pulse text-blue-500">|</span>
        )}
      </div>
    );
  };

  const handleTypingComplete = (messageIndex) => {
    setMessages((prev) =>
      prev.map((msg, index) =>
        index === messageIndex ? { ...msg, isTyping: false } : msg
      )
    );
  };

  const LoadingSpinner = () => (
    <div className="flex items-center space-x-3">
      <div className="flex space-x-1">
        <div
          className={`w-2 h-2 rounded-full animate-bounce ${
            theme === "dark" ? "bg-blue-400" : "bg-blue-500"
          }`}
        ></div>
        <div
          className={`w-2 h-2 rounded-full animate-bounce ${
            theme === "dark" ? "bg-blue-400" : "bg-blue-500"
          }`}
          style={{ animationDelay: "0.1s" }}
        ></div>
        <div
          className={`w-2 h-2 rounded-full animate-bounce ${
            theme === "dark" ? "bg-blue-400" : "bg-blue-500"
          }`}
          style={{ animationDelay: "0.2s" }}
        ></div>
      </div>
      <span
        className={`text-sm ${
          theme === "dark" ? "text-gray-400" : "text-gray-600"
        }`}
      >
        AI sedang mengetik...
      </span>
    </div>
  );

  function isCode(text) {
    return (
      text.includes("```") ||
      (text.includes("\n") && (text.includes("{") || text.includes("}"))) ||
      text.includes("function") ||
      text.includes("const ") ||
      text.includes("let ") ||
      text.includes("var ") ||
      text.includes("import ") ||
      text.includes("export ")
    );
  }

  function detectLanguage(text) {
    if (text.includes("```")) {
      const match = text.match(/```(\w+)/);
      if (match) return match[1];
    }

    if (
      text.includes("import React") ||
      text.includes("jsx") ||
      text.includes("useState")
    )
      return "jsx";
    if (
      text.includes("def ") ||
      (text.includes("import ") && text.includes("python"))
    )
      return "python";
    if (
      text.includes("function") ||
      text.includes("const ") ||
      text.includes("=>")
    )
      return "javascript";
    if (text.includes("#include") || text.includes("int main")) return "cpp";
    if (text.includes("public class") || text.includes("System.out"))
      return "java";
    if (text.includes("<html") || text.includes("</")) return "html";
    if (text.includes("body {") || text.includes(".class")) return "css";

    return "code";
  }

  const copyToClipboard = async (text, messageIndex) => {
    try {
      const cleanCode = text
        .replace(/```[\w]*\n?/g, "")
        .replace(/```/g, "")
        .trim();
      await navigator.clipboard.writeText(cleanCode);
      setCopiedIndex(messageIndex);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error("Gagal copy ke clipboard:", err);
    }
  };

  const CodeBlock = ({ text, messageIndex }) => {
    const cleanCode = text
      .replace(/```[\w]*\n?/g, "")
      .replace(/```/g, "")
      .trim();
    const language = detectLanguage(text);

    return (
      <div
        className={`relative rounded-lg overflow-hidden mt-3 border ${
          theme === "dark"
            ? "bg-gray-900 border-gray-700"
            : "bg-gray-50 border-gray-200"
        }`}
      >
        <div
          className={`flex justify-between items-center px-4 py-3 text-sm ${
            theme === "dark"
              ? "bg-gray-800 text-gray-300 border-b border-gray-700"
              : "bg-gray-100 text-gray-700 border-b border-gray-200"
          }`}
        >
          <div className="flex items-center space-x-2">
            <span className="text-xs px-2 py-1 rounded-full bg-blue-500 text-white font-medium">
              {language.toUpperCase()}
            </span>
            <span>Code</span>
          </div>
          <button
            onClick={() => copyToClipboard(text, messageIndex)}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-md transition-all duration-200 ${
              theme === "dark"
                ? "hover:bg-gray-700 text-gray-300 hover:text-white"
                : "hover:bg-gray-200 text-gray-600 hover:text-gray-800"
            }`}
          >
            {copiedIndex === messageIndex ? (
              <>
                <svg
                  className="w-4 h-4 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-green-500 font-medium">Copied!</span>
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
        <div className="p-4 overflow-x-auto">
          <pre
            className={`text-sm font-mono leading-relaxed ${
              theme === "dark" ? "text-gray-100" : "text-gray-800"
            }`}
          >
            <code>{cleanCode}</code>
          </pre>
        </div>
      </div>
    );
  };

  // Image Component for special messages
  const MessageImage = ({ message }) => {
    if (!message.image_base64 && !message.image_url) return null;

    const imageSrc = message.image_base64
      ? `data:${message.image_type || "image/webp"};base64,${
          message.image_base64
        }`
      : message.image_url;

    return (
      <div className="mt-3 mb-2">
        <img
          src={imageSrc}
          alt={
            message.special_user
              ? `Special image for ${message.special_user}`
              : "Message image"
          }
          className="max-w-full h-auto rounded-lg shadow-md max-h-64 object-cover"
          onError={(e) => {
            console.error("Failed to load image:", e);
            e.target.style.display = "none";
          }}
        />
        {message.special_user && (
          <div
            className={`text-xs mt-1 opacity-70 ${
              theme === "dark" ? "text-blue-400" : "text-blue-600"
            }`}
          >
            ✨ Special message for {message.special_user}
          </div>
        )}
      </div>
    );
  };

  // User Attached Files Component
  const UserAttachedFiles = ({ files }) => {
    if (!files || files.length === 0) return null;

    return (
      <div className="mt-2 mb-3">
        <div className="text-xs opacity-70 mb-2">Attached Files:</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {files.map((fileData) => {
            const {
              icon: IconComponent,
              color,
              label,
            } = getFileIcon(fileData.type);

            return (
              <div
                key={fileData.id}
                className="border border-white/20 rounded-lg p-2 bg-white/10"
              >
                <div className="flex items-center gap-2">
                  {fileData.preview ? (
                    <img
                      src={fileData.preview}
                      alt={fileData.name}
                      className="w-8 h-8 object-cover rounded border"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded border border-white/30 bg-white/20 flex items-center justify-center">
                      <IconComponent className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate text-white">
                      {fileData.name}
                    </p>
                    <p className="text-xs opacity-70 text-white">
                      {label} • {formatFileSize(fileData.size)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Markdown Renderer Component
  const MarkdownRenderer = ({ text }) => {
    const renderMarkdown = (text) => {
      let html = text;

      // Headers (h1-h6)
      html = html.replace(
        /^### (.*$)/gim,
        '<h3 class="text-lg font-bold mt-4 mb-2">$1</h3>'
      );
      html = html.replace(
        /^## (.*$)/gim,
        '<h2 class="text-xl font-bold mt-4 mb-2">$1</h2>'
      );
      html = html.replace(
        /^# (.*$)/gim,
        '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>'
      );

      // Bold
      html = html.replace(
        /\*\*(.*?)\*\*/g,
        '<strong class="font-bold">$1</strong>'
      );
      html = html.replace(
        /__(.*?)__/g,
        '<strong class="font-bold">$1</strong>'
      );

      // Italic
      html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
      html = html.replace(/_(.*?)_/g, '<em class="italic">$1</em>');

      // Strikethrough
      html = html.replace(/~~(.*?)~~/g, '<del class="line-through">$1</del>');

      // Inline code
      html = html.replace(
        /`([^`]+)`/g,
        `<code class="px-1 py-0.5 rounded text-sm font-mono ${
          theme === "dark"
            ? "bg-gray-700 text-blue-300"
            : "bg-gray-100 text-red-600"
        }">$1</code>`
      );

      // Links
      html = html.replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2" class="text-blue-500 hover:text-blue-600 underline" target="_blank" rel="noopener noreferrer">$1</a>'
      );

      // Lists
      const lines = html.split("\n");
      let inList = false;
      let listType = "";

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Unordered list
        if (line.match(/^[\s]*[-\*\+]\s+/)) {
          if (!inList || listType !== "ul") {
            if (inList && listType === "ol") {
              lines[i - 1] += "</ol>";
            }
            lines[i] =
              '<ul class="list-disc list-inside ml-4 space-y-1">' +
              "<li>" +
              line.replace(/^[\s]*[-\*\+]\s+/, "") +
              "</li>";
            inList = true;
            listType = "ul";
          } else {
            lines[i] = "<li>" + line.replace(/^[\s]*[-\*\+]\s+/, "") + "</li>";
          }
        }
        // Ordered list
        else if (line.match(/^[\s]*\d+\.\s+/)) {
          if (!inList || listType !== "ol") {
            if (inList && listType === "ul") {
              lines[i - 1] += "</ul>";
            }
            lines[i] =
              '<ol class="list-decimal list-inside ml-4 space-y-1">' +
              "<li>" +
              line.replace(/^[\s]*\d+\.\s+/, "") +
              "</li>";
            inList = true;
            listType = "ol";
          } else {
            lines[i] = "<li>" + line.replace(/^[\s]*\d+\.\s+/, "") + "</li>";
          }
        }
        // End list
        else if (inList && line.trim() === "") {
          lines[i - 1] += listType === "ul" ? "</ul>" : "</ol>";
          inList = false;
          listType = "";
        }
      }

      // Close any remaining list
      if (inList) {
        lines[lines.length - 1] += listType === "ul" ? "</ul>" : "</ol>";
      }

      html = lines.join("\n");

      // Blockquotes
      html = html.replace(
        /^> (.*$)/gim,
        `<blockquote class="border-l-4 ${
          theme === "dark"
            ? "border-gray-600 bg-gray-700"
            : "border-gray-300 bg-gray-50"
        } pl-4 py-2 my-2 italic">$1</blockquote>`
      );

      // Line breaks
      html = html.replace(/\n/g, "<br>");

      return html;
    };

    return (
      <div
        className="markdown-content"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(text) }}
      />
    );
  };

  const toggleTheme = () => {
    // Don't allow theme change while AI is typing
    if (isTyping) return;

    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
  };

  return (
    <div
      className={`h-screen transition-all duration-300 ${
        theme === "dark"
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
          : "bg-gradient-to-br from-blue-50 via-white to-purple-50"
      }`}
    >
      <div className="h-full max-w-5xl mx-auto p-4">
        <div
          className={`h-full rounded-2xl shadow-2xl flex flex-col overflow-hidden border ${
            theme === "dark"
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          {/* Header */}
          <div
            className={`px-6 py-4 border-b ${
              theme === "dark"
                ? "border-gray-700 bg-gray-800"
                : "border-gray-200 bg-white"
            }`}
          >
            <div className="flex justify-between items-center">
              <div>
                <h1
                  className={`text-2xl font-bold ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  🤖 Senpai
                  <span className="font-extrabold font-mono bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                    AI
                  </span>
                </h1>
                <p
                  className={`text-sm mt-1 ${
                    theme === "dark" ? "text-blue-400" : "text-blue-600"
                  }`}
                >
                  Assistant virtual.
                </p>
              </div>

              <button
                onClick={toggleTheme}
                className={`p-3 rounded-full transition-all duration-300 transform hover:scale-110 ${
                  theme === "dark"
                    ? "bg-gray-700 hover:bg-gray-600 text-yellow-400"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
                title="Toggle theme"
              >
                {theme === "dark" ? (
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={messagesContainerRef}
            className={`flex-1 overflow-y-auto p-6 space-y-6 ${
              theme === "dark" ? "bg-gray-800" : "bg-gray-50"
            }`}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-2xl px-5 py-4 rounded-2xl shadow-sm ${
                    msg.sender === "user"
                      ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-br-md"
                      : theme === "dark"
                      ? "bg-gray-700 text-gray-100 rounded-bl-md border border-gray-600"
                      : "bg-white text-gray-800 rounded-bl-md border border-gray-200 shadow-md"
                  }`}
                >
                  <div className="text-xs font-medium mb-2 opacity-70">
                    {msg.sender === "user" ? "Kamu" : "AI Assistant"}
                  </div>

                  {msg.isLoading ? (
                    <LoadingSpinner />
                  ) : msg.isTyping ? (
                    <>
                      <MessageImage message={msg} />
                      <TypingText
                        fullText={msg.text}
                        messageIndex={i}
                        onTypingComplete={handleTypingComplete}
                      />
                    </>
                  ) : isCode(msg.text) ? (
                    <div>
                      <MessageImage message={msg} />
                      {msg.attachedFiles && (
                        <UserAttachedFiles files={msg.attachedFiles} />
                      )}
                      <div className="text-sm leading-relaxed mb-2">
                        {msg.text.split("```")[0].trim() && (
                          <div className="mb-3">
                            <MarkdownRenderer
                              text={msg.text.split("```")[0].trim()}
                            />
                          </div>
                        )}
                      </div>
                      <CodeBlock text={msg.text} messageIndex={i} />
                      {msg.text.split("```")[2]?.trim() && (
                        <div className="text-sm leading-relaxed mt-3">
                          <MarkdownRenderer
                            text={msg.text.split("```")[2].trim()}
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm leading-relaxed">
                      <MessageImage message={msg} />
                      {msg.attachedFiles && (
                        <UserAttachedFiles files={msg.attachedFiles} />
                      )}
                      <MarkdownRenderer text={msg.text} />
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* File Attachment Preview */}
          {attachedFiles.length > 0 && (
            <div
              className={`border-t px-6 py-4 ${
                theme === "dark"
                  ? "border-gray-700 bg-gray-800"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`text-sm font-medium ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Attached Files ({attachedFiles.length})
                </span>
                <button
                  onClick={() => setAttachedFiles([])}
                  className={`text-xs px-3 py-1 rounded-full transition-colors ${
                    theme === "dark"
                      ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                  }`}
                >
                  Clear All
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {attachedFiles.map((fileData) => {
                  const {
                    icon: IconComponent,
                    color,
                    label,
                  } = getFileIcon(fileData.type);

                  return (
                    <div
                      key={fileData.id}
                      className={`relative group border rounded-lg p-3 transition-all ${
                        theme === "dark"
                          ? "border-gray-600 bg-gray-700 hover:bg-gray-600"
                          : "border-gray-300 bg-white hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {fileData.preview ? (
                          <div className="relative">
                            <img
                              src={fileData.preview}
                              alt={fileData.name}
                              className="w-12 h-12 object-cover rounded border"
                            />
                            <button
                              onClick={() => {
                                // Create a modal or viewer for image preview
                                window.open(fileData.preview, "_blank");
                              }}
                              className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center"
                            >
                              <Eye className="w-4 h-4 text-white" />
                            </button>
                          </div>
                        ) : (
                          <div
                            className={`w-12 h-12 rounded border flex items-center justify-center ${
                              theme === "dark"
                                ? "border-gray-500 bg-gray-600"
                                : "border-gray-300 bg-gray-100"
                            }`}
                          >
                            <IconComponent className={`w-6 h-6 ${color}`} />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm font-medium truncate ${
                              theme === "dark"
                                ? "text-gray-200"
                                : "text-gray-800"
                            }`}
                          >
                            {fileData.name}
                          </p>
                          <p
                            className={`text-xs ${
                              theme === "dark"
                                ? "text-gray-400"
                                : "text-gray-500"
                            }`}
                          >
                            {label} • {formatFileSize(fileData.size)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFile(fileData.id)}
                        className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                          theme === "dark"
                            ? "bg-red-600 hover:bg-red-700 text-white"
                            : "bg-red-500 hover:bg-red-600 text-white"
                        }`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div
            className={`px-6 py-4 border-t ${
              theme === "dark"
                ? "border-gray-700 bg-gray-800"
                : "border-gray-200 bg-white"
            }`}
          >
            <div className="flex items-end space-x-3">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                multiple
                accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
                className="hidden"
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isInteractionDisabled}
                className={`p-3 rounded-full transition-all duration-200 ${
                  isInteractionDisabled
                    ? "opacity-50 cursor-not-allowed"
                    : theme === "dark"
                    ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                } ${attachedFiles.length > 0 ? "ring-2 ring-blue-500" : ""}`}
                title="Attach files"
              >
                <Paperclip className="w-5 h-5" />
              </button>

              <div className="flex-1 relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Ask anything"
                  disabled={isInteractionDisabled}
                  className={`w-full px-4 py-3 rounded-2xl border resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                    theme === "dark"
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500"
                  } ${
                    isInteractionDisabled ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  rows="1"
                  style={{
                    minHeight: "50px",
                    maxHeight: "120px",
                    overflowY: input.length > 100 ? "auto" : "hidden",
                  }}
                />
                <div className="absolute bottom-2 right-2 flex items-center space-x-2">
                  {attachedFiles.length > 0 && (
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        theme === "dark"
                          ? "bg-blue-600 text-blue-100"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {attachedFiles.length} file
                      {attachedFiles.length > 1 ? "s" : ""}
                    </span>
                  )}
                  <span
                    className={`text-xs ${
                      theme === "dark" ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {input.length}/2000
                  </span>
                </div>
              </div>

              <button
                onClick={sendMessage}
                disabled={
                  isInteractionDisabled ||
                  (!input.trim() && attachedFiles.length === 0)
                }
                className={`p-3 rounded-full transition-all duration-200 transform ${
                  isInteractionDisabled ||
                  (!input.trim() && attachedFiles.length === 0)
                    ? "opacity-50 cursor-not-allowed bg-gray-300"
                    : "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 hover:scale-105 shadow-lg"
                } text-white`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </div>

            {/* Input Help Text */}
            <div
              className={`mt-2 text-xs ${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Press Enter to send, Shift+Enter for new line. Max file size: 5MB
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
