import type { Query, Aggregate } from 'mongoose';

export const ops = [
  'find',
  'findOne',
  'countDocuments',
  'estimatedDocumentCount',
  'distinct',
  'findOneAndUpdate',
  'findOneAndDelete',
  'findOneAndReplace',
  'updateOne',
  'updateMany',
  'deleteOne',
  'deleteMany',
  'save',
  'aggregate',
  '$save',
  'insertMany',
  'replaceOne',
  'bulkWrite',
  'bulkSave',
] as const;

export type Op = (typeof ops)[number];

export type ReturnFunction = (param: Query<any, any> | Aggregate<any>) => any;

export type MockReturnValue =
  | string
  | number
  | boolean
  | symbol
  | object
  | void
  | null
  | undefined
  | Error
  | ReturnFunction;

export interface MockController {
  toReturn(expected: MockReturnValue, op?: Op): MockController;
  reset(op?: Op): MockController;
  toJSON(): Record<string, any>;
}

export interface MockingooseTarget {
  __mocks: Record<string, Record<string, any>>;
  resetAll(): void;
  toJSON(): Record<string, Record<string, any>>;
}

export type Mockingoose = MockingooseTarget & {
  (model: any): MockController;
  [modelName: string]: any;
};
