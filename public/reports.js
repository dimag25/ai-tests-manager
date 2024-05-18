// reportsLogic.js

function updateReportLink(filename, progressBar) {
    fetch(`/api/report-status/${filename}`)
    .then(response => response.json())
    .then(data => {
        if (data.status === 'ready') {
            progressBar.style.width = '100%';
            progressBar.textContent = 'Report Ready';
            progressBar.parentElement.innerHTML = `<a href="/reports/${filename}.html" target="_blank">View Report</a>`;
        } else {
            setTimeout(() => updateReportLink(filename, progressBar), 1000); // Poll every second
        }
    });
}

function createReportProgressCell(cell, filename) {
    showMessage(`Generating Report...`)
    const progressBar = document.createElement('div');
    progressBar.textContent = 'Generating Report...';
    progressBar.style.width = '0%';
    progressBar.style.background = 'lightgreen';
    progressBar.style.height = '20px';
    cell.appendChild(progressBar);
    updateReportLink(filename, progressBar);
    progressBar.textContent = 'Report Ready';
    showMessage(`Report Ready: ${filename}`)
}


function showMessage(text, isSuccess = true) {
    let msg = document.createElement('div');
    msg.className = 'message' + (isSuccess ? '' : ' error');
    msg.textContent = text;
    document.body.appendChild(msg);
    msg.style.display = 'block';
    setTimeout(() => msg.remove(), 3000);
}