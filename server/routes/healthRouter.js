import express from "express";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    // Example: add dependency checks if needed
    // await db.query("SELECT 1");

    res.status(200).json({
      status: "OK",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      dependencies: {
        // database: "ok",
        // cache: "ok"
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
