const express = require('express');
const { check } = require('express-validator');
const fs = require('fs');
const { exec, execPromise } = require('child_process');
const path = require('path');

const testsControllers = require('../controllers/tests-controllers');
const router = express.Router();
const OpenAIAPI = require('../util/OpenAIAPI');
const openai = new OpenAIAPI();
const testRunner = require('../util/testRunner');
const Test = require('../models/test');
const AllureReporter = require('../util/AllureReporter');
const allureReporter = new AllureReporter();

// In-memory storage for report statuses and logs
const reportStatuses = {};
const testLogs = {};

router.get('/:tid', testsControllers.getTestById);

router.get('/user/:uid', testsControllers.getTestsByUserId);


router.patch(
  '/:tid',
  [
    check('name')
      .not()
      .isEmpty(),
    check('description').isLength({ min: 5 }),
    check('content')
      .not()
      .isEmpty()
  ],
  testsControllers.updateTest
);


router.post(
  '/save-test',
  [
    check('name')
      .not()
      .isEmpty(),
    check('description').isLength({ min: 5 }),
    check('content')
      .not()
      .isEmpty()
  ],
  testsControllers.createTest

);
router.post('/generate-test', async (req, res) => {
  try {

    const testsPath = path.join(__dirname, '../../tests');
    fs.mkdirSync(testsPath, { recursive: true });

    const { name, description, framework, testLanguage, includeVideo, includeScreenshots } = req.body;
    const testCode = await openai.generateTestCode(description, framework, testLanguage, includeVideo, includeScreenshots);
    // const name = await openai.generateTestName(testDescription);
    const testResult = await testRunner.createTestFile(testCode, name, testLanguage, framework);
    // //save test data to DB
    // [
    //   check('name')
    //     .not()
    //     .isEmpty(),
    //   check('description').isLength({ min: 5 }),
    //   check('content')
    //     .not()
    //     .isEmpty()
    // ],
    // await testsControllers.createTest(req);
    res.json({ testResult, name, testCode });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Endpoint to get test file content
router.get('content/:tid', async (req, res) => {
  const filepath = path.join(__dirname, '../../tests', req.params.filename);
  fs.readFile(filepath, 'utf8', (err, data) => {
    if (err) {
      return res.status(404).send('File not found');
    }
    res.setHeader('Content-Type', 'application/json');
    res.send({ content: data });
  });
});


// Endpoint to update test file content
router.put('/:filename', async (req, res) => {
  const filepath = path.join(__dirname, '../../tests', req.params.filename);
  const content = req.body.content;
  fs.writeFile(filepath, content, 'utf8', (err) => {
    if (err) {
      return res.status(500).send('Failed to save the file');
    }
    res.send('File updated successfully');
  });
});

// Endpoint to delete a test file
// router.delete('/:tid', testsControllers.deleteTest);
router.delete('/:tid', async (req, res) => {
  const test = await Test.findById(req.params.tid);
  const testExtension = test.framework === 'Playwright' ? '.spec.js' : '.js'
  const filepath = path.join(__dirname, '../../tests', test.name + testExtension);
  fs.unlink(filepath, (err) => {
    if (err) {
      return res.status(500).send('Failed to delete the file');
    }
    console.log("Test File deleted :" + filepath);
  });
  await testsControllers.deleteTest(req);
  res.status(200).json({ message: `Deleted test: ${test.name}` });
});




router.get('/run-test/:tid', async (req, res) => {
  const test = await Test.findById(req.params.tid);
  let testFileExtention;
  if (test.testLanguage === 'Python') {
    testFileExtention = '.py';
  } else {
    testFileExtention = test.framework === 'Playwright' ? '.spec.js' : '.js';
  }
  const testFilePath = path.join(__dirname, `../../tests/${test.testLanguage}`, test.name + testFileExtention);
  const testFileName = path.basename(test.name, testFileExtention);
  const resultDir = path.join(__dirname, '../../allure-results', path.basename(testFileName, testFileExtention));
  const reportDir = path.join(__dirname, '../../allure-report', path.basename(testFileName, testFileExtention));
  const logsPath = path.join(__dirname, `../../logs/${test.testLanguage}`);
  const testsPath = path.join(__dirname, `../../tests/${test.testLanguage}`);

  fs.mkdirSync(resultDir, { recursive: true });
  fs.mkdirSync(reportDir, { recursive: true });
  fs.mkdirSync(logsPath, { recursive: true });
  fs.mkdirSync(testsPath, { recursive: true });

  try {
    fs.writeFileSync(testFilePath, test.content);
    await allureReporter.cleanAllureReports(resultDir, reportDir);
    if (testFileExtention === '.py') {
      await runPyTest(test.name, testFilePath, reportDir, resultDir, req, res);
    } else if (['.js', '.spec.js'].includes(testFileExtention)) {
      let testTool;
      if (testFileExtention.includes('spec')) {
        testTool = 'Playwright';
      } else {
        testTool = 'Jest';
      }
      await runJSTest(test.name, testFilePath, reportDir, resultDir, testTool, req, res);
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send(`Error during test execution: ${error.message}`);
  }
});


router.get('report/:testName', (req, res) => {
  const { testName } = req.params;
  let reportDir = '';
  const status = reportStatuses[testName] || 'not_found';
  if (status == 'ready') {
    reportDir = `allure-results/${testName}/index.html`;
  }
  res.json({ status, reportDir });
});

async function runPyTest(testName, testFilePath, resultDir, reportDir, req, res) {
  const logFilePath = path.join(__dirname, `../../logs/${testName}.log`);
  return new Promise((resolve, reject) => {
    exec(`pytest ${testFilePath} --alluredir=./allure-results > ${logFilePath} 2>&1`, async (error) => {
      if (error) {
        reportStatuses[testName] = 'failed';
        testLogs[testName] = fs.readFileSync(logFilePath, 'utf8');
        await generateAllureReport(resultDir, reportDir, req.params.testFile);
        res.status(500).json({
          status: 'failed', message: 'Test run failed',
          reportUrl: `/reports/${testName}/index.html`, logUrl: `/logs/${testName}`
        });
      } else {
        reportStatuses[testName] = 'success';
        testLogs[testName] = fs.readFileSync(logFilePath, 'utf8');
        await generateAllureReport(resultDir, reportDir, req.params.testFile);

        res.json({
          status: 'success', result: 'Test run passed',
          reportUrl: `/reports/${testName}`, logUrl: `/logs/${testName}.log`
        });
      }
    });
  });
}

async function runJSTest(testName, testFilePath, resultDir, reportDir, testTool, req, res) {
  const js_cmd = testTool === 'Playwright' ? `npx playwright test --reporter=allure-playwright --output=${resultDir}` : `npx jest --testResultsProcessor=jest-allure-reporter --outputDirectory=${resultDir}`;
  const logFilePath = path.join(__dirname, `../../logs/${testName}.log`);
  return new Promise((resolve, reject) => {
    exec(`${js_cmd} ${testFilePath}  > ${logFilePath} 2>&1`, async (error) => {
      if (error) {
        reportStatuses[testFilePath] = 'failed';
        testLogs[testFilePath] = fs.readFileSync(logFilePath, 'utf8');
        await generateAllureReport(resultDir, reportDir, req.params.testFile);
        res.json({
          status: 'failed', result: `Test run failed :\n /logs/${testName}`,
          reportUrl: `/reports/${testName}`, logUrl: `/logs/${testName}`
        });
      } else {
        reportStatuses[testFilePath] = 'success';
        testLogs[testFilePath] = fs.readFileSync(logFilePath, 'utf8');
        await generateAllureReport(resultDir, reportDir, req.params.testFile);
        res.json({
          status: 'success', result: 'Test run passed',
          reportUrl: `/reports/${testName}`, logUrl: `/logs/${testName}.log`
        });
      }
    });
  });
}

async function generateAllureReport(resultDir, reportDir, testName) {
  reportStatuses[testName] = 'generating';
  setTimeout(() => {
    reportStatuses[testName] = 'ready';
  }, 10000); // Simulating a 10-second report generation process

  return new Promise((resolve, reject) => {
    exec(`allure generate ${resultDir} -o ${reportDir} --clean`, (error) => {
      if (error) {
        reject(new Error(`Allure report generation failed: ${error}`));
      } else {
        reportStatuses[testName] = 'ready';
        resolve();
      }
    });
  });
}



module.exports = router;
