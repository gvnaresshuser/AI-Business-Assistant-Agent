
import { executeAgentTool } from "./tool-executor.js";
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
    await pool.query("SELECT 1");

    console.log("\nDatabase connection: SUCCESS");
    console.log("Business ID:", BUSINESS_ID);

    // Test all 15 valid tools
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

    // Negative Test 1: Invalid business ID
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

    // Negative Test 2: Unknown tool name
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

    console.log("\n======================================");
    console.log(" FINAL TEST SUMMARY");
    console.log("======================================");
    console.log("Valid tool tests:", toolNames.length);
    console.log("Negative tests: 2");
    console.log("Total tests:", toolNames.length + 2);
    console.log("Passed:", passed);
    console.log("Failed:", failed);

  } catch (error) {
    console.error("\nDatabase connection failed:", error);
  } finally {
    await pool.end();
    console.log("\nDatabase connection pool closed.");
  }
};

void runToolTests();
