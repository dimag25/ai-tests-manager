const express = require('express');
const router = express.Router();
const testController = require('../controllers/testController');

router.post('/generate-test', testController.generateTest);
router.get('/report/:id', testController.getReport);

// Endpoint to get test file content
router.get('/tests/:filename', async (req, res) => {
    const filepath = path.join(__dirname, '../../tests/generated', req.params.filename);
    await fs.readFile(filepath, 'utf8', (err, data) => {
        if (err) {
            return res.status(404).send('File not found');
        }
        res.send(data);
    });
});


module.exports = router;
