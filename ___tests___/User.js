import mongoose from 'mongoose';

const { Schema } = mongoose;

const schema = Schema({
  name: String,
  email: { type: String, required: true },
  created: { type: Date, default: Date.now },
  saveCount: { type: Number, default: 0}
});

schema.pre('save', function() {
  this.saveCount++
})

const User = mongoose.model('User', schema);

export default User;
