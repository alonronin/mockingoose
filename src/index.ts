import * as mongoose from 'mongoose';
import { tuple } from './tuple';

if (!/^5/.test(mongoose.version)) {
  (mongoose as any).Promise = Promise;
}

(mongoose as any).connect = jest
  .fn()
  .mockImplementation(() => Promise.resolve());

(mongoose as any).createConnection = jest.fn().mockReturnValue({
  catch() {
    /* no op */
  },
  model: mongoose.model.bind(mongoose),
  on: jest.fn(),
  once: jest.fn(),
  then(resolve: any) {
    return Promise.resolve(resolve(this));
  },
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
);

type Ops = (typeof ops)[number];

type ReturnFunction = (
  param: mongoose.Query<any> | mongoose.Aggregate<any>
) => {};

type ExpectedReturnType =
  | string
  | number
  | boolean
  | symbol
  | object
  | {}
  | void
  | null
  | undefined;

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

const mockedReturn = async function(cb) {
  const {
    op,
    model: { modelName },
    _mongooseOptions = {},
  } = this;
  const Model = mongoose.model(modelName);

  let mock =
    mockingoose.__mocks[modelName] && mockingoose.__mocks[modelName][op];

  let err = null;

  if (mock instanceof Error) {
    err = mock;
  }

  if (typeof mock === 'function') {
    mock = await mock(this);
  }

  if (!mock && op === 'save') {
    mock = this;
  }

  if (
    mock &&
    mock instanceof Model === false &&
    ![
      'update',
      'count',
      'countDocuments',
      'estimatedDocumentCount',
      'distinct',
    ].includes(op)
  ) {
    mock = Array.isArray(mock)
      ? mock.map(item => new Model(item))
      : new Model(mock);

    if (_mongooseOptions.lean) {
      mock = Array.isArray(mock)
        ? mock.map(item => item.toObject())
        : mock.toObject();
    }
  }

  if (cb) {
    return cb(err, mock);
  }

  if (err) {
    throw err;
  }

  return mock;
};

ops.forEach(op => {
  mongoose.Query.prototype[op] = jest
    .fn()
    .mockImplementation(function(criteria, doc, options, callback) {
      if (
        [
          'find',
          'findOne',
          'count',
          'countDocuments',
          'remove',
          'deleteOne',
          'deleteMany',
          'findOneAndUpdate',
          'findOneAndRemove',
          'findOneAndDelete',
          'findOneAndReplace',
        ].includes(op) &&
        typeof criteria !== 'function'
      ) {
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

      if (!callback) {
        return this;
      }

      return this.exec.call(this, callback);
    });
});

mongoose.Query.prototype.exec = jest.fn().mockImplementation(function(cb) {
  return mockedReturn.call(this, cb);
});

mongoose.Aggregate.prototype.exec = jest
  .fn()
  .mockImplementation(async function(cb) {
    const {
      _model: { modelName },
    } = this;

    let mock =
      mockingoose.__mocks[modelName] &&
      mockingoose.__mocks[modelName].aggregate;

    let err = null;

    if (mock instanceof Error) {
      err = mock;
    }

    if (typeof mock === 'function') {
      mock = await mock(this);
    }

    if (cb) {
      return cb(err, mock);
    }

    if (err) {
      throw err;
    }

    return mock;
  });

const instance = ['remove', 'save'];

instance.forEach(methodName => {
  mongoose.Model.prototype[methodName] = jest
    .fn()
    .mockImplementation(function(options, cb) {
      const op = methodName;
      const { modelName } = this.constructor;

      if (typeof options === 'function') {
        cb = options;
      }

      Object.assign(this, { op, model: { modelName } });

      const hooks = this.constructor.hooks;

      return new Promise((resolve, reject) => {
        hooks.execPre(op, this, [cb], err => {
          if (err) {
            reject(err);
            return;
          }

          const ret = mockedReturn.call(this, cb);

          if (cb) {
            hooks.execPost(op, this, [ret], err2 => {
              if (err2) {
                reject(err2);
                return;
              }

              resolve(ret);
            });
          } else {
            ret
              .then(ret2 => {
                hooks.execPost(op, this, [ret2], err3 => {
                  if (err3) {
                    reject(err3);
                    return;
                  }

                  resolve(ret2);
                });
              })
              .catch(reject);
          }
        });
      });
    });
});

jest.doMock('mongoose', () => mongoose);

// extend a plain function, we will override it with the Proxy later
const proxyTarget = Object.assign(() => void 0, {
  __mocks: {},
  resetAll() {
    this.__mocks = {};
  },
  toJSON() {
    return this.__mocks;
  },
});

const getMockController = (prop: string | number | symbol): Mock => {
  return {
    toReturn(o: object | ReturnFunction, op = 'find') {
      proxyTarget.__mocks.hasOwnProperty(prop)
        ? (proxyTarget.__mocks[prop][op] = o)
        : (proxyTarget.__mocks[prop] = { [op]: o });

      return this;
    },

    reset(op?: string) {
      if (op) {
        delete proxyTarget.__mocks[prop][op];
      } else {
        delete proxyTarget.__mocks[prop];
      }

      return this;
    },

    toJSON() {
      return proxyTarget.__mocks[prop] || {};
    },
  };
};

type Proxy = Target & {
  [index: string]: Mock;
} & typeof mockModel;

const proxyTraps = {
  get(target: object, prop: string | number | symbol) {
    if (target.hasOwnProperty(prop)) {
      return Reflect.get(target, prop);
    }

    return getMockController(prop);
  },
  apply: (target, thisArg, [prop]) => mockModel(prop),
};

const mockingoose: Proxy = new Proxy(proxyTarget, proxyTraps) as any;

/**
 * Returns a helper with which you can set up mocks for a particular Model
 * @param {string | mongoose.Model} model either a string model name, or a mongoose.Model instance
 */
export const mockModel = (model: string | mongoose.Model<any>) => {
  const modelName = typeof model === 'function' ? model.modelName : model;
  if (typeof modelName === 'string') {
    return getMockController(modelName);
  } else {
    throw new Error('model must be a string or mongoose.Model');
  }
};

export default mockingoose;
