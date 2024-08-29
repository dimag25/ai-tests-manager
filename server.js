const OpenAIAPI = require('./OpenAIAPI');
const AllureReporter = require('./AllureReporter');
const testRunner = require('./testRunner');
const express = require('express');
const path = require('path');
const fs = require('fs');
const { exec ,execPromise } = require('child_process');
const openai = new OpenAIAPI();
const allureReporter = new AllureReporter();
const cors = require('cors');
const bodyParser = require('body-parser');
// In your Express route handlers:
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.static('public'));
app.use(cors());
app.use(bodyParser.json());  // This line is crucial for parsing JSON request bodies
app.use(bodyParser.urlencoded({ extended: true }));  // For parsing application/x-www-form-urlencoded
app.use('/reports', express.static(path.join(__dirname, 'allure-report')));


// In-memory storage for report statuses and logs
const reportStatuses = {};
const testLogs = {};


app.post('/api/generate-test', async (req, res) => {
  try {
    const { testDescription, framework, testTool, includeVideo, includeScreenshots } = req.body;
    const testCode = await openai.generateTestCode(testDescription, framework, testTool, includeVideo, includeScreenshots);
    const testName = await openai.generateTestName(testDescription);
    const testResult = await testRunner.createTest(testCode, testName, testTool, framework);
    const reportUrl = await allureReporter.generateReport(testResult);
    res.json({ reportUrl });
    // Use testRunner to create the test file
    res.json({ testCode, testName });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/fix-test' , async(req, res)=>{
    const { testCode, prompt} = req.body;
    const response = await openai.generateSuggestionTestFix(prompt,testTool ='Javascript');
    console.log("/api/fix-test [Response] ==> ", response);
    res.json({fixedCode : response});
});

app.post('/api/generate-report', async (req, res) => {
  try {
    const reportDirectory = await allureReporter.serveAllureReports();
    res.json({ reportDirectory });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// List tests
// app.get('/api/tests', (req, res) => {
//     const testsFolder = path.join(__dirname, 'tests');
//     fs.readdir(testsFolder, (err, files) => {
//         if (err) {
//             return res.status(500).json({ error: 'Unable to read tests directory' });
//         }
//         const testFiles = files.map(file => ({ name: file }));
//         res.json(testFiles);
//     });
// });
app.get('/api/tests', (req, res) => {
    const { language } = req.query;

    cleanAllureReports(path.join(__dirname, 'allure-results'), path.join(__dirname, 'allure-report'))
    const directoryPath = path.join(__dirname, 'tests');
    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            return res.status(500).send("Unable to scan test directory");
        }

        const testsSuffix = (language === 'javascript') ? '.js' : '.py';
        const tests = files.filter(file => file.endsWith(testsSuffix)).map(file => {
            return {
                name: file,
                runLink: `/run-test/${file}`,
                reportLink: `/reports/index.html`
            };
        });
        res.json(tests);
    });
});


// Endpoint to get test file content
app.get('/api/tests/:filename', async (req, res) => {
    const filepath = path.join(__dirname, 'tests', req.params.filename);
    fs.readFile(filepath, 'utf8', (err, data) => {
        if (err) {
            return res.status(404).send('File not found');
        }
       res.setHeader('Content-Type', 'application/json');
        res.send({ content: data});    
    });  
});
  

// Endpoint to update test file content
app.put('/api/tests/:filename', async (req, res) => {
    const filepath = path.  join(__dirname, 'tests', req.params.filename);
    const content = req.body.content;
    fs.writeFile(filepath, content, 'utf8', (err) => {
        if (err) {
            return res.status(500).send('Failed to save the file');
        }
        res.send('File updated successfully');
    });
});

// Endpoint to delete a test file
app.delete('/api/tests/:filename', async (req, res) => {
    const filepath = path.join(__dirname, 'tests', req.params.filename);
    fs.unlink(filepath, (err) => {
        if (err) {
            return res.status(500).send('Failed to delete the file');
        }
        res.send('File deleted successfully');
    });
});




app.get('/api/tests/run-test/:testFile', async (req, res) => {
    const testFileName = req.params.testFile;
    const testFilePath = path.join(__dirname, 'tests', testFileName);
    const testFilePathExtention = path.extname(testFilePath);
    const testName = path.basename(testFileName, testFilePathExtention);

    const resultDir = path.join(__dirname, 'allure-results', path.basename(testFileName, testFilePathExtention));
    const reportDir = path.join(__dirname, 'allure-report', path.basename(testFileName, testFilePathExtention));

    fs.mkdirSync(resultDir, { recursive: true });
    fs.mkdirSync(reportDir, { recursive: true });

    try {
        await cleanAllureReports(resultDir, reportDir);
        if (testFilePathExtention === '.py') {
            await runPyTest(testName, testFilePath, resultDir, reportDir, req, res);
        } else if (['.js', '.ts'].includes(testFilePathExtention)) { 
            let testTool;
            if (testFileName.includes('spec')) {
                testTool = 'Playwright';
            } else {
                testTool = 'Jest';
            }
            await runJSTest(testName, testFilePath, reportDir, resultDir, testTool, req, res);
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send(`Error during test execution: ${error.message}`);
    }
});

async function runPyTest(testName, testFilePath, resultDir, reportDir, req, res) {
    const logFilePath = path.join(__dirname, `logs/${testName}.log`);
    return new Promise((resolve, reject) => {
        exec(`pytest ${testFilePath} --alluredir=${resultDir} > ${logFilePath} 2>&1`, async (error) => {
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
                    status: 'success', message: 'Test run succeeded',
                    reportUrl: `/reports/${testName}/index.html`, logUrl: `/logs/${testName}`
                });
            }
        });
    });
}

