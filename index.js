const express = require("express");
const { chromium } = require("playwright");

const app = express();

app.use(express.json());

app.post("/submit", async (req, res) => {
  const data = req.body;

  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  try {
    await page.goto("https://surveymars.com/q/ils9CNDny", {
      waitUntil: "networkidle",
    });

    const inputs = page.locator('input[type="text"]');
    const count = await inputs.count();

    const values = Object.values(data);

    for (let i = 0; i < count && i < values.length; i++) {
      await inputs.nth(i).fill(values[i] ?? "");
    }

    await page.getByRole("button", { name: /submit/i }).click();

    await page.waitForTimeout(3000);

    await browser.close();

    res.json({
      success: true,
      filled: count,
    });
  } catch (err) {
    await browser.close();

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

app.listen(process.env.PORT || 3000);
