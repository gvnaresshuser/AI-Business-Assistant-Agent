
import type { Request, Response } from "express";

import { generateAgentResponse } from "../agent/agent.service.js";

import {
  startConversation,
  validateConversationSession,
  saveConversationMessage,
  getConversationHistory,
  refreshConversationActivity,
  getUserConversations,
  getConversationMessages,
  renameConversation,
  archiveConversation,
  restoreConversation,
  getArchivedConversations,
  permanentlyDeleteConversation,
  updateConversationAssistantMessage
} from "../services/session.service.js";
import type {
  AuthenticatedRequestUser
} from "../middleware/auth.middleware.js";


const getAuthContext = (
  req: Request,
  res: Response
): AuthenticatedRequestUser | null => {

  if (!req.user) {
    res.status(401).json({
      success: false,
      message: "Authentication required. Please log in."
    });

    return null;
  }

  return req.user;
};



export const chatWithAgent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const authUser = getAuthContext(req, res);

    if (!authUser) {
      return;
    }
    const { question, sessionId } = req.body;

    // Validate user question
    if (
      typeof question !== "string" ||
      question.trim().length === 0
    ) {
      res.status(400).json({
        success: false,
        message: "Please provide a valid question"
      });
      return;
    }

    // Validate optional session ID
    if (
      sessionId !== undefined &&
      (
        typeof sessionId !== "string" ||
        sessionId.trim().length === 0
      )
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid session ID"
      });
      return;
    }

    // Create a new session or validate the existing session
    const session = sessionId
      ? await validateConversationSession(
          sessionId,
          authUser.businessId,
          authUser.userId
        )
      : await startConversation(
          authUser.businessId,
          authUser.userId,
          question.trim().slice(0, 100)
        );

        // Automatically title an empty conversation using its first question
        if (sessionId && session.session_title === "New Conversation") {
          const existingMessages = await getConversationHistory(
            session.id,
            authUser.businessId,
            authUser.userId
          );

          if (existingMessages.length === 0) {
            await renameConversation(
              session.id,
              authUser.businessId,
              authUser.userId,
              question.trim().slice(0, 100)
            );
          }
        }

    // Save the user's message
    await saveConversationMessage(
      authUser.businessId,
      session.id,
      "User",
      question.trim(),
      authUser.userId
    );

    // Retrieve conversation history
    const conversationHistory = await getConversationHistory(
      session.id,
      authUser.businessId,
      authUser.userId
    );

    // Generate AI response using conversation history
    const answer = await generateAgentResponse(
      question.trim(),
      authUser.businessId,
      conversationHistory.slice(0, -1)
    );

    // Save the assistant's response
    await saveConversationMessage(
      authUser.businessId,
      session.id,
      "Assistant",
      answer
    );

    await refreshConversationActivity(
      session.id,
      authUser.businessId,
      authUser.userId
    );

    res.status(200).json({
      success: true,
      sessionId: session.id,
      question: question.trim(),
      answer
    });

  } catch (error) {
    console.error("AI Agent Error:", error);

    if (
      error instanceof Error &&
      (
        error.message.includes("Conversation session not found") ||
        error.message.includes("not active")
      )
    ) {
      res.status(404).json({
        success: false,
        message: error.message
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Unable to generate AI response"
    });
  }
};

// Create a new conversation session
export const createAgentConversation = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const authUser = getAuthContext(req, res);

    if (!authUser) {
      return;
    }
    const session = await startConversation(
      authUser.businessId,
      authUser.userId,
      "New Conversation"
    );

    res.status(201).json({
      success: true,
      message: "Conversation created successfully",
      data: session
    });

  } catch (error) {
    console.error("Create Conversation Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to create conversation"
    });
  }
};
// Retrieve all conversations for the current user
export const getAgentConversations = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const authUser = getAuthContext(req, res);

    if (!authUser) {
      return;
    }
    const limit = Number(req.query.limit ?? 20);
    const offset = Number(req.query.offset ?? 0);

    if (
      !Number.isInteger(limit) ||
      limit < 1 ||
      limit > 100 ||
      !Number.isInteger(offset) ||
      offset < 0
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid pagination parameters"
      });
      return;
    }

    const conversations = await getUserConversations(
      authUser.businessId,
      authUser.userId,
      limit,
      offset
    );

    res.status(200).json({
      success: true,
      count: conversations.length,
      data: conversations
    });

  } catch (error) {
    console.error("Get Conversations Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to retrieve conversations"
    });
  }
};
// Retrieve messages from a selected conversation
export const getAgentConversationMessages = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const authUser = getAuthContext(req, res);

    if (!authUser) {
      return;
    }
    const sessionId = req.params.sessionId;

    if (typeof sessionId !== "string") {
      res.status(400).json({
        success: false,
        message: "Invalid session ID"
      });
      return;
    }

    const messages = await getConversationMessages(
      sessionId,
      authUser.businessId,
      authUser.userId
    );

    res.status(200).json({
      success: true,
      sessionId,
      count: messages.length,
      data: messages
    });

  } catch (error) {
    console.error("Get Conversation Messages Error:", error);

    if (
      error instanceof Error &&
      error.message.includes("Conversation session not found")
    ) {
      res.status(404).json({
        success: false,
        message: error.message
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Unable to retrieve conversation messages"
    });
  }
};

