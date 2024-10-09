const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');

const testsRoutes = require('./routes/tests-routes');
const usersRoutes = require('./routes/users-routes');
const logsRoutes = require('./routes/logs-routes');
const reportsRoutes = require('./routes/reports-routes');

const HttpError = require('./models/http-error');

const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');

  next();
});

// Middleware
app.use(express.static('public'));
app.use(cors());
app.use(bodyParser.json());  // This line is crucial for parsing JSON request bodies
app.use(bodyParser.urlencoded({ extended: true }));  // For parsing application/x-www-form-urlencoded
app.use('/reports', express.static(path.join(__dirname, 'allure-report')));

app.use('/api/tests', testsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/reports/',reportsRoutes);

app.use((req, res, next) => {
  const error = new HttpError('Could not find this route.', 404);
  throw error;
});

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || 'An unknown error occurred!' });
});

mongoose
  .connect(
    `mongodb+srv://dimag35:o6nYkvQaBblNepot@cluster0.kcwxg.mongodb.net/mern?retryWrites=true&w=majority`
  )
  .then(() => {
    app.listen(5000);
  })
  .catch(err => {
    console.log(err);
  });
