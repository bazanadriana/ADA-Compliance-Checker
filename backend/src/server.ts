import express from "express";
import cors from "cors";

const app = express();

// allow requests from your frontend
app.use(cors({
  origin: [
    "https://ada-compliance-checker.onrender.com", // your deployed frontend
    "http://localhost:5173" // local dev
  ]
}));

app.use(express.json());

// your routes go here
app.post("/api/check", (req, res) => {
  // run ADA checks...
  res.json({ ok: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});
