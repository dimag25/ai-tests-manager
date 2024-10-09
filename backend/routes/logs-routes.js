const express = require('express');
const router = express.Router();
const path = require('path');


router.get('/:testName', (req, res) => {
    const { testName } = req.params;
    const logFilePath = path.join(__dirname, `../../logs/${testName}.log`);
    res.sendFile(logFilePath);
  });
  

module.exports = router;
