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

    await page.goto("https://surveymars.com/q/ils9CNDny", {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });

    await page.waitForSelector("input[type='text']", {
      timeout: 30000,
    });

    const inputs = page.locator("input[type='text']");
    const values = Object.values(req.body);

    for (let i = 0; i < values.length && i < await inputs.count(); i++) {
      await inputs.nth(i).fill(String(values[i]));
    }

    const submit = page.getByRole("button", { name: /submit/i });

    if (await submit.count()) {
      await submit.click();
    }

    res.json({
      success: true,
      title: await page.title(),
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  } finally {
    if (browser) await browser.close();
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server started");
});
