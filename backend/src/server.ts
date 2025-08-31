import express, { Request, Response } from "express";
import cors from "cors";

const app = express();

app.use(cors({
  origin: [
    "https://ada-compliance-checker.onrender.com",
    "http://localhost:5173"
  ]
}));
app.use(express.json());

app.post("/api/check", (req: Request, res: Response) => {
  // run ADA checks...
  res.json({ ok: true });
});

app.get("/healthz", (_req: Request, res: Response) => res.send("ok"));

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => console.log(`API running on port ${PORT}`));
