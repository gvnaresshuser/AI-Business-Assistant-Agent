
import api from "./axios";

// Conversation session
export interface AgentConversation {
  id: string;
  business_id: string;
  user_id: string;
  session_title: string | null;
  session_status: string | null;
  started_at: string | null;
  last_activity_at: string | null;
  ended_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

// Conversation message
export interface AgentMessage {
  id: string;
  session_id: string;
  sender_type: "User" | "Assistant" | "System" | "Tool";
  message_content: string;
  created_at: string | null;
}

// Create conversation
export const createConversationApi = async () => {
  const response = await api.post(
    "/agent/conversations"
  );

  return response.data.data as AgentConversation;
};

// Get conversations
export const getConversationsApi = async () => {
  const response = await api.get(
    "/agent/conversations"
  );

  return response.data.data as AgentConversation[];
};

// Get conversation messages
export const getConversationMessagesApi = async (
  sessionId: string
) => {
  const response = await api.get(
    `/agent/conversations/${sessionId}/messages`
  );

  return response.data.data as AgentMessage[];
};

// Send message to AI Agent
export const sendAgentMessageApi = async (
  question: string,
  sessionId?: string
) => {
  const response = await api.post(
    "/agent/chat",
    {
      question,
      sessionId
    }
  );

  return response.data as {
    success: boolean;
    sessionId: string;
    question: string;
    answer: string;
  };
};

export const renameConversationApi = async (
  sessionId: string,
  title: string
) => {
  const response = await api.patch(
    `/agent/conversations/${sessionId}`,
    { title }
  );

  return response.data.data as AgentConversation;
};
export const archiveConversationApi = async (sessionId: string) => {
  const response = await api.patch(
    `/agent/conversations/${sessionId}/archive`
  );

  return response.data;
};

export const getArchivedConversationsApi = async () => {
  const response = await api.get("/agent/conversations/archived");

  return response.data.data as AgentConversation[];
};

export const restoreConversationApi = async (sessionId: string) => {
  const response = await api.patch(
    `/agent/conversations/${sessionId}/restore`
  );

  return response.data;
};
export const deleteConversationApi = async (sessionId: string) => {
  const response = await api.delete(
    `/agent/conversations/${sessionId}`
  );

  return response.data;
};
export const regenerateAgentResponseApi = async (
  sessionId: string,
  messageId: string
) => {
  const response = await api.post(
    `/agent/conversations/${sessionId}/messages/${messageId}/regenerate`
  );

  return response.data.data as AgentMessage;
};