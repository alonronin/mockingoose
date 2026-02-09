import mongoose, { Schema } from 'mongoose';

const schema = new Schema({
  created: { type: Date, default: Date.now },
  email: { type: String, required: true },
  foreignKey: Schema.Types.ObjectId,
  name: String,
  saveCount: { type: Number, default: 0 },
});

schema.pre('save', function () {
  this.saveCount++;
});

const User = mongoose.model('User', schema);
export default User;
