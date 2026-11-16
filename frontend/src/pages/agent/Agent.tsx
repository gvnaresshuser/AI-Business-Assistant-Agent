import { useEffect, useState } from "react";
import {
  /*  showSuccessToast,
  showErrorToast,
  showConfirmDialog, */
  showDeleteConfirm,
} from "../../utils/swal";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Settings,
  FileDown,
  Archive,
  Pencil,
  Bot,
  Send,
  Plus,
  MessageSquare,
  Loader2,
  User,
  ArchiveRestore,
  Trash2,
  Copy,
  RefreshCw,
  Search,
  Menu,
  X,
  Download,
} from "lucide-react";
import Swal from "sweetalert2";
import {
  renameConversationApi,
  archiveConversationApi,
  getArchivedConversationsApi,
  restoreConversationApi,
  deleteConversationApi,
  regenerateAgentResponseApi,
} from "../../api/agentApi";

import {
  createConversationApi,
  getConversationsApi,
  getConversationMessagesApi,
  sendAgentMessageApi,
  type AgentConversation,
  type AgentMessage,
} from "../../api/agentApi";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const formatMessageForPdf = (content: string): string => {
  const lines = content.split("\n");
  const result: string[] = [];

  let i = 0;

  while (i < lines.length) {
    const currentLine = lines[i].trim();

    // Detect a Markdown table header followed by a separator row
    if (
      currentLine.includes("|") &&
      i + 1 < lines.length &&
      /^\|?[\s:|-]+\|?$/.test(lines[i + 1].trim()) &&
      lines[i + 1].includes("-")
    ) {
      const headers = currentLine
        .replace(/^\||\|$/g, "")
        .split("|")
        .map((cell) => cell.trim());

      i += 2;

      // Convert each table row into labelled text
      while (i < lines.length && lines[i].trim().includes("|")) {
        const values = lines[i]
          .trim()
          .replace(/^\||\|$/g, "")
          .split("|")
          .map((cell) => cell.trim());

        const rowText = headers
          .map((header, index) =>
            values[index] ? `${header}: ${values[index]}` : "",
          )
          .filter(Boolean)
          .join("\n");

        if (rowText) {
          result.push(rowText);
          result.push("");
        }

        i++;
      }

      continue;
    }

    result.push(currentLine);
    i++;
  }

  return result
    .join("\n")
    .replace(/```[\w]*\n?/g, "")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/_(.*?)_/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^[-*_]{3,}\s*$/gm, "")
    .replace(/^\s*[*•]\s+/gm, "")
    .replace(/₹/g, "INR ")
    .replace(/\s*\(\s*INR\s*\)/gi, "")
    .trim();
};

const Agent = () => {
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [regeneratingMessageId, setRegeneratingMessageId] = useState<
    string | null
  >(null);
  const [archivedConversations, setArchivedConversations] = useState<
    AgentConversation[]
  >([]);
  const [showArchived, setShowArchived] = useState(false);
  const [creating, setCreating] = useState(false);
  const [conversations, setConversations] = useState<AgentConversation[]>([]);
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const handleExportConversationPdf = () => {
    if (!messages.length) return;

    const doc = new jsPDF();

    const conversation = conversations.find((item) => item.id === sessionId);

    const title = conversation?.session_title || "AI Business Conversation";

    doc.setFontSize(18);
    doc.text("AI Business Assistant", 14, 20);

    doc.setFontSize(14);
    doc.text(title, 14, 30);

    doc.setFontSize(10);
    doc.text(`Exported: ${new Date().toLocaleString("en-IN")}`, 14, 38);

    autoTable(doc, {
      startY: 45,
      head: [["Time", "Sender", "Message"]],
      body: messages.map((message) => [
        formatMessageTime(message.created_at),
        message.sender_type === "User" ? "You" : "AI Assistant",
        formatMessageForPdf(message.message_content),
      ]),
      styles: {
        font: "helvetica",
        fontStyle: "normal",
        fontSize: 9,
        cellPadding: 4,
        overflow: "linebreak",
        valign: "top",
        halign: "left",
        lineColor: [220, 220, 220],
        lineWidth: 0.1,
        textColor: [45, 55, 72],
      },
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: "left",
        cellPadding: 5,
      },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 30 },
        2: { cellWidth: "auto" },
      },
      margin: { top: 15, bottom: 20, left: 14, right: 14 },
      showHead: "everyPage",
      rowPageBreak: "avoid",
      pageBreak: "auto",
      didParseCell: (data) => {
        if (data.section === "body") {
          const sender = String(data.row.cells[1]?.text ?? "");

          // Light blue for user messages
          if (sender === "You") {
            data.cell.styles.fillColor = [239, 246, 255];
          }

          // Light grey for AI responses
          else {
            data.cell.styles.fillColor = [248, 250, 252];
          }

          // Highlight sender name
          if (data.column.index === 1) {
            data.cell.styles.fontStyle = "bold";

            data.cell.styles.textColor =
              sender === "You" ? [37, 99, 235] : [71, 85, 105];
          }
        }
      },
    });

    const totalPages = doc.getNumberOfPages();

    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);

      // Footer separator
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.line(14, 278, 196, 278);

      // Footer branding
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);

      doc.text("GV Naressh | AI Business Assistant", 14, 285);

      // Page number
      doc.setFont("helvetica", "normal");
      doc.text(`Page ${i} of ${totalPages}`, 196, 285, { align: "right" });
    }

    const safeTitle = title.replace(/[^a-z0-9]/gi, "_");

    doc.save(`${safeTitle}.pdf`);
  };

  const handleExportConversation = () => {
    if (messages.length === 0) {
      setError("There are no messages to export.");
      return;
    }

    const conversation = conversations.find((item) => item.id === sessionId);

    const title = conversation?.session_title || "AI Business Conversation";

    const content = [
      title,
      "=".repeat(title.length),
      "",
      ...messages.map((message) => {
        const sender = message.sender_type === "User" ? "You" : "AI Assistant";

        const time = formatMessageTime(message.created_at);

        return `[${time}] ${sender}:\n${message.message_content}\n`;
      }),
    ].join("\n");

    const blob = new Blob([content], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${title.replace(/[^a-z0-9]/gi, "_")}.txt`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
    setError("");
    void Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: "Conversation exported successfully!",
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true,
    });
  };

  const formatMessageTime = (date: string | null) => {
    if (!date) return "";

    return new Date(date).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleRegenerateResponse = async (message: AgentMessage) => {
    if (!sessionId || regeneratingMessageId) return;

    try {
      setError("");
      setRegeneratingMessageId(message.id);

      const updatedMessage = await regenerateAgentResponseApi(
        sessionId,
        message.id,
      );

      setMessages((prev) =>
        prev.map((item) =>
          item.id === updatedMessage.id ? { ...item, ...updatedMessage } : item,
        ),
      );
    } catch (error) {
      console.error("Regenerate response error:", error);
      setError("Failed to regenerate AI response. Please try again.");
    } finally {
      setRegeneratingMessageId(null);
    }
  };

  const handleCopyResponse = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setError("");
      await Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Response copied successfully!",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
    } catch (error) {
      console.error("Copy response error:", error);
      setError("Unable to copy response. Please try again.");
    }
  };

  const handleDeleteConversation = async (conversation: AgentConversation) => {
    const result = await showDeleteConfirm(
      "Delete Conversation?",
      `Are you sure you want to permanently delete "${
        conversation.session_title || "New Conversation"
      }"? This action cannot be undone.`,
    );

    if (!result.isConfirmed) return;

    try {
      setError("");

      await deleteConversationApi(conversation.id);

      setConversations((previous) =>
        previous.filter((item) => item.id !== conversation.id),
      );

      setArchivedConversations((previous) =>
        previous.filter((item) => item.id !== conversation.id),
      );

      if (sessionId === conversation.id) {
        setSessionId(null);
        setMessages([]);
        setQuestion("");
      }
    } catch (error) {
      console.error("Delete conversation error:", error);
      setError("Failed to delete conversation. Please try again.");
    }
  };

  const handleRestoreConversation = async (sessionId: string) => {
    try {
      setError("");

      await restoreConversationApi(sessionId);

      const restored = archivedConversations.find(
        (conversation) => conversation.id === sessionId,
      );

      setArchivedConversations((previous) =>
        previous.filter((conversation) => conversation.id !== sessionId),
      );

      if (restored) {
        setConversations((previous) => [restored, ...previous]);
      }

      await loadConversations();
      void Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Conversation restored successfully!",
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true,
      });
    } catch (error) {
      console.error("Restore conversation error:", error);
      setError("Failed to restore conversation.");
    }
  };

  const handleShowArchived = async () => {
    try {
      setError("");

      const archived = await getArchivedConversationsApi();

      setArchivedConversations(archived);
      setShowArchived(true);
    } catch (error) {
      console.error("Load archived conversations error:", error);
      setError("Failed to load archived conversations.");
    }
  };

  const handleArchiveConversation = async (conversation: AgentConversation) => {
    const result = await Swal.fire({
      title: "Archive Conversation?",
      text: `Do you want to archive "${
        conversation.session_title || "New Conversation"
      }"? You can restore it later.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Archive",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#64748b",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      setError("");

      await archiveConversationApi(conversation.id);

      // Remove the archived conversation from the sidebar
      setConversations((previous) =>
        previous.filter((item) => item.id !== conversation.id),
      );

      // Clear the chat if the archived conversation was selected
      if (sessionId === conversation.id) {
        setSessionId(null);
        setMessages([]);
        setQuestion("");
      }
    } catch (error) {
      console.error("Archive conversation error:", error);
      setError("Failed to archive conversation. Please try again.");
    }
  };

  const handleRenameConversation = async (conversation: AgentConversation) => {
    const currentTitle = conversation.session_title || "New Conversation";

    const result = await Swal.fire({
      title: "Rename Conversation",
      input: "text",
      inputLabel: "Conversation Name",
      inputValue: currentTitle,
      inputPlaceholder: "Enter conversation name",
      showCancelButton: true,
      confirmButtonText: "Save Changes",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#64748b",
      reverseButtons: true,
      inputValidator: (value) => {
        if (!value.trim()) {
          return "Conversation name cannot be empty!";
        }

        if (value.trim().length > 100) {
          return "Conversation name cannot exceed 100 characters.";
        }
      },
    });

    if (!result.isConfirmed) return;

    const newTitle = result.value.trim();

    if (newTitle === currentTitle) return;

    if (newTitle.length > 100) {
      setError("Conversation name cannot exceed 100 characters.");
      return;
    }

    try {
      setError("");

      const updatedConversation = await renameConversationApi(
        conversation.id,
        newTitle,
      );

      setConversations((previous) =>
        previous.map((item) =>
          item.id === conversation.id
            ? { ...item, ...updatedConversation }
            : item,
        ),
      );
    } catch (error) {
      console.error("Rename conversation error:", error);
      setError("Failed to rename conversation. Please try again.");
    }
  };

  // Load conversation history
  const loadConversations = async () => {
    try {
      setLoading(true);
      const data = await getConversationsApi();
      setConversations(data);
    } catch {
      setError("Unable to load conversations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadConversations();
  }, []);

  // Create a new chat

  const handleNewConversation = async () => {
    console.log(
      "handleNewConversation called, sessionId:",
      sessionId,
      "messages length:",
      messages.length,
    );
    try {
      if (sessionId && messages.length > 0) {
        //if (sessionId) {
        const result = await Swal.fire({
          title: "Start a New Conversation?",
          text: "Your current conversation will be saved automatically.",
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "Yes, Start New",
          cancelButtonText: "Stay Here",
          confirmButtonColor: "#2563eb",
          cancelButtonColor: "#64748b",
          reverseButtons: true,
        });

        if (!result.isConfirmed) return;
      }
      setCreating(true);
      setError("");

      const conversation = await createConversationApi();

      setSessionId(conversation.id);
      setMessages([]);
      setQuestion("");
      setShowMobileSidebar(false);

      setConversations((previous) => [
        conversation,
        ...previous.filter((item) => item.id !== conversation.id),
      ]);
    } catch {
      setError("Unable to create a new conversation.");
    } finally {
      setCreating(false);
    }
  };

  // Select an existing conversation
  const handleSelectConversation = async (id: string) => {
    try {
      setError("");
      setLoading(true);

      const data = await getConversationMessagesApi(id);

      setSessionId(id);
      setMessages(data);
      setShowMobileSidebar(false);
    } catch {
      setError("Unable to load conversation messages.");
    } finally {
      setLoading(false);
    }
  };

  // Send message to AI Agent
  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const cleanQuestion = question.trim();

    if (!cleanQuestion || sending) {
      return;
    }

    try {
      setSending(true);
      setError("");

      const response = await sendAgentMessageApi(
        cleanQuestion,
        sessionId ?? undefined,
      );

      const now = new Date().toISOString();

      const userMessage: AgentMessage = {
        id: `user-${Date.now()}`,
        session_id: response.sessionId,
        sender_type: "User",
        message_content: response.question,
        created_at: now,
      };

      const assistantMessage: AgentMessage = {
        id: `assistant-${Date.now()}`,
        session_id: response.sessionId,
        sender_type: "Assistant",
        message_content: response.answer,
        created_at: now,
      };

      setSessionId(response.sessionId);

      setMessages((previous) => [...previous, userMessage, assistantMessage]);

      setQuestion("");

      await loadConversations();
    } catch {
      setError("Unable to get an AI response. Please try again.");
    } finally {
      setSending(false);
    }
  };
  const filteredConversations = (
    showArchived ? archivedConversations : conversations
  ).filter((conversation) =>
    (conversation.session_title || "New Conversation")
      .toLowerCase()
      .includes(searchTerm.trim().toLowerCase()),
  );
  const lastAssistantMessageId = [...messages]
    .reverse()
    .find((message) => message.sender_type === "Assistant")?.id;
  return (
    <div className="flex h-[calc(100vh-130px)] min-h-[500px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* Conversation Sidebar */}
      {showMobileSidebar && (
        <div
          className="absolute inset-0 z-20 bg-black/40 md:hidden"
          onClick={() => setShowMobileSidebar(false)}
        />
      )}
      <aside
        className={`${
          showMobileSidebar ? "flex" : "hidden"
        } absolute inset-y-0 left-0 z-30 w-72 flex-col border-r border-slate-200 bg-slate-50 shadow-lg md:relative md:flex md:shadow-none`}
      >
        <div className="border-b border-slate-200 p-4">
          <button
            type="button"
            onClick={handleNewConversation}
            disabled={creating}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {creating ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Plus size={18} />
            )}
            {creating ? "Creating..." : "New Conversation"}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          <div className="mb-3 flex items-center justify-between px-2">
            <h3 className="text-xs font-semibold uppercase text-slate-400">
              {showArchived ? "Archived Conversations" : "Recent Conversations"}
            </h3>

            <div className="px-3 py-2">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search conversations..."
                  className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-400"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (showArchived) {
                  setShowArchived(false);
                } else {
                  handleShowArchived();
                }
              }}
              className="text-xs font-medium text-blue-600 hover:text-blue-800"
            >
              {showArchived ? "Recent" : "Archived"}
            </button>
          </div>

          {showArchived ? (
            filteredConversations.length === 0 ? (
              <p className="p-3 text-sm text-slate-500">
                No archived conversations.
              </p>
            ) : (
              filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className="mb-2 flex items-center gap-2 rounded-lg px-3 py-3 text-sm text-slate-600 hover:bg-slate-200"
                >
                  <MessageSquare size={17} className="shrink-0" />

                  <span className="min-w-0 flex-1 truncate">
                    {conversation.session_title || "New Conversation"}
                  </span>

                  <button
                    type="button"
                    title="Restore conversation"
                    onClick={() => handleRestoreConversation(conversation.id)}
                    className="rounded-md p-2 text-slate-400 hover:bg-white hover:text-green-600"
                  >
                    <ArchiveRestore size={16} />
                  </button>
                  <button
                    type="button"
                    title="Delete conversation permanently"
                    onClick={() => handleDeleteConversation(conversation)}
                    className="rounded-md p-2 text-slate-400 hover:bg-white hover:text-red-600"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))
            )
          ) : loading && filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-xl bg-gradient-to-br from-blue-50 to-violet-50 p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-md shadow-blue-500/10">
                <Settings size={22} className="animate-spin text-blue-600" />
              </div>

              <div className="text-center space-y-1">
                <p className="text-sm font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                  Loading Conversations...
                </p>

                <p className="text-xs text-slate-500">
                  Preparing your conversation history
                </p>
              </div>
            </div>
          ) : filteredConversations.length === 0 ? (
            <p className="p-3 text-sm text-slate-500">No conversations yet.</p>
          ) : (
            filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`mb-2 flex items-center gap-1 rounded-lg transition ${
                  sessionId === conversation.id
                    ? "bg-blue-100 text-blue-700"
                    : "text-slate-600 hover:bg-slate-200"
                }`}
              >
                <button
                  type="button"
                  onClick={() => handleSelectConversation(conversation.id)}
                  className="flex min-w-0 flex-1 items-center gap-3 px-3 py-3 text-left text-sm"
                >
                  <MessageSquare size={17} className="shrink-0" />
                  <span className="truncate">
                    {conversation.session_title || "New Conversation"}
                  </span>
                </button>

                <button
                  type="button"
                  title="Rename conversation"
                  onClick={() => handleRenameConversation(conversation)}
                  className="rounded-md p-2 text-slate-400 hover:bg-white hover:text-blue-600"
                >
                  <Pencil size={15} />
                </button>

                <button
                  type="button"
                  title="Archive conversation"
                  onClick={() => handleArchiveConversation(conversation)}
                  className="mr-2 rounded-md p-2 text-slate-400 hover:bg-white hover:text-red-600"
                >
                  <Archive size={15} />
                </button>
                <button
                  type="button"
                  title="Delete conversation permanently"
                  onClick={() => handleDeleteConversation(conversation)}
                  className="mr-2 rounded-md p-2 text-slate-400 hover:bg-white hover:text-red-600"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Main Chat Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Chat Header */}
        <div className="flex items-center gap-3 border-b border-slate-200 p-4">
          <button
            type="button"
            onClick={() => setShowMobileSidebar(!showMobileSidebar)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
            title="Toggle conversations"
          >
            {showMobileSidebar ? <X size={22} /> : <Menu size={22} />}
          </button>
          <div className="rounded-lg bg-blue-100 p-2 text-blue-600">
            <Bot size={24} />
          </div>

          <div>
            <h2 className="font-semibold text-slate-800">
              AI Business Assistant
            </h2>
            <p className="text-xs text-slate-500">
              Ask questions about your business
            </p>
          </div>
          <button
            type="button"
            onClick={handleExportConversation}
            disabled={messages.length === 0}
            title="Export conversation"
            className="ml-auto flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download size={17} />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button
            type="button"
            onClick={handleExportConversationPdf}
            disabled={messages.length === 0}
            title="Export conversation as PDF"
            className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FileDown size={17} />
            <span className="hidden sm:inline">PDF</span>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 space-y-5 overflow-y-auto bg-slate-50 p-4 sm:p-6">
          {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-4 rounded-full bg-blue-100 p-5 text-blue-600">
                <Bot size={36} />
              </div>

              <h3 className="text-xl font-semibold text-slate-800">
                Welcome to your AI Assistant
              </h3>

              <p className="mt-2 max-w-md text-sm text-slate-500">
                Ask questions about sales, products, inventory, customers and
                your business performance.
              </p>
            </div>
          )}

          {messages.map((message) => {
            const isUser = message.sender_type === "User";

            return (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  isUser ? "justify-end" : "justify-start"
                }`}
              >
                {!isUser && (
                  <div className="h-9 w-9 shrink-0 rounded-full bg-blue-100 p-2 text-blue-600">
                    <Bot size={20} />
                  </div>
                )}

                <div className="flex max-w-[85%] flex-col">
                  <div
                    className={`whitespace-pre-wrap rounded-xl px-4 py-3 text-sm leading-6 ${
                      isUser
                        ? "bg-blue-600 text-white"
                        : "border border-slate-200 bg-white text-slate-700"
                    }`}
                  >
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({ children }) => (
                          <p className="mb-3 last:mb-0 leading-6">{children}</p>
                        ),
                        strong: ({ children }) => (
                          <strong className="font-bold text-slate-900">
                            {children}
                          </strong>
                        ),
                        ul: ({ children }) => (
                          <ul className="mb-3 list-disc space-y-1 pl-5">
                            {children}
                          </ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="mb-3 list-decimal space-y-1 pl-5">
                            {children}
                          </ol>
                        ),
                        li: ({ children }) => <li>{children}</li>,
                        h1: ({ children }) => (
                          <h1 className="mb-3 text-xl font-bold">{children}</h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className="mb-3 text-lg font-bold">{children}</h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="mb-2 text-base font-bold">
                            {children}
                          </h3>
                        ),
                        table: ({ children }) => (
                          <div className="mb-3 overflow-x-auto">
                            <table className="w-full border-collapse text-sm">
                              {children}
                            </table>
                          </div>
                        ),
                        th: ({ children }) => (
                          <th className="border border-slate-300 bg-slate-100 px-3 py-2 text-left font-semibold">
                            {children}
                          </th>
                        ),
                        td: ({ children }) => (
                          <td className="border border-slate-300 px-3 py-2">
                            {children}
                          </td>
                        ),
                        /* th: ({ children }) => (
                          <th className="border border-slate-300 bg-slate-100 px-3 py-2 text-center font-semibold">
                            {children}
                          </th>
                        ),
                        td: ({ children }) => (
                          <td className="border border-slate-300 px-3 py-2 text-center">
                            {children}
                          </td>
                        ), */
                      }}
                    >
                      {message.message_content}
                    </ReactMarkdown>
                  </div>

                  <span
                    className={`mt-1 px-1 text-[11px] text-slate-400 ${
                      isUser ? "self-end" : "self-start"
                    }`}
                  >
                    {formatMessageTime(message.created_at)}
                  </span>

                  {!isUser && (
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleCopyResponse(message.message_content)
                        }
                        title="Copy AI response"
                        className="flex w-fit items-center gap-2 rounded-md px-2 py-1 text-xs text-slate-500 hover:bg-slate-200 hover:text-blue-600"
                      >
                        <Copy size={14} />
                        Copy
                      </button>

                      {message.id === lastAssistantMessageId && (
                        <button
                          type="button"
                          onClick={() => handleRegenerateResponse(message)}
                          disabled={regeneratingMessageId !== null}
                          title="Regenerate AI response"
                          className="flex w-fit items-center gap-2 rounded-md px-2 py-1 text-xs text-slate-500 hover:bg-slate-200 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <RefreshCw
                            size={14}
                            className={
                              regeneratingMessageId === message.id
                                ? "animate-spin"
                                : ""
                            }
                          />
                          {regeneratingMessageId === message.id
                            ? "Regenerating..."
                            : "Regenerate"}
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="h-9 w-9 shrink-0 rounded-full bg-slate-200 p-2 text-slate-600">
                    <User size={20} />
                  </div>
                )}
              </div>
            );
          })}

          {sending && (
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <Loader2 size={18} className="animate-spin" />
              AI Assistant is thinking...
            </div>
          )}

          {error && (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </p>
          )}
        </div>

        {/* Message Input */}
        <form
          onSubmit={handleSendMessage}
          className="border-t border-slate-200 bg-white p-4"
        >
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask your business assistant..."
              disabled={sending}
              className="min-w-0 flex-1 rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
            />

            <button
              type="submit"
              disabled={sending || !question.trim()}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send size={17} />
              <span className="hidden sm:inline">Send</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Agent;
