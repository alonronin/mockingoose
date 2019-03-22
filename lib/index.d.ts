import * as mongoose from 'mongoose';
declare const ops: ["find", "findOne", "count", "countDocuments", "estimatedDocumentCount", "distinct", "findOneAndUpdate", "findOneAndDelete", "findOneAndRemove", "findOneAndReplace", "remove", "update", "deleteOne", "deleteMany", "save", "aggregate"];
declare type Ops = (typeof ops)[number];
interface Mock {
    toReturn(expected: string | number | object | Function, op?: Ops): this;
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
export declare const mockModel: (model: string | mongoose.Model<any, {}>) => {
    toReturn(o: object | Function, op?: string): any;
    reset(op?: string): any;
    toJSON(): any;
};
export default mockingoose;
