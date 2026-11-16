
import {
  createSession,
  getSessionById,
  updateSessionActivity,
  getAllSessionsByUser,
  renameSession,
  archiveSession,
  restoreSession,
  getArchivedSessionsByUser,
  deleteSessionPermanently
} from "../repositories/session.repository.js";

import {
  createMessage,
  getMessagesBySession,
  updateAssistantMessage
} from "../repositories/message.repository.js";

import type {
  AgentSession
} from "../repositories/session.repository.js";

import type {
  AgentMessage
} from "../repositories/message.repository.js";



// Create a new conversation
export const startConversation = async (
  businessId: string,
  userId: string,
  sessionTitle?: string
): Promise<AgentSession> => {
  return createSession(
    businessId,
    userId,
    sessionTitle
  );
};

// Validate session ownership
export const validateConversationSession = async (
  sessionId: string,
  businessId: string,
  userId: string
): Promise<AgentSession> => {
  const session = await getSessionById(
    sessionId,
    businessId,
    userId
  );

  if (!session) {
    throw new Error("Conversation session not found or access denied");
  }

  if (session.session_status !== "Active") {
    throw new Error("This conversation session is not active");
  }

  return session;
};

// Save a conversation message
export const saveConversationMessage = async (
  businessId: string,
  sessionId: string,
  senderType: AgentMessage["sender_type"],
  messageContent: string,
  userId?: string
): Promise<AgentMessage> => {
  return createMessage(
    businessId,
    sessionId,
    senderType,
    messageContent,
    userId
  );
};

// Retrieve conversation history
export const getConversationHistory = async (
  sessionId: string,
  businessId: string,
  userId: string,
  limit = 50
): Promise<AgentMessage[]> => {
  await validateConversationSession(
    sessionId,
    businessId,
    userId
  );

  const messages = await getMessagesBySession(
    sessionId,
    businessId,
    limit
  );

  await updateSessionActivity(
    sessionId,
    businessId,
    userId
  );

  return messages;
};


// Update conversation activity after a message is saved
export const refreshConversationActivity = async (
  sessionId: string,
  businessId: string,
  userId: string
): Promise<void> => {
  await updateSessionActivity(
    sessionId,
    businessId,
    userId
  );
};


export const getUserConversations = async (
  businessId: string,
  userId: string,
  limit = 20,
  offset = 0
): Promise<AgentSession[]> => {
  return getAllSessionsByUser(
    businessId,
    userId,
    limit,
    offset
  );
};



export const getConversationMessages = async (
  sessionId: string,
  businessId: string,
  userId: string,
  limit = 100
): Promise<AgentMessage[]> => {

  // Verify that this session belongs to the requesting user
  const session = await getSessionById(
    sessionId,
    businessId,
    userId
  );

  if (!session) {
    throw new Error("Conversation session not found or access denied");
  }

  // Retrieve messages, including archived conversations
  return getMessagesBySession(
    sessionId,
    businessId,
    limit
  );
};


export const renameConversation = async (
  sessionId: string,
  businessId: string,
  userId: string,
  newTitle: string
): Promise<AgentSession> => {

  const title = newTitle.trim();

  if (title.length === 0 || title.length > 100) {
    throw new Error(
      "Conversation title must contain 1 to 100 characters"
    );
  }

  const session = await renameSession(
    sessionId,
    businessId,
    userId,
    title
  );

  if (!session) {
    throw new Error(
      "Conversation session not found or cannot be renamed"
    );
  }

  return session;
};


export const archiveConversation = async (
  sessionId: string,
  businessId: string,
  userId: string
): Promise<AgentSession> => {

  const session = await archiveSession(
    sessionId,
    businessId,
    userId
  );

  if (!session) {
    throw new Error(
      "Conversation session not found or cannot be archived"
    );
  }

  return session;
};


export const restoreConversation = async (
  sessionId: string,
  businessId: string,
  userId: string
): Promise<AgentSession> => {

  const session = await restoreSession(
    sessionId,
    businessId,
    userId
  );

  if (!session) {
    throw new Error(
      "Archived conversation not found or cannot be restored"
    );
  }

  return session;
};


export const getArchivedConversations = async (
  businessId: string,
  userId: string,
  limit = 20,
  offset = 0
): Promise<AgentSession[]> => {
  return getArchivedSessionsByUser(
    businessId,
    userId,
    limit,
    offset
  );
};


export const permanentlyDeleteConversation = async (
  sessionId: string,
  businessId: string,
  userId: string
): Promise<void> => {
  const deleted = await deleteSessionPermanently(
    sessionId,
    businessId,
    userId
  );

  if (!deleted) {
    throw new Error(
      "Conversation not found or you do not have permission to delete it"
    );
  }
};

// Update an existing assistant response
export const updateConversationAssistantMessage = async (
  sessionId: string,
  businessId: string,
  userId: string,
  messageId: string,
  messageContent: string
): Promise<AgentMessage> => {
  await validateConversationSession(
    sessionId,
    businessId,
    userId
  );

  const updatedMessage = await updateAssistantMessage(
    messageId,
    sessionId,
    businessId,
    messageContent
  );

  await refreshConversationActivity(
    sessionId,
    businessId,
    userId
  );

  return updatedMessage;
};