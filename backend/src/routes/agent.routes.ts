
import { Router } from "express";

import {
  chatWithAgent,
  createAgentConversation,
  getAgentConversations,
  getAgentConversationMessages,
  renameAgentConversation,
  archiveAgentConversation,
  restoreAgentConversation,
  getArchivedAgentConversations,
  deleteAgentConversation,
  regenerateAgentResponse
} from "../controllers/agent.controller.js";

const router = Router();

// Create a new conversation
router.post("/conversations", createAgentConversation);

// List all conversations
router.get("/conversations", getAgentConversations);

// List archived conversations
router.get(
  "/conversations/archived",
  getArchivedAgentConversations
);

// Retrieve messages for a conversation
router.get(
  "/conversations/:sessionId/messages",
  getAgentConversationMessages
);

// Rename an existing conversation
router.patch(
  "/conversations/:sessionId",
  renameAgentConversation
);

// Archive an existing conversation
router.patch(
  "/conversations/:sessionId/archive",
  archiveAgentConversation
);

// Restore an archived conversation
router.patch(
  "/conversations/:sessionId/restore",
  restoreAgentConversation
);

router.delete(
  "/conversations/:sessionId",
  deleteAgentConversation
);

// Regenerate an existing AI response
router.post(
  "/conversations/:sessionId/messages/:messageId/regenerate",
  regenerateAgentResponse
);

// Send a message to the AI Agent
router.post("/chat", chatWithAgent);

export default router;
