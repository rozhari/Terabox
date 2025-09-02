import express from "express";
import fetch from "node-fetch"; // Node 18+ built-in fetch works too

const app = express();

async function getDirectLink(shareUrl) {
  try {
    const res = await fetch(shareUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
        Referer: "https://www.terabox.com/",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    const html = await res.text();

    const patterns = [
      /"downloadUrl":"(https?:\/\/[^"]+)"/,
      /"direct_link":"(https?:\/\/[^"]+)"/,
      /"dlink":"(https?:\/\/[^"]+)"/,
      /"main_url":"(https?:\/\/[^"]+)"/,
    ];

    for (const p of patterns) {
      const match = html.match(p);
      if (match) return match[1].replace(/\\u0026/g, "&");
    }
  } catch (err) {
    console.error("Error fetching Terabox link:", err);
  }
  return null;
}

// API endpoint
app.get("/api/terabox", async (req, res) => {
  const url = req.query.url;
  if (!url)
    return res.status(400).json({ status: "error", message: "Missing url parameter" });

  const link = await getDirectLink(url);
  if (link) res.json({ status: "success", download_url: link });
  else res.status(404).json({ status: "error", message: "Download link not found" });
});

// Root endpoint
app.get("/", (req, res) => {
  res.send(`
    <h2>📥 Terabox Downloader API</h2>
    <p>Usage: <code>/api/terabox?url=TERABOX_SHARE_LINK</code></p>
  `);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
