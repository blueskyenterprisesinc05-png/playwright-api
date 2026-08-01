const express = require("express");
const { chromium } = require("playwright");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    status: "running",
    service: "Playwright API"
  });
});

app.post("/test", async (req, res) => {
  let browser;

  try {
    browser = await chromium.launch({
      headless: true
    });

    const page = await browser.newPage();

    await page.goto("https://example.com", {
      waitUntil: "networkidle"
    });

    const title = await page.title();

    await browser.close();

    res.json({
      success: true,
      title
    });

  } catch (error) {

    if (browser) {
      await browser.close();
    }

    res.status(500).json({
      success: false,
      error: error.message
    });

  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Playwright API running on port ${PORT}`);
});
