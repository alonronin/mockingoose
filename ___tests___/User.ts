import * as mongoose from 'mongoose';
import { Schema } from 'mongoose';
const { ObjectId } = Schema.Types;

export interface IUser extends mongoose.Document {
  name: string;
  email: string;
  created: Date;
  saveCount: number;
  foreignKey: Object,
}

const schema = new Schema({
  created: { type: Date, default: Date.now },
  email: { type: String, required: true },
  name: String,
  saveCount: { type: Number, default: 0 },
  foreignKey: ObjectId
});

schema.pre('save', function() {
  (this as any).saveCount++;
});

const User = mongoose.model<IUser>('User', schema);

export default User;
