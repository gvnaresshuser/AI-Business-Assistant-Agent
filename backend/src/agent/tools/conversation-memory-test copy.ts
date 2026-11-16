
import assert from "node:assert/strict";

import { pool } from "../../config/db.js";

import {
  startConversation,
  validateConversationSession,
  saveConversationMessage,
  getConversationHistory
} from "../../services/session.service.js";

const BUSINESS_ID = "deb3affe-4468-4c75-9125-187376f1b0f9";

const ADMIN_USER_ID = "bba6574d-6aec-4165-9211-3894a7afacc4";

const OTHER_USER_ID = "b695b92a-adcc-46c4-a052-26ba39417282";

const runTest = async (): Promise<void> => {
  let sessionId: string | undefined;

  try {
    // Test 1: Create a conversation
    const session = await startConversation(
      BUSINESS_ID,
      ADMIN_USER_ID,
      "Conversation Memory Test"
    );

    sessionId = session.id;

    assert.ok(session.id);
    console.log("PASS: Conversation session created");

    // Test 2: Save user message
    await saveConversationMessage(
      BUSINESS_ID,
      session.id,
      "User",
      "What are my total sales?",
      ADMIN_USER_ID
    );

    console.log("PASS: User message saved");

    // Test 3: Save assistant message
    await saveConversationMessage(
      BUSINESS_ID,
      session.id,
      "Assistant",
      "Your total sales are ₹30,23,24,537.20."
    );

    console.log("PASS: Assistant message saved");

    // Test 4: Retrieve conversation history
    const history = await getConversationHistory(
      session.id,
      BUSINESS_ID,
      ADMIN_USER_ID
    );

    assert.equal(history.length, 2);
    assert.equal(history[0].sender_type, "User");
    assert.equal(history[1].sender_type, "Assistant");

    console.log("PASS: Conversation history retrieved in order");

    // Test 5: Validate session ownership
    let accessDenied = false;

    try {
      await validateConversationSession(
        session.id,
        BUSINESS_ID,
        OTHER_USER_ID
      );
    } catch {
      accessDenied = true;
    }

    assert.equal(accessDenied, true);

    console.log("PASS: Another user cannot access this session");

    console.log("\nAll conversation memory tests passed!");

  } catch (error) {
    console.error("Conversation memory test failed:", error);
    process.exitCode = 1;

  } finally {
    // Remove temporary test data
    if (sessionId) {
      await pool.query(
        `DELETE FROM agent_messages_biz_agent
         WHERE session_id = $1`,
        [sessionId]
      );

      await pool.query(
        `DELETE FROM agent_sessions_biz_agent
         WHERE id = $1`,
        [sessionId]
      );

      console.log("Temporary test data cleaned up");
    }

    await pool.end();
  }
};

void runTest();
