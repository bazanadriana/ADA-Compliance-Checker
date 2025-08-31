import express, { Request, Response } from "express";
import cors, { CorsOptions } from "cors";

const app = express();

/**
 * Allowed origins:
 * - Set FRONTEND_ORIGIN in Render to your Netlify site, e.g.
 *   https://ada-compliance-checker.netlify.app
 * - Local dev is always allowed.
 */
const envOrigins = (process.env.FRONTEND_ORIGIN ?? process.env.ALLOW_ORIGINS ?? "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

const allowedOrigins = new Set<string>([
  ...envOrigins,
  "http://localhost:5173",
]);

const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true); // allow curl/postman/no-origin
    if (allowedOrigins.has(origin)) return callback(null, true);
    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
  optionsSuccessStatus: 204,
  credentials: false,
};

// CORS + preflight first
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// Hardening & parsing
app.disable("x-powered-by");
app.use(express.json({ limit: "1mb" }));
app.use((_req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});

// Health check for Render
app.get("/healthz", (_req: Request, res: Response) => res.status(200).send("ok"));

// Main API
app.post("/api/check", (req: Request, res: Response) => {
  const { html } = req.body ?? {};
  if (typeof html !== "string" || html.trim() === "") {
    return res.status(400).json({ error: "Body must be JSON with { html: string }" });
  }

  // TODO: plug in your actual ADA rules engine.
  // Return structure kept stable for the frontend.
  const issues: Array<{
    rule: string;
    message: string;
    selector: string;
    snippet?: string;
  }> = [];

  return res.json({ issues });
});

// Start server
const PORT = Number(process.env.PORT ?? 3000);
app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
  console.log(
    `Allowed origins: ${Array.from(allowedOrigins).join(", ") || "(none)"}`
  );
});

export default app;
