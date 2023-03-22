const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const port = 8081;

app.set('json spaces', 2);
app.get('/access.js/', function(req, res) {
    (async () => {
        let url = "";
        let username = req.query.username;
        let password = req.query.password;
        let dates = req.query.dates;
        let hours = req.query.hours;

        //console.log("Opening the browser......");
        const browser = await puppeteer.launch({
            headless: true,
            args: ["--no-sandbox",
                "--disable-setuid-sandbox"
            ],
            'ignoreHTTPSErrors': true
        });

        const page = await browser.newPage();

        await page.goto(url, {
            waitUntil: 'networkidle0'
        });
        await page.type('#username', username);
        await page.type('#password', password);

        await Promise.all([
            page.click(
                'body > div.wrapper > div > div.container > div > div.box > div.column.one > form > div:nth-child(4) > button'
            ),
            page.waitForNavigation({
                waitUntil: 'networkidle0'
            }),
        ]);


        // Select the DUO Account Security frame
        const frame = page.frames().find(f => f.url()
            .startsWith(
                'https://api-feb3be2c.duosecurity.com'
            ));
        let step1;
        if (frame) {
            step1 =
                "Logged in and DUO Page has been loaded.";
        } else {
            step1 =
                "Error! Re-check your credentials.";
        }
        // Click the first authentication method button, wait for user authentication

        let step2;
        await Promise.all([
            await frame.click(
                'input[type=checkbox]'),
            await frame.click('button'),
            step2 =
            "DUO Request sent to user.",
            page.waitForNavigation({
                waitUntil: 'networkidle0'
            }),
        ]);

        const title = await page.title();

        let step3;
        let step4;
        if (title == "Time Sheet Selection") {
            step3 =
                "You have authenticated with DUO and redirected";
            step4 = "Time Sheet page has been loaded";
        } else {
            step3 =
                "Error! DUO Authentication failed.";
        }

        // Select the last timesheet and hit submit.
        await Promise.all([
            await page.click('#djobs_4_id'),
            await page.click(
                'body > div.pagebodydiv > form > p > table > tbody > tr > td > input[type=submit]'
            ),
            page.waitForNavigation({
                waitUntil: 'networkidle0'
            }),
        ]);


        let step5 =
            "Selected and loaded current timesheet";

        let dates_array = dates.split(';');
        let hours_array = hours.split(';');
        let date;
        let hour;
        let timesheet;
        let step6 = [];
        for (let i = 0; i < dates_array.length; i++) {
            date = dates_array[i];
            hour = hours_array[i];
            timesheet = "";

            await Promise.all([
                await page.goto(timesheet, {
                    waitUntil: 'networkidle0'
                }),
                await page.click(
                    'body > div.pagebodydiv > table.datadisplaytable > tbody > tr:nth-child(5) > td > form > table.plaintable > tbody > tr > td:nth-child(1) > input[type=submit]'
                ),
                page.waitForNavigation(),
            ]);
        }

        let json = {
            url: url,
            username: username,
            "Step1": step1,
            "Step2": step2,
            "Step3": step3,
            "Step4": step4,
            "Step5": step5,
            "Step6": step6
        }
        res.send(json);
    })();

    var json = {
        "Error": "Invalid Usage"
    };

});
app.listen(port, function() {
    console.log(`Server running on ${port}`);
})

module.exports = app;