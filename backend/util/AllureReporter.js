const { exec } = require('child_process');
const path = require('path');
const util = require('util');
const execPromise = util.promisify(exec);
const fs = require('fs');

const getRandomPort = () => {
    return Math.floor(Math.random() * (4100 - 4000 + 1)) + 4000;
};

class AllureReporter {
    constructor(baseDir) {
        this.baseDir = baseDir || path.join(__dirname, '../..');
    }

    async generateTestReport(testResultDirectory) {
        const reportDirectory = path.join(this.baseDir, 'allure-report', testResultDirectory);
        const allureResultsDirectory = path.join(this.baseDir, 'allure-results', testResultDirectory);

        try {
            const { stdout } = await execPromise(`allure generate ${allureResultsDirectory} -o ${reportDirectory} --clean`);
            console.log(stdout);
            return reportDirectory;
        } catch (error) {
            console.error('Error generating Allure report:', error);
            throw new Error('Failed to generate Allure report');
        }
    }

    async generateWholeReport() {
        const reportDirectory = path.join(this.baseDir, 'allure-report');
        const allureResultsDirectory = path.join(this.baseDir, 'allure-results');

        try {
            const { stdout } = await execPromise(`allure generate ${allureResultsDirectory} -o ${reportDirectory} --clean`);
            console.log(stdout);
            return reportDirectory;
        } catch (error) {
            console.error('Error generating Allure report:', error);
            throw new Error('Failed to generate whole Allure report');
        }
    }

    async serveAllureReports(port = getRandomPort()) {
        try {
            // const reportDirectory = path.join(this.baseDir, 'allure-report');
            exec(`allure serve --port ${port}`, { detached: true, stdio: 'ignore' }).unref();
            return `http://localhost:${port}/`;
        } catch (error) {
            console.error('Error opening Allure report:', error);
            throw new Error(`Failed to serve Allure reports on port ${port}`);
        }
    }

    async openAllureReport(port) {
        try {
            await execPromise(`allure open --port ${port}`);
            return `http://localhost:${port}/`;
        } catch (error) {
            console.error('Error opening Allure report:', error);
            throw new Error('Failed to open Allure report');
        }
    }

    async cleanAllureReports(
        resultDir = path.join(this.baseDir, 'allure-results'),
        reportDir = path.join(this.baseDir, 'allure-report')) {
        if (fs.existsSync(resultDir)) {
            fs.rmdirSync(resultDir, { recursive: true });
        }
        if (fs.existsSync(reportDir)) {
            fs.rmdirSync(reportDir, { recursive: true });
        }
    }
}

module.exports = AllureReporter;