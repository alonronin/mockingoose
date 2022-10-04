import * as mongoose from 'mongoose';

declare const ops: [
  'find',
  'findOne',
  'count',
  'countDocuments',
  'estimatedDocumentCount',
  'distinct',
  'findOneAndUpdate',
  'findOneAndDelete',
  'findOneAndRemove',
  'findOneAndReplace',
  'remove',
  'update',
  'deleteOne',
  'deleteMany',
  'save',
  'aggregate'
];
declare type Ops = typeof ops[number];
declare type ReturnFunction = (param: mongoose.Query<any, any, any, any> | mongoose.Aggregate<any>) => {};
declare type ExpectedReturnType = string | number | boolean | symbol | object | {} | void | null | undefined;
interface Mock {
  /**
   * Specify an expected result for a specific mongoose function. This can be a primitive value or a function.
   * If used with a function, you will have access to the Query or Aggregate mongoose class.
   * @param expected Primitive value or function that returns the mocked value
   * @param op The operation to mock
   */
  toReturn(expected: ExpectedReturnType | ReturnFunction, op?: Ops): this;
  /**
   * Reset all mocks
   * @param op Optional parameter to reset, if not specified, resets everything
   */
  reset(op?: Ops): this;
  /**
   * Returns an object of mocks for this model. Only serializable if all mock results are primitives, not functions.
   */
  toJSON(): any;
}
interface Target {
  __mocks: any;
  /**
   * Resets all mocks.
   */
  resetAll(): void;
  /**
   * Returns an object of mocks for all models. Only serializable if all mock results are primitives, not functions.
   */
  toJSON(): any;
}
declare type Proxy = Target & {
  [index: string]: Mock;
} & typeof mockModel;
declare const mockingoose: Proxy;
/**
 * Returns a helper with which you can set up mocks for a particular Model
 * @param {string | mongoose.Model} model either a string model name, or a mongoose.Model instance
 */
declare const mockModel: (model: string | mongoose.Model<any, {}>) => Mock;
export default mockingoose;