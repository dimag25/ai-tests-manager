const express = require('express');
const bodyParser = require('body-parser');
const apiRoutes = require('./server/routes/api');
const testRoutes = require('./server/routes/tests');

const cors = require('cors');
const path = require('path'); 
const fs = require('fs');
const { exec } = require('child_process');
const winston = require('winston');

// Create a logger instance
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json()
    ),
    defaultMeta: { service: 'user-service' },
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});

// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }));
}

const app = express();
app.use(bodyParser.json());
app.use('/api', apiRoutes);
app.use('/tests', testRoutes);
app.use(express.static(path.join(__dirname, 'public')));
app.use('/reports', express.static(path.join(__dirname, 'allure-report')));

app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`);
    next();
});

app.use((err, req, res, next) => {
    logger.error('Error: %s', err.stack);
    res.status(500).send('Something broke!');
});

// In-memory storage for report statuses and logs
const reportStatuses = {};
const testLogs = {};

// List tests
app.get('/tests', (req, res) => {
    const directoryPath = path.join(__dirname, 'tests', 'generated');
    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            return res.status(500).send("Unable to scan test directory");
        }
        const tests = files.filter(file => file.endsWith('.py') || file.endsWith('js')).map(file => {
            return {
                name: file,
                runLink: `/run-test/${file}`,
                reportLink: `/reports/${file.replace('.py', '.html')}`
            };
        });
        res.json(tests);
    });
});

app.get('/run-test/:testFile', async (req, res) => {
    const testFileName = req.params.testFile;
    const testFilePath = path.join(__dirname, 'tests', 'generated', testFileName);
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
        } else if (testFilePathExtention == '.js') { 
            let testTool;
            if (testFileName.includes('spec.js')) {
                testTool = 'Playwright';
            } else {
                testTool = 'Jest';
            }
            await runJSTest(testName, testFilePath, reportDir, resultDir, testTool, req, res);
        }
        await generateAllureReport(resultDir, reportDir, testFileName);
        res.json({
            message: `${req.params.testFile} Finished Successfully.\n click on the link to see the report`,
            status: 'Passed',
            reportUrl: `/reports/${path.basename(testFileName, testFilePathExtention)}/index.html`
        });
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
                    status: 'failed', message: 'Test run failed',
                    reportUrl: `/reports/${testName}/index.html`, logUrl: `/logs/${testName}`
                });
            } else {
                reportStatuses[testFilePath] = 'success';
                testLogs[testFilePath] = fs.readFileSync(logFilePath, 'utf8');
                await generateAllureReport(resultDir, reportDir, req.params.testFile);
                res.json({
                    status: 'success', message: 'Test run succeeded',
                    reportUrl: `/reports/${testName}/index.html`, logUrl: `/logs/${testName}`
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
    const status = reportStatuses[testName] || 'not_found';
    res.json({ status });
});

app.get('/logs/:testName', (req, res) => {
    const { testName } = req.params;
    const logFilePath = path.join(__dirname, `logs/${testName}.log`);
    res.sendFile(logFilePath);
});

const PORT = 3000;
app.use(cors({}));
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
