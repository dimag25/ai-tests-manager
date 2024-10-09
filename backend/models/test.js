const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const testSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  content: { type: String, required: true },
  testLanguage: { type: String, required: true },
  framework: { type: String, required: true },
  creator: { type: mongoose.Types.ObjectId, required: true, ref: 'User' }
});

module.exports = mongoose.model('Test', testSchema);
