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

    const page = await browser.newPage({
      viewport: { width: 1366, height: 768 },
    });

    page.setDefaultTimeout(90000);

    console.log("Opening survey...");

    await page.goto("https://surveymars.com/q/yDmVhJUMu", {
      waitUntil: "domcontentloaded",
      timeout: 90000,
    });

    //
    // Wait for Cloudflare challenge
    //
    console.log("Waiting for Cloudflare...");

    await page.waitForFunction(() => {
      return (
        !document.title.includes("Just a moment") &&
        !document.body.innerText.includes("Checking your browser")
      );
    }, { timeout: 120000 });

    console.log("Cloudflare passed.");

    //
    // Wait for vote options
    //
    await page.waitForSelector(
      "input[type=radio], .jq-option, .answer-option",
      {
        timeout: 90000,
      }
    );

    console.log("Vote options found.");

    //
    // Find the candidate from request JSON
    //
    const candidate = req.body.candidate;

    if (!candidate) {
      throw new Error("candidate field missing");
    }

    const locator = page.locator(`text="${candidate}"`);

    await locator.first().click();

    console.log("Candidate selected.");

    //
    // Submit
    //
    const submitButton = page.locator(
      'button:has-text("Submit"), button:has-text("Vote"), input[type=submit]'
    );

    await submitButton.first().click();

    console.log("Submitted.");

    //
    // Wait for success page
    //
    await page.waitForURL(/complete/, {
      timeout: 90000,
    });

    res.json({
      success: true,
      url: page.url(),
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

app.get("/", (_, res) => {
  res.send("Playwright API Running");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});