async function runJSTest(testName, testFilePath, resultDir, reportDir, testTool, req, res) {
    const js_cmd = testTool === 'Playwright' ? `npx playwright test --reporter=allure-playwright --output=${resultDir}` : `npx jest --testResultsProcessor=jest-allure-reporter --outputDirectory=${resultDir}`; 
    const logFilePath = path.join(__dirname, `logs/${testName}.log`);
    return new Promise((resolve, reject) => {
        exec(`${js_cmd} ${testFilePath}  > ${logFilePath} 2>&1`, async (error) => {
            if (error) {
                reportStatuses[testFilePath] = 'failed';
                testLogs[testFilePath] = fs.readFileSync(logFilePath, 'utf8');
                await generateAllureReport(resultDir, reportDir, req.params.testFile);
                res.json({
                    status: 'failed', result: `Test run failed :\n /logs/${testName}`,
                    reportUrl: `/reports/index.html`, logUrl: `/logs/${testName}`
                });
            } else {
                reportStatuses[testFilePath] = 'success';
                testLogs[testFilePath] = fs.readFileSync(logFilePath, 'utf8');
                await generateAllureReport(resultDir, reportDir, req.params.testFile);
                res.json({
                    status: 'success', result: 'Test run passed',
                    reportUrl: `/reports/index.html`, logUrl: `/logs/${testName}`
                });
            }
        });
    });
}

app.get('/api/serve-allure-reports', async (req, res) => {
    exec('allure generate --clean', (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return res.status(500).send('Error generating report');
        }
    });
        const reportUrl = 'http://localhost:4000/';
        res.send(reportUrl);
  });
  
  app.get('/api/open-allure-report', async (req, res) => {
    exec('allure open --port 4000', (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return res.status(500).send('Error opening report');
        }

        // Return the URL of the opened Allure report
        const reportUrl = 'http://localhost:4000/';
        res.send(reportUrl);
    });
  });

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

async function cleanAllureReports(resultDir, reportDir) {
    if (fs.existsSync(resultDir)) { 
        fs.rmdirSync(resultDir, { recursive: true });
    }
    if (fs.existsSync(reportDir)) { 
        fs.rmdirSync(reportDir, { recursive: true });
    }
}

app.get('/api/report-status/:testName', (req, res) => {
    const { testName } = req.params;
    let reportDir = '';
    const status = reportStatuses[testName] || 'not_found';
    if (status == 'ready'){
         reportDir =  reportController.getReportByTestName(testName);
    }
    res.json({ status ,reportDir });
});

app.get('/logs/:testName', (req, res) => {
    const { testName } = req.params;
    const logFilePath = path.join(__dirname, `logs/${testName}.log`);
    res.sendFile(logFilePath);
});


app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
