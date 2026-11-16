
import { executeAgentTool } from "./tool-executor.js";
import { agentTools } from "./agent-tools.js";
import { pool } from "../../config/db.js";
import { ZodError } from "zod";

const BUSINESS_ID = "deb3affe-4468-4c75-9125-187376f1b0f9";

const toolNames = [
  "getSalesSummary",
  "getTopProducts",
  "getTopCustomers",
  "getLowStockProducts",
  "getOutOfStockProducts",
  "getMonthlySales",
  "getCategorySales",
  "getPaymentMethodSummary",
  "getDailySales",
  "getInventoryValuation",
  "getStockMovementSummary",
  "getPurchaseSummary",
  "getVendorPurchases",
  "getExpenseSummary",
  "getRefundSummary"
];

const runToolTests = async (): Promise<void> => {
  console.log("\n======================================");
  console.log(" AI BUSINESS ASSISTANT - TOOL TESTS");
  console.log("======================================");

  let passed = 0;
  let failed = 0;

  try {
    // Test 1: Gemini registry consistency
    console.log("\nTesting: Gemini Tool Registry");

    const registeredToolNames = agentTools.flatMap(
      (tool) => tool.functionDeclarations ?? []
    ).map((declaration) => declaration.name);

    const missingTools = toolNames.filter(
      (name) => !registeredToolNames.includes(name)
    );

    const unexpectedTools = registeredToolNames.filter(
  (name) => name !== undefined && !toolNames.includes(name)
);

    if (
      missingTools.length === 0 &&
      unexpectedTools.length === 0 &&
      registeredToolNames.length === toolNames.length
    ) {
      console.log("Status: PASSED");
      console.log("Registered tools:", registeredToolNames.length);
      passed++;
    } else {
      console.error("Status: FAILED");
      console.error("Missing tools:", missingTools);
      console.error("Unexpected tools:", unexpectedTools);
      console.error("Registered count:", registeredToolNames.length);
      failed++;
    }

    // Test 2: Database connection
    await pool.query("SELECT 1");

    console.log("\nDatabase connection: SUCCESS");
    console.log("Business ID:", BUSINESS_ID);

    // Test 3: All 15 valid tools
    for (const toolName of toolNames) {
      console.log(`\nTesting: ${toolName}`);

      try {
        const result = await executeAgentTool(
          toolName,
          BUSINESS_ID
        );

        console.log("Status: PASSED");
        console.log(
          "Response:",
          JSON.stringify(result, null, 2)
        );

        passed++;
      } catch (error) {
        console.error("Status: FAILED");
        console.error(
          error instanceof Error ? error.message : error
        );

        failed++;
      }
    }

    // Test 4: Invalid business ID
    console.log("\nTesting: Invalid Business ID");

    try {
      await executeAgentTool(
        "getSalesSummary",
        "invalid-business-id"
      );

      console.error("Status: FAILED - Invalid ID was accepted");
      failed++;
    } catch (error) {
      if (error instanceof ZodError) {
        console.log("Status: PASSED - Zod rejected invalid ID");
        passed++;
      } else {
        console.error("Status: FAILED - Unexpected error");
        console.error(error);
        failed++;
      }
    }

    // Test 5: Unknown tool name
    console.log("\nTesting: Unknown Tool Name");

    try {
      await executeAgentTool(
        "getUnknownTool",
        BUSINESS_ID
      );

      console.error("Status: FAILED - Unknown tool was accepted");
      failed++;
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("Unknown or unsupported agent tool")
      ) {
        console.log("Status: PASSED - Unknown tool rejected");
        passed++;
      } else {
        console.error("Status: FAILED - Unexpected error");
        console.error(error);
        failed++;
      }
    }

  } catch (error) {
    console.error("\nTest execution error:", error);
    failed++;
  } finally {
    console.log("\n======================================");
    console.log(" FINAL TEST SUMMARY");
    console.log("======================================");
    console.log("Registry tests: 1");
    console.log("Valid tool tests:", toolNames.length);
    console.log("Negative tests: 2");
    console.log("Total tests:", toolNames.length + 3);
    console.log("Passed:", passed);
    console.log("Failed:", failed);

    await pool.end();
    console.log("\nDatabase connection pool closed.");
  }
};

void runToolTests();
