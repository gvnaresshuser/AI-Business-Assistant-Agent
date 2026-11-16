
import app from "./app.js";
import { env } from "./config/env.js";
import { pool, testDatabaseConnection } from "./config/db.js";

const startServer = async (): Promise<void> => {
  try {
    await testDatabaseConnection();

    const server = app.listen(env.PORT, () => {
      console.log(`Server running at http://localhost:${env.PORT}`);
    });

    const shutdown = async (): Promise<void> => {
      console.log("Shutting down server...");

      server.close(async () => {
        await pool.end();
        process.exit(0);
      });
    };

    process.on("SIGINT", () => void shutdown());
    process.on("SIGTERM", () => void shutdown());

  } catch (error) {
    console.error("Unable to start server:", error);
    await pool.end();
    process.exit(1);
  }
};

void startServer();
