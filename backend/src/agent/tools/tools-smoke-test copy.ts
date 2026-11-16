
import { executeAgentTool } from "./tool-executor.js";
import { pool } from "../../config/db.js";

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

/* const toolNames = [
  "getPurchaseSummary"
]; */

const runToolTests = async (): Promise<void> => {
  console.log("\n======================================");
  console.log(" AI BUSINESS ASSISTANT - TOOL TESTS");
  console.log("======================================");

  try {
    // Verify the database connection first
    await pool.query("SELECT 1");

    console.log("\nDatabase connection: SUCCESS");
    console.log("Business ID:", BUSINESS_ID);

    let passed = 0;
    let failed = 0;

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
          error instanceof Error
            ? error.message
            : error
        );

        failed++;
      }
    }

    console.log("\n======================================");
    console.log(" TEST SUMMARY");
    console.log("======================================");
    console.log("Total tools:", toolNames.length);
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
