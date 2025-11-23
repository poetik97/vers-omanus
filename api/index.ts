// Vercel Serverless Function Entry Point
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "../server/_core/oauth";
import { appRouter } from "../server/routers";
import { createContext } from "../server/_core/context";
import { serveStatic } from "../server/_core/vite";
import superjson from "superjson";

const app = express();

// Configure body parser with larger size limit for file uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Simple health check endpoint
app.get("/api/health", (_req, res) => {
  res.status(200).json({ ok: true, timestamp: Date.now() });
});

// OAuth callback under /api/oauth/callback
registerOAuthRoutes(app);

// tRPC API
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
    transformer: superjson,
  })
);

// Serve static files in production
serveStatic(app);

export default app;
