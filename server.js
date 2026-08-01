const express = require("express");
const { chromium } = require("playwright");

const app = express();

app.use(express.json());

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

    // Load the survey
    await page.goto("https://surveymars.com/q/ils9CNDny", {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });

    // Wait for the form to appear
    await page.waitForSelector('input[type="text"]', {
      timeout: 30000,
    });

    const inputs = page.locator('input[type="text"]');
    const count = await inputs.count();

    const values = Object.values(req.body);

    for (let i = 0; i < count && i < values.length; i++) {
      await inputs.nth(i).fill(String(values[i] ?? ""));
    }

    // Click Submit if it exists
    const submitButton = page.getByRole("button", {
      name: /submit/i,
    });

    if ((await submitButton.count()) > 0) {
      await submitButton.click();
    }

    await page.waitForTimeout(3000);

    res.json({
      success: true,
      title: await page.title(),
      filled: Math.min(count, values.length),
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
