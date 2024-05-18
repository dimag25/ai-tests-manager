const { exec } = require('child_process');
const path = require('path');
const util = require('util');
const execPromise = util.promisify(exec);

exports.generateReport = async (testResultDirectory) => {
    const reportDirectory = path.join(__dirname, '..', 'allure-report', testResultDirectory);
    const allureResultsDirectory = path.join(__dirname, '..', 'allure-results', testResultDirectory);

    try {
        // Ensure the allure-results directory exists and isn't empty
        const { stdout } = await execPromise(`allure generate ${allureResultsDirectory} -o ${reportDirectory} --clean`);
        console.log(stdout);
        return reportDirectory;
    } catch (error) {
        console.error('Error generating Allure report:', error);
        throw new Error('Failed to generate Allure report');
    }
};
