const express = require('express');
const router = express.Router();
const { exec } = require('child_process');

const AllureReporter = require('../util/AllureReporter');
const allureReporter = new AllureReporter();

router.post('/generate-report', async (req, res) => {
    try {
          const allureReportLink = await allureReporter.serveAllureReports();
          console.log('Allure report link:', allureReportLink); // Debug log
          res.json({ reportDirectory: allureReportLink, message: 'Allure report generated' });
        }
        catch (error) {
        console.error('Error generating report:', error);
        res.status(500).json({ error: error.message });
      }
});

router.get('/open-allure-report/:port', async (req, res) => {
    const { port } = req.params;
    const reportUrl = await allureReporter.openAllureReport(port);
    // Return the URL of the opened Allure report
    res.send(reportUrl);
});


// router.get('/:testName', (req, res) => {
//     const { testName } = req.params;
//     const reportDir = `allure-results/${testName}/index.html`;
//     res.json({ reportDir });
// });


module.exports = router;
