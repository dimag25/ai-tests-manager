const express = require('express');
const bodyParser = require('body-parser');
const apiRoutes = require('./server/routes/api');
const testRoutes = require('./server/routes/tests');

const cors = require('cors');
const path = require('path'); 
const fs = require('fs');
const { exec, spawn } = require('child_process');
let allureProcess = null; // Global variable to manage the Allure report server process

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
        //
        // - Write all logs with level `info` and below to `combined.log` 
        // - Write all logs with level `error` and below to `error.log`.
        //
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
// Import the routes

app.use(bodyParser.json());
app.use('/api', apiRoutes);
// Use the test routes
app.use('/tests', testRoutes);
// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve static files from each test's report directory
app.use('/reports', express.static(path.join(__dirname, 'allure-report')));

// Middleware to log all requests
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`);
    next();
});

// Handle errors
app.use((err, req, res, next) => {
    logger.error('Error: %s', err.stack);
    res.status(500).send('Something broke!');
});

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
    const resultDir = path.join(__dirname, 'allure-results', path.basename(testFileName, testFilePathExtention));
    const reportDir = path.join(__dirname, 'allure-report', path.basename(testFileName, testFilePathExtention));

    // Ensure result and report directories exist
    fs.mkdirSync(resultDir, { recursive: true });
    fs.mkdirSync(reportDir, { recursive: true });

    try {
        await cleanAllureReports(resultDir, reportDir);
        if (testFilePathExtention === '.py') {
            await runPyTest(testFilePath, resultDir, reportDir, req, res);
        }
        else if (testFilePathExtention == '.js') { 
            let testTool;
            if (testFileName.includes('spec.js')) {
                testTool = 'Playwright';
            }
            else {
                testTool = 'Jest';
            }
            await runJSTest(testFilePath, resultDir, reportDir, testTool, req, res);
        }
        await generateAllureReport(resultDir, reportDir);
        res.json({
            message: `${req.params.testFile} Finished Succesfuly.\n click on the link to see the report`,
            status: 'Passed',
            reportUrl: `/reports/${path.basename(testFileName, testFilePathExtention)}/index.html`
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send(`Error during test execution: ${error.message}`);
    }
});

async function runPyTest(testFilePath, resultDir,reportDir, req, res) {
    return new Promise((resolve, reject) => {
        exec(`pytest ${testFilePath} --alluredir=${resultDir}`, async (error) => {
            if (error) {
                res.status(500).json({
                    message: `${req.params.testFile} PyTest Failed: ${error}\n click on the link to see the report`,
                    status: 'Failed',
                    reportUrl: `/reports/${path.basename(req.params.testFile, '.py')}/index.html`
                });
                await generateAllureReport(resultDir, reportDir);
                //reject(new Error(`PyTest failed: ${error}`));
            } else {
                resolve();
            }
        });
    });
}

async function runJSTest(testFilePath, resultDir, reportDir, testTool, req, res) {
    let js_cmd =  testTool === 'Playwright' ? 'npx playwright test' : 'npx jest'; 
    return new Promise((resolve, reject) => {
        exec(`${js_cmd} ${testFilePath}`, async (error) => {
            if (error) {
                res.status(500).json({
                    message: `${req.params.testFile} JS Test Failed: ${error}\n click on the link to see the report`,
                    status: 'Failed',
                    reportUrl: `/reports/${path.basename(req.params.testFile, '.js')}/index.html`
                });
                await generateAllureReport(resultDir, reportDir);
                //reject(new Error(`JS Test failed: ${error}`));
            } else {
                resolve();
            }
        });
    });
}

async function generateAllureReport(resultDir, reportDir) {
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


const PORT = 3000;
app.use(cors({}));
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));