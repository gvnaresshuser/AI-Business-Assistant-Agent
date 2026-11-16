
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
    // Create conversation
    const session = await startConversation(
      BUSINESS_ID,
      ADMIN_USER_ID,
      "Multi-Turn Conversation Test"
    );

    sessionId = session.id;

    console.log("PASS: Conversation created");

    // First question
    await saveConversationMessage(
      BUSINESS_ID,
      session.id,
      "User",
      "What are our total sales?",
      ADMIN_USER_ID
    );

    // First simulated answer
    await saveConversationMessage(
      BUSINESS_ID,
      session.id,
      "Assistant",
      "Total sales are ₹30,23,24,537.20 across 1,500 orders."
    );

    // Second question
    await saveConversationMessage(
      BUSINESS_ID,
      session.id,
      "User",
      "How many orders contributed to those sales?",
      ADMIN_USER_ID
    );

    // Second simulated answer
    await saveConversationMessage(
      BUSINESS_ID,
      session.id,
      "Assistant",
      "There were 1,500 orders."
    );

    console.log("PASS: Two conversation turns saved");

    // Retrieve complete conversation
    const history = await getConversationHistory(
      session.id,
      BUSINESS_ID,
      ADMIN_USER_ID
    );

    assert.equal(history.length, 4);

    assert.equal(history[0].sender_type, "User");
    assert.equal(history[1].sender_type, "Assistant");
    assert.equal(history[2].sender_type, "User");
    assert.equal(history[3].sender_type, "Assistant");

    assert.equal(
      history[0].message_content,
      "What are our total sales?"
    );

    assert.equal(
      history[2].message_content,
      "How many orders contributed to those sales?"
    );

    console.log("PASS: Four messages retrieved in correct order");

    // Verify previous conversation is available
    assert.ok(
      history[1].message_content.includes("1,500 orders")
    );

    console.log("PASS: Previous assistant response is available");

    // Verify session ownership
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

    console.log("PASS: Session ownership validation");

    console.log("\nAll multi-turn conversation tests passed!");

  } catch (error) {
    console.error("Conversation test failed:", error);
    process.exitCode = 1;

  } finally {
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
