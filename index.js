import express from "express";
import puppeteer from "puppeteer-core";

const app = express();

async function getDirectLink(shareUrl) {
  try {
    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium-browser",
      headless: "new"
    });

    const page = await browser.newPage();
    await page.goto(shareUrl, { waitUntil: "networkidle2", timeout: 60000 });

    const content = await page.content();
    const patterns = [
      /"downloadUrl":"(https?:\/\/[^"]+)"/,
      /"direct_link":"(https?:\/\/[^"]+)"/,
      /"dlink":"(https?:\/\/[^"]+)"/,
      /"main_url":"(https?:\/\/[^"]+)"/
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
