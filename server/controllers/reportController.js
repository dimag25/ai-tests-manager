app.get('/api/report-status/:testName', (req, res) => {
    const { testName } = req.params;
    const status = reportStatuses[testName] || 'not_found';
    res.json({ status });
});