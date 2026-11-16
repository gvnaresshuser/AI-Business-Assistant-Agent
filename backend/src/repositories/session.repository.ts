
import { dbQuery } from "../utils/dbQuery.js";
import { dbTransaction } from "../utils/dbTransaction.js";

export interface AgentSession {
  id: string;
  business_id: string;
  user_id: string;
  session_title: string | null;
  session_status: string | null;
  started_at: Date | null;
  last_activity_at: Date | null;
  ended_at: Date | null;
  metadata: Record<string, unknown> | null;
  created_at: Date | null;
  updated_at: Date | null;
}

// Create a new conversation session
export const createSession = async (
  businessId: string,
  userId: string,
  sessionTitle?: string
): Promise<AgentSession> => {
  const result = await dbQuery<AgentSession>(
    `INSERT INTO agent_sessions_biz_agent (
      business_id,
      user_id,
      session_title
    )
    VALUES ($1, $2, $3)
    RETURNING *`,
    [businessId, userId, sessionTitle ?? "New Conversation"]
  );

  return result.rows[0];
};

// Retrieve a session belonging to a specific business and user
export const getSessionById = async (
  sessionId: string,
  businessId: string,
  userId: string
): Promise<AgentSession | null> => {
  const result = await dbQuery<AgentSession>(
    `SELECT *
     FROM agent_sessions_biz_agent
     WHERE id = $1
       AND business_id = $2
       AND user_id = $3
     LIMIT 1`,
    [sessionId, businessId, userId]
  );

  return result.rows[0] ?? null;
};

// Update the last activity timestamp
export const updateSessionActivity = async (
  sessionId: string,
  businessId: string,
  userId: string
): Promise<void> => {
  await dbQuery(
    `UPDATE agent_sessions_biz_agent
     SET last_activity_at = NOW(),
         updated_at = NOW()
     WHERE id = $1
       AND business_id = $2
       AND user_id = $3
       AND session_status = 'Active'`,
    [sessionId, businessId, userId]
  );
};


// Retrieve all conversations belonging to a user
export const getAllSessionsByUser = async (
  businessId: string,
  userId: string,
  limit = 20,
  offset = 0
): Promise<AgentSession[]> => {
  const result = await dbQuery<AgentSession>(
    `SELECT *
     FROM agent_sessions_biz_agent
     WHERE business_id = $1
      AND user_id = $2
      AND session_status = 'Active'
     ORDER BY last_activity_at DESC NULLS LAST,
              created_at DESC
     LIMIT $3
     OFFSET $4`,
    [businessId, userId, limit, offset]
  );

  return result.rows;
};


// Rename an existing conversation
export const renameSession = async (
  sessionId: string,
  businessId: string,
  userId: string,
  newTitle: string
): Promise<AgentSession | null> => {
  const result = await dbQuery<AgentSession>(
    `UPDATE agent_sessions_biz_agent
     SET session_title = $4,
         updated_at = NOW()
     WHERE id = $1
       AND business_id = $2
       AND user_id = $3
       AND session_status = 'Active'
     RETURNING *`,
    [sessionId, businessId, userId, newTitle]
  );

  return result.rows[0] ?? null;
};



// Archive an existing conversation
export const archiveSession = async (
  sessionId: string,
  businessId: string,
  userId: string
): Promise<AgentSession | null> => {
  const result = await dbQuery<AgentSession>(
    `UPDATE agent_sessions_biz_agent
     SET session_status = 'Archived',
         ended_at = NOW(),
         updated_at = NOW()
     WHERE id = $1
       AND business_id = $2
       AND user_id = $3
       AND session_status = 'Active'
     RETURNING *`,
    [sessionId, businessId, userId]
  );

  return result.rows[0] ?? null;
};


// Restore an archived conversation
export const restoreSession = async (
  sessionId: string,
  businessId: string,
  userId: string
): Promise<AgentSession | null> => {
  const result = await dbQuery<AgentSession>(
    `UPDATE agent_sessions_biz_agent
     SET session_status = 'Active',
         ended_at = NULL,
         last_activity_at = NOW(),
         updated_at = NOW()
     WHERE id = $1
       AND business_id = $2
       AND user_id = $3
       AND session_status = 'Archived'
     RETURNING *`,
    [sessionId, businessId, userId]
  );

  return result.rows[0] ?? null;
};


// Retrieve archived conversations belonging to a user
export const getArchivedSessionsByUser = async (
  businessId: string,
  userId: string,
  limit = 20,
  offset = 0
): Promise<AgentSession[]> => {
  const result = await dbQuery<AgentSession>(
    `SELECT *
     FROM agent_sessions_biz_agent
     WHERE business_id = $1
       AND user_id = $2
       AND session_status = 'Archived'
     ORDER BY ended_at DESC NULLS LAST,
              updated_at DESC
     LIMIT $3
     OFFSET $4`,
    [businessId, userId, limit, offset]
  );

  return result.rows;
};


// Permanently delete a conversation and all its messages
export const deleteSessionPermanently = async (
  sessionId: string,
  businessId: string,
  userId: string
): Promise<boolean> => {
  return dbTransaction(async (client) => {

    // Verify that the session belongs to this business and user
    const sessionResult = await client.query(
      `SELECT id
       FROM agent_sessions_biz_agent
       WHERE id = $1
         AND business_id = $2
         AND user_id = $3
       FOR UPDATE`,
      [sessionId, businessId, userId]
    );

    // Session not found or does not belong to this user
    if (sessionResult.rowCount === 0) {
      return false;
    }

    // Delete all messages associated with this conversation
    await client.query(
      `DELETE FROM agent_messages_biz_agent
       WHERE session_id = $1
         AND business_id = $2`,
      [sessionId, businessId]
    );

    // Permanently delete the conversation session
    await client.query(
      `DELETE FROM agent_sessions_biz_agent
       WHERE id = $1
         AND business_id = $2
         AND user_id = $3`,
      [sessionId, businessId, userId]
    );

    return true;
  });
};
