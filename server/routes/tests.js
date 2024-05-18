const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Endpoint to get test file content
router.get('/:filename',  (req, res) => {
    const filepath = path.join(__dirname, '../../tests/generated', req.params.filename);
    fs.readFile(filepath, 'utf8', (err, data) => {
        if (err) {
            return res.status(404).send('File not found');
        }
        res.send(data);
    });
});

// Endpoint to update test file content
router.put('/:filename', async (req, res) => {
    const filepath = path.join(__dirname, '../../tests/generated', req.params.filename);
    const content = req.body.content;
    fs.writeFile(filepath, content, 'utf8', (err) => {
        if (err) {
            return res.status(500).send('Failed to save the file');
        }
        res.send('File updated successfully');
    });
});

// Endpoint to delete a test file
router.delete('/:filename', async (req, res) => {
    const filepath = path.join(__dirname, '../../tests/generated', req.params.filename);
    fs.unlink(filepath, (err) => {
        if (err) {
            return res.status(500).send('Failed to delete the file');
        }
        res.send('File deleted successfully');
    });
});

module.exports = router;
