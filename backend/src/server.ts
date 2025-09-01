import express, { Request, Response } from "express";
import cors, { CorsOptions } from "cors";
import { checkHtml } from "./utils/checker";




const app = express();

// CORS (use your current config that reads FRONTEND_ORIGIN)
const envOrigins = (process.env.FRONTEND_ORIGIN ?? "").split(",").map(s => s.trim()).filter(Boolean);
const allowed = new Set<string>([...envOrigins, "http://localhost:5173"]);
const corsOptions: CorsOptions = {
  origin(origin, cb) {
    if (!origin || allowed.has(origin)) return cb(null, true);
    cb(new Error(`Origin ${origin} not allowed by CORS`));
  },
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.disable("x-powered-by");
app.use(express.json({ limit: "1mb" }));

app.get("/healthz", (_req: Request, res: Response) => res.send("ok"));

app.post("/api/check", (req: Request, res: Response) => {
  const { html } = req.body ?? {};
  if (typeof html !== "string" || html.trim() === "") {
    return res.status(400).json({ error: "Body must be JSON with { html: string }" });
  }
  try {
    const result = checkHtml(html);
    return res.json(result); // => { issues: [...] }
  } catch (err) {
    console.error("check error:", err);
    return res.status(500).json({ error: "Failed to analyze HTML" });
  }
});

const PORT = Number(process.env.PORT ?? 3000);
app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
  console.log(`Allowed origins: ${Array.from(allowed).join(", ")}`);
});

export default app;
