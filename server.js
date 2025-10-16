import express from "express";
import fetch from "node-fetch";

app.use((req, res, next) => {
  console.log("📩 Incoming request:", req.method, req.url, new Date().toISOString());
  next();
});


const app = express();
app.use(express.json());

// --- dein Secret zum Prüfen (optional) ---
const SECRET = "wsec_74825321fb7875e6a8e8df77d4cf767766b9ed07e5c8ace03d044b8dfff72157";

// --- Webhook-Route, die ElevenLabs aufruft ---
app.post("/klara", async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (auth !== `Bearer ${SECRET}`) {
      console.warn("❌ Ungültiger Token:", auth);
      return res.status(403).json({ error: "Unauthorized" });
    }

    console.log("✅ Payload erhalten:", req.body);

    // --- an dein n8n-Webhook weiterleiten ---
    const forward = await fetch(
      "https://aleexnvak.app.n8n.cloud/webhook/klara-calls",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req.body),
      }
    );

    console.log("➡️ Weitergeleitet an n8n:", forward.status);
    res.status(200).json({ ok: true, forwardedStatus: forward.status });
  } catch (err) {
    console.error("🔥 Fehler beim Weiterleiten:", err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy läuft auf Port ${PORT}`));


