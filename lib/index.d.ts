import * as mongoose from "mongoose";
declare const ops: ["find", "findOne", "count", "countDocuments", "estimatedDocumentCount", "distinct", "findOneAndUpdate", "findOneAndDelete", "findOneAndRemove", "findOneAndReplace", "remove", "update", "deleteOne", "deleteMany", "save", "aggregate"];
declare type Ops = (typeof ops)[number];
declare type ReturnFunction = (param: mongoose.Query<any> | mongoose.Aggregate<any>) => {};
declare type ExpectedReturnType = string | number | boolean | symbol | object | {} | void | null | undefined;
interface Mock {
    toReturn(expected: ExpectedReturnType | ReturnFunction, op?: Ops): this;
    reset(op?: Ops): this;
    toJSON(): any;
}
interface Target {
    __mocks: any;
    resetAll(): void;
    toJSON(): any;
}
declare type Proxy = Target & {
    [index: string]: Mock;
};
declare const mockingoose: Proxy;
export declare const mockModel: (model: string | mongoose.Model<any, {}>) => Mock;
export default mockingoose;
