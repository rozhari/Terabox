import express from "express";
import puppeteer from "puppeteer";

const app = express();

// -------- Function to scrape download link --------
async function getDirectLink(shareUrl) {
  try {
    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      headless: "new",
    });
    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36"
    );

    await page.goto(shareUrl, { waitUntil: "networkidle2", timeout: 60000 });

    // grab full page source
    const content = await page.content();

    // regex patterns to check
    const patterns = [
      /"downloadUrl":"(https?:\/\/[^"]+)"/,
      /"direct_link":"(https?:\/\/[^"]+)"/,
      /"dlink":"(https?:\/\/[^"]+)"/,
      /"main_url":"(https?:\/\/[^"]+)"/,
    ];

    let link = null;
    for (let p of patterns) {
      const match = content.match(p);
      if (match) {
        link = match[1].replace(/\\u0026/g, "&");
        break;
      }
    }

    await browser.close();
    return link;
  } catch (err) {
    console.error("Scraping error:", err);
    return null;
  }
}

// -------- API Endpoint --------
app.get("/api/terabox", async (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).json({ status: "error", message: "Missing url parameter" });
  }

  const link = await getDirectLink(url);
  if (link) {
    res.json({ status: "success", download_url: link });
  } else {
    res.status(404).json({ status: "error", message: "Download link not found" });
  }
});

// -------- Root --------
app.get("/", (req, res) => {
  res.send(`
    <h2>📥 Terabox Downloader API</h2>
    <p>Usage: <code>/api/terabox?url=TERABOX_SHARE_LINK</code></p>
  `);
});

// -------- Start Server --------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
