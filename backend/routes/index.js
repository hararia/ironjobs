var express = require('express');
var router = express.Router();
const { LinkedinScraper, events, IData } = require('linkedin-jobs-scraper');

router.get(`/search-results/:location/:searchTerm`, async function(req, res, next){

   
        // Each scraper instance is associated with one browser.
        // Concurrent queries will run on different pages within the same browser instance.
        const scraper = new LinkedinScraper({
            headless: true,
            // slowMo: 100,
        });
    
        let allData=[]
    
        // Add listeners for scraper events
        scraper.on(events.scraper.data, (data) => {
            console.log(
                // data.description.length,
                // `Query='${data.query}'`,
                // `Location='${data.location}'`,
                // `Title='${data.title}'`,
                // `Company='${data.company}'`,
                // `Place='${data.place}'`,
                // `Date='${data.date}'`,
                // `Link='${data.link}'`,
                // `senorityLevel='${data.senorityLevel}'`,
                // `function='${data.jobFunction}'`,
                // `employmentType='${data.employmentType}'`,
                // `industries='${data.industries}'`,
            );
            allData.push(data)
        });
    
        scraper.on(events.scraper.error, (err) => {
            console.error(err);
        });
        scraper.on(events.scraper.end, () => {
            console.log('All done!');
            console.log(allData)
            console.log(allData.length)
        });
    
        // Add listeners for puppeteer browser events
        scraper.on(events.puppeteer.browser.targetcreated, () => {
        });
        scraper.on(events.puppeteer.browser.targetchanged, () => {
        });
        scraper.on(events.puppeteer.browser.targetdestroyed, () => {
        });
        scraper.on(events.puppeteer.browser.disconnected, () => {
        });
    
        // Custom function executed on browser side to extract job description
        const descriptionProcessor = () => document.querySelector(".description__text")
            .innerText
            .replace(/[\s\n\r]+/g, " ")
            .trim();
    
        // Run queries concurrently
        let jobs = scraper.run(
                req.params.searchTerm,
                req.params.location,
                {
                    paginationMax: 1,
                }
            )
            await jobs
    
        // Close browser
        await scraper.close();
        res.json({message:allData})
    
})

module.exports = router;
