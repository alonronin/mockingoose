const mongoose = require('mongoose');
const { Schema } = require('mongoose');
const { ObjectId } = Schema.Types;

const schema = new Schema({
  created: { type: Date, default: Date.now },
  email: { type: String, required: true },
  foreignKey: ObjectId,
  name: String,
  saveCount: { type: Number, default: 0 },
});

schema.pre('save', function() {
  this.saveCount++;
});

const User = mongoose.model('User', schema);

module.exports = User;
