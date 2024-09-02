const { exec } = require('child_process');
const path = require('path');
const util = require('util');
const execPromise = util.promisify(exec);

class AllureReporter {
    constructor(baseDir) {
        this.baseDir = baseDir || path.join(__dirname, '../..');
    }

    async generateReport(testResultDirectory) {
        const reportDirectory = path.join(__dirname, 'allure-report', testResultDirectory);
        const allureResultsDirectory = path.join(__dirname, 'allure-results', testResultDirectory);

        try {
            const { stdout } = await execPromise(`allure generate ${allureResultsDirectory} -o ${reportDirectory} --clean`);
            console.log(stdout);
            // window.open(allureResultsDirectory, '_blank');
            // window.open(reportDirectory, '_blank');
            return reportDirectory;
        } catch (error) {
            console.error('Error generating Allure report:', error);
            throw new Error('Failed to generate Allure report');
        }
    }

    async serveAllureReports(port) {
        try {
            await execPromise('allure generate --clean');
            return `http://localhost:${port}/`;
        } catch (error) {
            console.error('Error serving Allure reports:', error);
            throw new Error('Failed to serve Allure reports');
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
}

module.exports = AllureReporter;