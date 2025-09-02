import express from "express";
import puppeteer from "puppeteer";

const app = express();
const PORT = process.env.PORT || 8080;

// Home route
app.get("/", (req, res) => {
  res.send("📥 Terabox Downloader API<br>Usage: /api/terabox?url=TERABOX_SHARE_LINK");
});

// Terabox API route
app.get("/api/terabox", async (req, res) => {
  let { url } = req.query;

  // 1. URL check ചെയ്യുക
  if (!url || !url.startsWith("http")) {
    return res.json({ status: "error", message: "Invalid URL" });
  }

  // 2. Mirror fix (1024terabox → terabox)
  url = url.replace("1024terabox.com", "terabox.com");

  try {
    // 3. Puppeteer launch ചെയ്യുക
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();

    // 4. Page open ചെയ്യുക (timeout 60s)
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

    // 5. Download button കാത്തിരിക്കുക
    await page.waitForSelector("a[href*='download']", { timeout: 60000 });

    // 6. Link എടുക്കുക
    const downloadUrl = await page.$eval("a[href*='download']", el => el.href);

    await browser.close();

    // Success response
    res.json({
      status: "success",
      download_url: downloadUrl
    });

  } catch (error) {
    console.error("❌ Error:", error.message);
    res.json({
      status: "error",
      message: "Download link not found"
    });
  }
});

// Server run ചെയ്യുക
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
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
