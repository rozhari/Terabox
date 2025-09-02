import express from "express";
import puppeteer from "puppeteer-core";

const app = express();

async function getDirectLink(shareUrl) {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium-browser",
    });

    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36"
    );

    await page.goto(shareUrl, { waitUntil: "networkidle2", timeout: 120000 });

    // Grab JS-generated download link
    const downloadUrl = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll("script"));
      for (let s of scripts) {
        const match = s.innerText.match(/"downloadUrl":"(https?:\/\/[^"]+)"/);
        if (match) return match[1].replace(/\\u0026/g, "&");
      }
      return null;
    });

    return downloadUrl;
  } catch (err) {
    console.error("Error:", err);
    return null;
  } finally {
    if (browser) await browser.close();
  }
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

// Root
app.get("/", (req, res) => {
  res.send(`<h2>📥 Terabox Downloader API</h2>
            <p>Usage: <code>/api/terabox?url=TERABOX_SHARE_LINK</code></p>`);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
