const openaiAPI = require('../utils/openai-api');
const testRunner = require('../utils/testRunner');
const allureReporter = require('../utils/allureReporter');

let testName;
exports.generateTest = async (req, res) => {
    try {
        const { testDescription, framework, testTool, includeVideo, includeScreenshots } = req.body;
        const testCode = await openaiAPI.generateTestCode(testDescription, framework, testTool, includeVideo, includeScreenshots);
        testName = `${await openaiAPI.generateTestName(testDescription)}_${framework}_${testTool}`;
        const testResult = await testRunner.createTest(testCode, testName, testTool, framework);
        const reportUrl = await allureReporter.generateReport(testResult);
        res.json({ reportUrl });
    } catch (error) {
        res.status(500).send(error.message);
    }
};


exports.getReport = async (req, res) => {
    const reportDir = await allureReporter.generateReport();
    res.sendFile(path.join(reportDir, 'index.html'));
};

exports.getTestName = () => {
    return testName;
};
