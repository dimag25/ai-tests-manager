// testsTableLogic.js

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

                runButton.onclick = () => runTest(test.name, row, runCell);

            });
        })
        .catch(error => console.error('Failed to fetch tests: ', error));
    }

     
function runTest(testName, row, runCell) {
        showMessage(`Running Test: ${testName}`)
        row.insertCell(4); // Placeholder for Test result
        row.insertCell(5); // Placeholder for report link
        const testResult = row.cells[4];
        const reportCell = row.cells[5];
        const reportIcon = document.createElement('i');
        reportIcon.className = 'fas fa-file-alt icon';
        reportCell.appendChild(reportIcon);
        const statusCell = row.insertCell(6);
        statusCell.textContent = 'Pending';
        statusCell.className = 'status';

        const timeCell = row.insertCell(7);
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
                testResult.innerHTML = `Test Run Finished \n\n Status: ${data.status} \n\n Message : ${data.message}`;
            }, 10000);
            showMessage(`Test Run Finished: ${testName}`)    
            createReportProgressCell(reportCell, testName);    
            if (!data.reportUrl) {
                testResult.innerHTML = 'Failed to generate report URL';
                showMessage('Failed to generate report', false);
                console.log(data);
                return;
                }
            
            const endTime = new Date();
            const duration = (endTime - startTime) / 1000; // Duration in seconds

            statusCell.textContent = data.status; // Update based on actual test result
            statusCell.className = 'status passed';
            timeCell.textContent = `${duration} seconds`;
            testResult.textContent = data.message;
            reportCell.firstChild.href = data.reportUrl; // Update the report link
            showMessage(`Report Link Ready: ${data.reportUrl}`)
            reportCell.firstChild.target = '_blank';
            reportCell.onclick = () => {
                window.open(data.reportUrl, '_blank');
                };
            // reportCell.innerHTML = `<a href="${data.reportUrl}" target="_blank">View Report</a>`;
            //reportCell.innerHTML = `<iframe src="${data.reportUrl}" frameborder="0" style="width:100%; height:400px;"></iframe>`;
        })
            .catch(error => {
            clearInterval(progressInterval);
            statusCell.textContent = 'Failed';
            statusCell.className = 'status failed';
            testResult.innerHTML = 'Error running test: ' + error.message;
            reportCell.firstChild.href = data.reportUrl; // Update the report link
            showMessage(`Error running test: ${error.message}`, false)    
            //showMessage(`Report Link Ready: ${data.reportUrl}`)
            reportCell.firstChild.target = '_blank';
            reportCell.onclick = () => {
                window.open(data.reportUrl, '_blank');
                };
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