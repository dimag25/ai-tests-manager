
    
function generateNewTest() {
    const testDescription = document.getElementById('testDescription').value;
    const framework = document.getElementById('frameworkSelect').value;
    const testTool = document.getElementById('testToolSelect').value;
    const includeVideo = document.getElementById('includeVideo').checked;
    const includeScreenshots = document.getElementById('includeScreenshots').checked;

    // Ensure there is some description before sending
        if (!testDescription.trim()) {
            showMessage('Please enter a test description.', false);
            return;
    }    
    const progressBar = document.createElement('div');
    showMessage("Generating New Test...");
    fetch('/api/generate-test', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ testDescription, framework, testTool, includeVideo, includeScreenshots })
    })
      .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok: ' + response);
            }
            return response.json();
        })
        .then(data => {
         // Display the URL or result in the <pre> element
        document.getElementById('result').textContent = `Report URL: ${data.reportUrl}`;
        progressBar.style.width = '100%';
        progressBar.textContent = 'Test Generated';
        showMessage(`Test Generated: ${testN}`);
        setTimeout(() => {
            progressBar.remove();
            fetchTests(); // Reload tests table
        }, 2000);
    }) .catch(error => {
            console.error('Error:', error);
            document.getElementById('result').textContent = 'Failed to generate Test: ' + error.message;
            showMessage('Failed to generate Test: ' + error.message, false);
        });
}

function createTestGenerateProgressCell(progressBar) {
    progressBar.style.width = '0%';
    progressBar.style.background = 'lightgreen';
    progressBar.style.height = '20px';
    progressBar.textContent = 'Generating Test...';
    document.getElementById("generateNewTest").appendChild(progressBar);
}