export const renameAgentConversation = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const authUser = getAuthContext(req, res);

    if (!authUser) {
      return;
    }
    const sessionId = req.params.sessionId;
    const { title } = req.body;

    if (typeof sessionId !== "string") {
      res.status(400).json({
        success: false,
        message: "Invalid session ID"
      });
      return;
    }

    if (
      typeof title !== "string" ||
      title.trim().length === 0 ||
      title.trim().length > 100
    ) {
      res.status(400).json({
        success: false,
        message: "Title must contain 1 to 100 characters"
      });
      return;
    }

    const session = await renameConversation(
      sessionId,
      authUser.businessId,
      authUser.userId,
      title
    );

    res.status(200).json({
      success: true,
      message: "Conversation renamed successfully",
      data: session
    });

  } catch (error) {
    console.error("Rename Conversation Error:", error);

    if (
      error instanceof Error &&
      error.message.includes("Conversation session not found")
    ) {
      res.status(404).json({
        success: false,
        message: error.message
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Unable to rename conversation"
    });
  }
};


export const archiveAgentConversation = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const authUser = getAuthContext(req, res);

    if (!authUser) {
      return;
    }
    const sessionId = req.params.sessionId;

    if (typeof sessionId !== "string") {
      res.status(400).json({
        success: false,
        message: "Invalid session ID"
      });
      return;
    }

    const session = await archiveConversation(
      sessionId,
      authUser.businessId,
      authUser.userId
    );

    res.status(200).json({
      success: true,
      message: "Conversation archived successfully",
      data: session
    });

  } catch (error) {
    console.error("Archive Conversation Error:", error);

    if (
      error instanceof Error &&
      error.message.includes("Conversation session not found")
    ) {
      res.status(404).json({
        success: false,
        message: error.message
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Unable to archive conversation"
    });
  }
};


export const restoreAgentConversation = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const authUser = getAuthContext(req, res);

    if (!authUser) {
      return;
    }
    const sessionId = req.params.sessionId;

    if (typeof sessionId !== "string") {
      res.status(400).json({
        success: false,
        message: "Invalid session ID"
      });
      return;
    }

    const session = await restoreConversation(
      sessionId,
      authUser.businessId,
      authUser.userId
    );

    res.status(200).json({
      success: true,
      message: "Conversation restored successfully",
      data: session
    });

  } catch (error) {
    console.error("Restore Conversation Error:", error);

    if (
      error instanceof Error &&
      error.message.includes("conversation not found")
    ) {
      res.status(404).json({
        success: false,
        message: error.message
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Unable to restore conversation"
    });
  }
};


export const getArchivedAgentConversations = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const authUser = getAuthContext(req, res);

    if (!authUser) {
      return;
    }
    const limit = Number(req.query.limit ?? 20);
    const offset = Number(req.query.offset ?? 0);

    if (
      !Number.isInteger(limit) ||
      limit < 1 ||
      limit > 100 ||
      !Number.isInteger(offset) ||
      offset < 0
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid pagination parameters"
      });
      return;
    }

    const conversations = await getArchivedConversations(
      authUser.businessId,
      authUser.userId,
      limit,
      offset
    );

    res.status(200).json({
      success: true,
      count: conversations.length,
      data: conversations
    });

  } catch (error) {
    console.error("Get Archived Conversations Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to retrieve archived conversations"
    });
  }
};


export const deleteAgentConversation = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const authUser = getAuthContext(req, res);

    if (!authUser) {
      return;
    }
    const sessionId = Array.isArray(req.params.sessionId)
      ? req.params.sessionId[0]
      : req.params.sessionId;

      if (!sessionId) {
        res.status(400).json({
          success: false,
          message: "Session ID is required"
        });
        return;
      }

    await permanentlyDeleteConversation(
      sessionId,
      authUser.businessId,
      authUser.userId
    );

    res.status(200).json({
      success: true,
      message: "Conversation permanently deleted"
    });

  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to delete conversation";

    if (message.includes("not found")) {
      res.status(404).json({
        success: false,
        message
      });
      return;
    }

    console.error("Delete conversation error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to permanently delete conversation"
    });
  }
};

export const regenerateAgentResponse = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const authUser = getAuthContext(req, res);

    if (!authUser) return;

    const sessionId = Array.isArray(req.params.sessionId)
      ? req.params.sessionId[0]
      : req.params.sessionId;

    const messageId = Array.isArray(req.params.messageId)
      ? req.params.messageId[0]
      : req.params.messageId;

    if (!sessionId || !messageId) {
      res.status(400).json({
        success: false,
        message: "Session ID and message ID are required"
      });
      return;
    }

    const history = await getConversationHistory(
      sessionId,
      authUser.businessId,
      authUser.userId
    );

    const messageIndex = history.findIndex(
      (message) => message.id === messageId
    );

    if (
      messageIndex === -1 ||
      history[messageIndex].sender_type !== "Assistant"
    ) {
      res.status(404).json({
        success: false,
        message: "Assistant message not found"
      });
      return;
    }

    // Find the user question immediately before this response
    let userMessageIndex = messageIndex - 1;

    while (
      userMessageIndex >= 0 &&
      history[userMessageIndex].sender_type !== "User"
    ) {
      userMessageIndex--;
    }

    if (userMessageIndex < 0) {
      res.status(400).json({
        success: false,
        message: "Original user question not found"
      });
      return;
    }

    const question = history[userMessageIndex].message_content;

    // Exclude the original question and old answer from prior history
    const previousHistory = history.slice(0, userMessageIndex);

    const newAnswer = await generateAgentResponse(
      question,
      authUser.businessId,
      previousHistory
    );

    const updatedMessage = await updateConversationAssistantMessage(
      sessionId,
      authUser.businessId,
      authUser.userId,
      messageId,
      newAnswer
    );

    res.status(200).json({
      success: true,
      message: "AI response regenerated successfully",
      data: updatedMessage
    });

  } catch (error) {
    console.error("Regenerate AI Response Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to regenerate AI response"
    });
  }
};