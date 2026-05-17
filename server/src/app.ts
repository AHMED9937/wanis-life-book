import express, { Request, Response, NextFunction } from "express";
import { prisma } from "./lib/prisma.js";
import { clerkAuth, protectRoute, resolveTenant } from "./middleware/auth.js";
import { residentsRouter } from "./routes/residents.js";
import { storiesRouter } from "./routes/stories.js";
import { ttsRouter } from "./routes/tts.js";

export const app = express();

// JSON middleware
app.use(express.json());

// Health check route
app.get("/api/health", async (_req, res) => {
  try {
    // Check DB connection
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: "ok",
      uptime: process.uptime(),
      db: "connected",
    });
  } catch (error) {
    res.status(503).json({
      status: "error",
      uptime: process.uptime(),
      db: "disconnected",
      message: error instanceof Error ? error.message : "Unknown database error",
    });
  }
});

// Apply authentication middlewares to all subsequent routes
app.use(clerkAuth);
app.use(protectRoute);
app.use(resolveTenant);

// Mount API routers
app.use("/api/residents", residentsRouter);
app.use("/api/stories", storiesRouter);
app.use("/api/tts", ttsRouter);

// Basic Error Handling Middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    error: "Internal Server Error",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});
