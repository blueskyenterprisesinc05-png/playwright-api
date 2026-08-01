const express = require("express");
const { chromium } = require("playwright");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Playwright API is running");
});

app.get("/version", (req, res) => {
  res.json({
    version: "debug-v1",
    timestamp: new Date().toISOString(),
  });
});

app.post("/submit", async (req, res) => {
  let browser;

  try {
    browser = await chromium.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
      ],
    });

    const page = await browser.newPage();

    console.log("Opening SurveyMars...");

    await page.goto("https://surveymars.com/q/ils9CNDny", {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });

    console.log("Page loaded.");

    const title = await page.title();
    const url = page.url();

    console.log("TITLE:", title);
    console.log("URL:", url);

    // Save screenshot for debugging
    await page.screenshot({
      path: "/tmp/survey.png",
      fullPage: true,
    });

    const html = await page.content();

    console.log("========== HTML PREVIEW ==========");
    console.log(html.substring(0, 5000));
    console.log("==================================");

    res.json({
      success: true,
      title,
      url,
      htmlPreview: html.substring(0, 1000),
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      error: err.message,
    });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
