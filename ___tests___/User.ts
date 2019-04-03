import * as mongoose from 'mongoose';
import { Schema } from 'mongoose';
import ObjectId = Schema.Types.ObjectId;

export interface IUser extends mongoose.Document {
  created: Date;
  email: string;
  foreignKey: ObjectId;
  name: string;
  saveCount: number;
}

const schema = new Schema({
  created: { type: Date, default: Date.now },
  email: { type: String, required: true },
  foreignKey: ObjectId,
  name: String,
  saveCount: { type: Number, default: 0 },
});

schema.pre('save', function() {
  (this as any).saveCount++;
});

const User = mongoose.model<IUser>('User', schema);

export default User;
