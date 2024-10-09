const uuid = require('uuid/v4');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

const HttpError = require('../models/http-error');
const Test = require('../models/test');
const User = require('../models/user');

const getTestById = async (req, res, next) => {
  const testId = req.params.tid;

  let test;
  try {
    test = await Test.findById(testId);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not find a test.',
      500
    );
    return next(error);
  }

  if (!test) {
    const error = new HttpError(
      'Could not find test for the provided id.',
      404
    );
    return next(error);
  }

  res.json({ test: test.toObject({ getters: true }) });
};

const getTestsByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  // let tests;
  let userWithTests;
  try {
    userWithTests = await User.findById(userId).populate('tests');
  } catch (err) {
    const error = new HttpError(
      'Fetching tests failed, please try again later.',
      500
    );
    return next(error);
  }

  if (!userWithTests || userWithTests.tests.length === 0) {
    return next(
      new HttpError('Could not find tests for the provided user id.', 404)
    );
  }

  res.json({ tests: userWithTests.tests.map(test => test.toObject({ getters: true })) });
};

const createTest = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }

  const { name, description, content, testLanguage, framework, creator } = req.body;

  const createdTest = new Test({
    name,
    description,
    content,
    testLanguage,
    framework,
    creator
  });

  let user;
  try {
    user = await User.findById(creator);
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      'Creating test failed, please try again.',
      500
    );
    return next(error);
  }

  if (!user) {
    const error = new HttpError('Could not find user for provided id.', 404);
    return next(error);
  }

  console.log(user);

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdTest.save({ session: sess });
    user.tests.push(createdTest);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      'Creating test failed, please try again.',
      500
    );
    return next(error);
  }

  res.status(201).json({ test: createdTest });
};

const updateTest = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }

  const { name, description, content } = req.body;
  const testId = req.params.tid;

  let test;
  try {
    test = await Test.findById(testId);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not update test.',
      500
    );
    return next(error);
  }

  test.name = name;
  test.description = description;
  test.content = content;

  try {
    await test.save();
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not update test.',
      500
    );
    return next(error);
  }

  res.status(200).json({ test: test.toObject({ getters: true }) });
};

const deleteTest = async (req, res, next) => {
  const testId = req.params.tid;

  let test;
  try {
    test = await Test.findById(testId).populate('creator');
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not delete test.',
      500
    );
    return next(error);
  }

  if (!test) {
    const error = new HttpError('Could not find test for this id.', 404);
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await test.remove({ session: sess });
    test.creator.tests.pull(test);
    await test.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not delete test.',
      500
    );
    return next(error);
  }
};

exports.getTestById = getTestById;
exports.getTestsByUserId = getTestsByUserId;
exports.createTest = createTest;
exports.updateTest = updateTest;
exports.deleteTest = deleteTest;
