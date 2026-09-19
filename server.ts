import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { runGeminiAudit, runDeterministicAudit } from "./server/auditEngine.js";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON payload parser
  app.use(express.json({ limit: "15mb" }));

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      engine: "DevTrace AI Engine",
      edition: "HackDevengers 2.0",
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY"),
    });
  });

  app.post("/api/audit", async (req, res) => {
    try {
      const { code, fileName } = req.body || {};

      if (!code || typeof code !== "string" || code.trim().length === 0) {
        return res.status(400).json({
          error: "NO_CODE_PROVIDED",
          message: "Please paste your package.json, requirements.txt, or GitHub file tree.",
        });
      }

      const report = await runGeminiAudit(code, fileName || "manifest_or_code.txt");
      return res.json(report);
    } catch (err: any) {
      console.error("Error running audit:", err);
      // Fallback deterministic audit
      const code = req.body?.code || "";
      const fileName = req.body?.fileName || "source";
      const fallbackReport = runDeterministicAudit(code, fileName);
      return res.json(fallbackReport);
    }
  });

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`DevTrace AI Engine server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
