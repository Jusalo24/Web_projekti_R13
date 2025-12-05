import express from "express";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    // Example: check database connection or other services
    // await db.query("SELECT 1"); // Uncomment and replace with your DB check

    res.status(200).json({
      status: "OK",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      dependencies: {
        // database: "ok", // set dynamically if you check DB
        // cache: "ok",    // set dynamically if you check cache
      }
    });
  } catch (error) {
    res.status(500).json({
      status: "FAIL",
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
