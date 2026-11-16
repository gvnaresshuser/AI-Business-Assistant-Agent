
import { dbQuery } from "../utils/dbQuery.js";

export interface AgentMessage {
  id: string;
  business_id: string;
  session_id: string;
  user_id: string | null;
  sender_type: "User" | "Assistant" | "System" | "Tool";
  message_content: string;
  message_metadata: Record<string, unknown> | null;
  created_at: Date | null;
}

// Save a conversation message
export const createMessage = async (
  businessId: string,
  sessionId: string,
  senderType: AgentMessage["sender_type"],
  messageContent: string,
  userId?: string,
  messageMetadata: Record<string, unknown> = {}
): Promise<AgentMessage> => {
  const result = await dbQuery<AgentMessage>(
    `INSERT INTO agent_messages_biz_agent (
      business_id,
      session_id,
      user_id,
      sender_type,
      message_content,
      message_metadata
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *`,
    [
      businessId,
      sessionId,
      userId ?? null,
      senderType,
      messageContent,
      JSON.stringify(messageMetadata)
    ]
  );

  return result.rows[0];
};

// Retrieve conversation history
export const getMessagesBySession = async (
  sessionId: string,
  businessId: string,
  limit = 50
): Promise<AgentMessage[]> => {
  const result = await dbQuery<AgentMessage>(
    `SELECT
      id,
      business_id,
      session_id,
      user_id,
      sender_type,
      message_content,
      message_metadata,
      created_at
    FROM agent_messages_biz_agent
    WHERE session_id = $1
      AND business_id = $2
    ORDER BY created_at DESC, id DESC
    LIMIT $3`,
    [sessionId, businessId, limit]
  );

  // Return messages in chronological order
  return result.rows.reverse();
};

// Retrieve the latest message
export const getLatestMessage = async (
  sessionId: string,
  businessId: string
): Promise<AgentMessage | null> => {
  const result = await dbQuery<AgentMessage>(
    `SELECT *
     FROM agent_messages_biz_agent
     WHERE session_id = $1
       AND business_id = $2
     ORDER BY created_at DESC, id DESC
     LIMIT 1`,
    [sessionId, businessId]
  );

  return result.rows[0] ?? null;
};

// Update an existing assistant response
export const updateAssistantMessage = async (
  messageId: string,
  sessionId: string,
  businessId: string,
  messageContent: string
): Promise<AgentMessage> => {
  const result = await dbQuery<AgentMessage>(
    `UPDATE agent_messages_biz_agent
     SET message_content = $1
     WHERE id = $2
       AND session_id = $3
       AND business_id = $4
       AND sender_type = 'Assistant'
     RETURNING *`,
    [messageContent, messageId, sessionId, businessId]
  );

  if (result.rows.length === 0) {
    throw new Error("Assistant message not found");
  }

  return result.rows[0];
};