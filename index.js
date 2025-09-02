const express = require("express");
const puppeteer = require("puppeteer");

const app = express();
const PORT = process.env.PORT || 3000;

// 🔥 Route
app.get("/api/terabox", async (req, res) => {
  const fileUrl = req.query.url;
  if (!fileUrl) {
    return res.json({ status: "error", message: "No URL provided" });
  }

  let browser;
  try {
    browser = await puppeteer.launch({
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu"
      ],
      headless: true
    });

    const page = await browser.newPage();
    await page.goto(fileUrl, { waitUntil: "networkidle2", timeout: 60000 });

    // wait for download button
    await page.waitForSelector("a[href*='download']", { timeout: 20000 });

    // extract download link
    const downloadLink = await page.evaluate(() => {
      const link = document.querySelector("a[href*='download']");
      return link ? link.href : null;
    });

    if (downloadLink) {
      res.json({ status: "success", url: downloadLink });
    } else {
      res.json({ status: "error", message: "Download link not found" });
    }

  } catch (err) {
    console.error("Error:", err.message);
    res.json({ status: "error", message: err.message });
  } finally {
    if (browser) await browser.close();
  }
});

app.get("/", (req, res) => {
  res.send("📥 Terabox Downloader API<br>Usage: /api/terabox?url=TERABOX_SHARE_LINK");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
