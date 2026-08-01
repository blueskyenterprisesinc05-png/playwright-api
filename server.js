const express = require("express");
const { chromium } = require("playwright");

const app = express();

app.use(express.json());

app.post("/survey", async (req, res) => {

    const answers = req.body.answers;

    const browser = await chromium.launch({
        headless: true
    });

    const page = await browser.newPage();

    await page.goto("https://surveymars.com/q/ils9CNDny");

    // we'll fill the form later

    await browser.close();

    res.json({
        success: true
    });

});

app.listen(3000);
