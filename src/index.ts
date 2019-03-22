import * as mongoose from 'mongoose';
import { tuple } from './tuple';

if(!/^5/.test(mongoose.version)) (<any>mongoose).Promise = Promise;

(<any>mongoose).connect = jest.fn().mockImplementation(() => Promise.resolve());
(<any>mongoose).createConnection = jest
  .fn()
  .mockReturnValue({
    on: jest.fn(),
    once: jest.fn(),
    then(resolve: any) { return Promise.resolve(resolve(this)); },
    catch() {},
    model: mongoose.model.bind(mongoose),
  });


const ops = tuple(
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
)

type Ops = (typeof ops)[number];

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

type Proxy = Target & {
  [index: string]: Mock;
};


const mockedReturn = async function (cb) {
  const { op, model: { modelName }, _mongooseOptions = {} } = this;
  const Model = mongoose.model(modelName);

  let mock = mockingoose.__mocks[modelName] && mockingoose.__mocks[modelName][op];

  let err = null;

  if (mock instanceof Error) err = mock;

  if (mock instanceof Function) mock = await mock(this);

  if (!mock && op === 'save') { mock = this;}

  if (mock && mock instanceof Model === false && (!['update', 'count', 'countDocuments', 'estimatedDocumentCount', 'distinct'].includes(op))) {
    mock = Array.isArray(mock) ? mock.map(item => new Model(item)) : new Model(mock);

    if (_mongooseOptions.lean) mock = Array.isArray(mock) ? mock.map(item => item.toObject()) : mock.toObject();
  }

  if (cb) return cb(err, mock);

  if (err) throw err;

  return mock;
};

ops.forEach(op => {
  mongoose.Query.prototype[op] = jest.fn().mockImplementation(function (criteria, doc, options, callback) {
    if ([
        'find', 'findOne', 'count', 'countDocuments', 
        'remove', 'deleteOne', 'deleteMany', 'findOneAndUpdate',
        'findOneAndRemove', 'findOneAndDelete', 'findOneAndReplace'
      ].includes(op) && typeof criteria !== 'function') {
      // find and findOne can take conditions as the first paramter
      // ensure they make it into the Query conditions
      this.merge(criteria);
    }

    if (['distinct'].includes(op) && typeof doc !== 'function') {
      // distinct has the conditions as the second parameter
      this.merge(doc);
    }

    switch (arguments.length) {
      case 4:
      case 3:
        if (typeof options === 'function') {
          callback = options;
          options = {};
        }
        break;
      case 2:
        if (typeof doc === 'function') {
          callback = doc;
          doc = criteria;
          criteria = undefined;
        }
        options = undefined;
        break;
      case 1:
        if (typeof criteria === 'function') {
          callback = criteria;
          criteria = options = doc = undefined;
        } else {
          doc = criteria;
          criteria = options = undefined;
        }
    }

    this.op = op;

    if (!callback) return this;

    return this.exec.call(this, callback);
  });
});

mongoose.Query.prototype.exec = jest.fn().mockImplementation(function cb(cb) {
  return mockedReturn.call(this, cb);
});

mongoose.Aggregate.prototype.exec = jest.fn().mockImplementation(async function cb(cb) {
  const { _model: { modelName } } = this;

  let mock = mockingoose.__mocks[modelName] && mockingoose.__mocks[modelName].aggregate;

  let err = null;

  if (mock instanceof Error) err = mock;
  
  if (mock instanceof Function) mock = await mock(this);

  if (cb) return cb(err, mock);

  if (err) throw err;

  return mock;
});

const instance = [
  'remove',
  'save'
];

instance.forEach(methodName => {
  mongoose.Model.prototype[methodName] = jest.fn().mockImplementation(function (options, cb) {
    const op = methodName;
    const { modelName } = this.constructor;

    if (typeof options === 'function') cb = options;

    Object.assign(this, { op, model: { modelName } });

    const hooks = this.constructor.hooks

    return new Promise((resolve, reject) => {
      hooks.execPre(op, this, [cb], (err) => {
        if (err) {
          reject(err);
          return;
        }

        const ret = mockedReturn.call(this, cb);

        if (cb) {
          hooks.execPost(op, this, [ret], (err) => {
            if (err) {
              reject(err);
              return;
            }

            resolve(ret);
          });
        } else {
          ret
            .then((ret) => {
              hooks.execPost(op, this, [ret], (err) => {
                if (err) {
                  reject(err);
                  return;
                }

                resolve(ret);
              });
            })
            .catch(reject);
        }
      });
    });
  });
});

jest.doMock('mongoose', () => mongoose);

const target = {
  __mocks: {},
  resetAll() { this.__mocks = {}; },
  toJSON() { return this.__mocks; },
};

const getMockController = (prop: string | number | symbol) => {
  return {
    toReturn(o: object | Function, op = 'find') {
      target.__mocks.hasOwnProperty(prop)
        ? target.__mocks[prop][op] = o
        : target.__mocks[prop] = { [op]: o };

      return this;
    },

    reset(op?: string) {
      op && delete target.__mocks[prop][op] || delete target.__mocks[prop];

      return this;
    },

    toJSON() {
      return target.__mocks[prop] || {};
    },
  };
}

const traps = {
  get(target: object, prop: string | number | symbol) {
    if (target.hasOwnProperty(prop)) return Reflect.get(target, prop);

    return getMockController(prop);
  },
};

const mockingoose: Proxy = new Proxy(target, traps) as any;

export const mockModel = (model: string | mongoose.Model<any>) => {
  const modelName = typeof model === 'function' ? model.modelName : model;
  if (typeof modelName === 'string') {
    return getMockController(modelName);
  } else {
    throw new Error('model must be a string or mongoose.Model');
  }
}

export default mockingoose;