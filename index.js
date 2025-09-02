import express from "express";
import puppeteer from "puppeteer-core";

const app = express();
const PORT = process.env.PORT || 3000;

async function getDownloadLink(shareUrl) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium-browser"
  });

  const page = await browser.newPage();
  await page.goto(shareUrl, { waitUntil: "networkidle2", timeout: 0 });

  try {
    // wait for download button
    await page.waitForSelector("a[aria-label='Download']", { timeout: 10000 });
    const link = await page.$eval("a[aria-label='Download']", el => el.href);

    await browser.close();

    if (link && link.startsWith("http")) {
      return { status: "success", download_url: link };
    } else {
      return { status: "error", message: "Download link not found" };
    }
  } catch (err) {
    await browser.close();
    return { status: "error", message: "Download link not found" };
  }
}

app.get("/", (req, res) => {
  res.send("📥 Terabox Downloader API<br>Usage: /api/terabox?url=TERABOX_SHARE_LINK");
});

app.get("/api/terabox", async (req, res) => {
  const { url } = req.query;
  if (!url) {
    return res.json({ status: "error", message: "Missing URL parameter" });
  }

  const result = await getDownloadLink(url);
  res.json(result);
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
