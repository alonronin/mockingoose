import * as mongoose from 'mongoose';
import { Schema } from 'mongoose';

export interface IUser extends mongoose.Document {
  name: string;
  email: string;
  created: Date;
  saveCount: number;
}

const schema = new Schema({
  created: { type: Date, default: Date.now },
  email: { type: String, required: true },
  name: String,
  saveCount: { type: Number, default: 0 },
});

schema.pre('save', function() {
  (this as any).saveCount++;
});

const User = mongoose.model<IUser>('User', schema);

export default User;
