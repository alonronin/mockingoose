import * as mongoose from "mongoose";
import { Schema } from "mongoose";

export interface IUser extends mongoose.Document {
  name: string;
  email: string;
  created: Date;
  saveCount: number;
}

const schema = new Schema({
  name: String,
  email: { type: String, required: true },
  created: { type: Date, default: Date.now },
  saveCount: { type: Number, default: 0 }
});

schema.pre("save", function() {
  (<any>this).saveCount++;
});

const User = mongoose.model<IUser>("User", schema);

export default User;
