document.addEventListener('DOMContentLoaded', function() {
    fetchTests();
});

function fetchTests() {
    fetch('/tests')
        .then(response => response.json())
        .then(tests => {
            const table = document.getElementById('testTable');
            table.innerHTML = ""; // Clear previous entries
            tests.forEach(test => {
                const row = table.insertRow();
                row.insertCell(0).textContent = test.name;
                const runButton = document.createElement('button');
                runButton.className = 'button';
                runButton.innerHTML = '<i class="fas fa-play"></i>'; // Play icon
                const runCell = row.insertCell(1);
                runCell.appendChild(runButton);
                const editCell = row.insertCell(2);
                const editButton = document.createElement('button');
                editButton.textContent = 'Edit';
                editButton.onclick = () => editTest(test.name);
                editCell.appendChild(editButton);

                const deleteCell = row.insertCell(3);
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.onclick = () => deleteTest(test.name);
                deleteCell.appendChild(deleteButton);

                row.insertCell(4); // Placeholder for Test result
                row.insertCell(5); // Placeholder for report link
                const statusCell = row.insertCell(6);
                const timeCell = row.insertCell(7);
                runButton.onclick = () => runTest(test.name, row, runCell, statusCell, timeCell);
            });
        })
        .catch(error => console.error('Failed to fetch tests:', error));
}

function runTest(testName, row, runCell, statusCell, timeCell) {
    showMessage(`Running Test: ${testName}`);
    const testResult = row.cells[4];
    const reportCell = row.cells[5];
    const reportIcon = document.createElement('i');
    reportIcon.className = 'fas fa-file-alt icon';
    reportCell.appendChild(reportIcon);
    statusCell.textContent = 'Pending';
    statusCell.className = 'status';
    timeCell.textContent = 'Not run yet';

    const progressBar = document.createElement('progress');
    runCell.appendChild(progressBar);
    progressBar.value = 0;
    progressBar.max = 100;
    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += 10;
        progressBar.value = progress;
    }, 1000);

    const startTime = new Date();
    fetch(`/run-test/${testName}`)
        .then(response => response.json())
        .then(data => {
            clearInterval(progressInterval);
            progressBar.value = 100;

            // Simulate a test run with a timeout
            setTimeout(() => {
                clearInterval(progressInterval);
                progressBar.value = 100;
                testResult.innerHTML = `<a href="${data.logUrl}" target="_blank">${data.message}<br> View Log</a>`; // Update with log link
            }, 10000);

            showMessage(`Test Run Finished: ${testName}`);
            // Show the progress bar and start checking the report status
            showProgressBar();
            checkReportStatus(testName);

            if (!data.reportUrl) {
                reportCell.textContent = 'Failed to generate report.';
                showMessage('Failed to generate report.', false);
                return;
            }

            const endTime = new Date();
            const duration = (endTime - startTime) / 1000; // Duration in seconds
            statusCell.textContent = data.status; // Update based on actual test result
            statusCell.className = data.status === 'success' ? 'status passed' : 'status failed';
            timeCell.textContent = `${duration} seconds`;
            testResult.innerHTML = `<a href="${data.logUrl}" target="_blank">${data.message}<br> View Log</a>`; // Update with log link
            reportCell.innerHTML = `<a href="${data.reportUrl}" target="_blank">Report is Ready</a>`; // Update the report link
        })
        .catch(error => {
            clearInterval(progressInterval);
            statusCell.textContent = 'Failed';
            statusCell.className = 'status failed';
            testResult.innerHTML = 'Error running test: ' + error.message;
            console.error(error);
        });
}

function editTest(filename) {
    fetch(`/tests/${filename}`)
        .then(response => response.text())
        .then(data => {
            const editor = ace.edit("editor");
            editor.setTheme("ace/theme/monokai");
            editor.session.setMode("ace/mode/python"); // Assuming Python for pytest
            editor.setValue(data, -1); // -1 moves cursor to the start

            const editModal = document.getElementById('editModal');
            editModal.style.display = 'block'; // Show the editor modal

            window.saveChanges = function() {
                const updatedContent = editor.getValue();
                fetch(`/tests/${filename}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ content: updatedContent })
                })
                .then(response => response.text())
                .then(() => {
                    showMessage('Changes saved successfully');
                    editModal.style.display = 'none'; // Hide the modal
                });
            };

            window.copyToClipboard = function() {
                navigator.clipboard.writeText(editor.getValue())
                .then(() => {
                    showMessage('Copied to clipboard');
                });
            };

            window.closeEditor = function() {
                editModal.style.display = 'none'; // Hide the modal
            };

            window.fixTestCode = function() {
                const testContent = editor.getValue();
                const userPrompt = prompt("Describe the problem or the desired fix:");

                fetch('/api/fix-test', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ testName: filename, testContent, prompt: userPrompt })
                })
                .then(response => response.json())
                .then(data => {
                    editor.setValue(data.fixedCode, -1); // Update editor with the fixed code
                    showMessage('Test code fixed. Please review and save changes.');
                })
                .catch(error => {
                    console.error('Error fixing test code:', error);
                    showMessage('Failed to fix test code.', false);
                });
            };
        });
}

function saveTest(filename, content) {
    fetch(`/tests/${filename}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
    })
    .then(response => response.text())
    .then(message => showMessage(message));
}

function deleteTest(filename) {
    if (confirm('Are you sure you want to delete this test?')) {
        fetch(`/tests/${filename}`, { method: 'DELETE' })
        .then(response => response.text())
        .then(message => {
            showMessage(message);
            fetchTests();  // Refresh the list after deletion
        });
    }
}

function showMessage(text, isSuccess = true) {
    let msg = document.createElement('div');
    msg.className = 'message' + (isSuccess ? '' : ' error');
    msg.textContent = text;
    document.body.appendChild(msg);
    msg.style.display = 'block';
    setTimeout(() => msg.remove(), 3000);
}

function checkReportStatus(testName) {
    fetch(`/api/report-status/${testName}`)
    .then(response => response.json())
    .then(data => {
        const progressBar = document.getElementById('progressBar');
        const progressMessage = document.getElementById('progressMessage');

        if (data.status === 'ready') {
            progressBar.style.width = '100%';
            progressMessage.textContent = 'Report is ready!';
            showMessage('Report generated successfully!');
            document.getElementById('generationResult').textContent = `Report URL: /reports/${testName}.html`;
        } else if (data.status === 'generating') {
            progressBar.style.width = `${Math.min(progressBar.clientWidth + 10, 100)}%`;
            progressMessage.textContent = 'Report is generating...';
            setTimeout(() => checkReportStatus(testName), 1000);
        } else {
            progressMessage.textContent = 'Failed to generate report.';
            showMessage('Failed to generate report.', false);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showMessage('Failed to check report status.', false);
    });
}

function showProgressBar() {
    const progressContainer = document.getElementById('progressContainer');
    const progressBar = document.getElementById('progressBar');
    const progressMessage = document.getElementById('progressMessage');

    progressBar.style.width = '0%';
    progressMessage.textContent = 'Report is generating...';
    progressContainer.style.display = 'block';
}
