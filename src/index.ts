import mongoose from 'mongoose';
import {
  ops,
  type Op,
  type MockController,
  type MockingooseTarget,
  type Mockingoose,
} from './types';

function createMockFn(): any {
  if (typeof globalThis !== 'undefined' && 'vi' in globalThis) {
    return (globalThis as any).vi.fn();
  }
  if (typeof globalThis !== 'undefined' && 'jest' in globalThis) {
    return (globalThis as any).jest.fn();
  }
  // Fallback for environments without test framework
  const fn: any = function (this: any, ...args: any[]) {
    return fn._impl?.apply(this, args);
  };
  fn._impl = undefined;
  fn.mockImplementation = (impl: (...args: any[]) => any) => {
    fn._impl = impl;
    return fn;
  };
  fn.mockReturnValue = (val: any) => {
    fn._impl = () => val;
    return fn;
  };
  return fn;
}

function doMock(moduleName: string, factory: () => any): void {
  if (typeof globalThis !== 'undefined' && 'vi' in globalThis) {
    (globalThis as any).vi.doMock(moduleName, factory);
  } else if (typeof globalThis !== 'undefined' && 'jest' in globalThis) {
    (globalThis as any).jest.doMock(moduleName, factory);
  }
}

// Connection mocking
mongoose.connect = createMockFn().mockImplementation(() => Promise.resolve());

const connectionMock: any = {
  catch() {
    /* no op */
  },
  model: mongoose.model.bind(mongoose),
  on: createMockFn(),
  once: createMockFn(),
  then(resolve: (val: any) => any) {
    // Temporarily remove `then` to prevent infinite thenable unwrapping
    // when used with `await`. Without this, `resolve(this)` returns a thenable,
    // causing the runtime to recursively call `.then()` forever.
    const thenFn = connectionMock.then;
    delete connectionMock.then;
    const result = resolve(connectionMock);
    connectionMock.then = thenFn;
    return Promise.resolve(result);
  },
};

mongoose.createConnection = createMockFn().mockReturnValue(connectionMock);

// Core mock return function
const mockedReturn = async function (this: any, cb?: Function) {
  const {
    op,
    model: { modelName },
    _mongooseOptions = {},
  } = this;
  const Model = mongoose.model(modelName);

  let mock =
    mockingoose.__mocks[modelName] && mockingoose.__mocks[modelName][op];

  let err: Error | null = null;

  if (mock instanceof Error) {
    err = mock;
  }

  if (typeof mock === 'function') {
    mock = await mock(this);
  }

  if (!mock && op === 'save') {
    mock = this;
  }

  if (!mock && op === '$save') {
    mock = this;
  }

  if (
    mock &&
    !(mock instanceof Model) &&
    ![
      'deleteOne',
      'deleteMany',
      'updateOne',
      'updateMany',
      'countDocuments',
      'estimatedDocumentCount',
      'distinct',
    ].includes(op)
  ) {
    mock = Array.isArray(mock)
      ? mock.map((item: any) => new Model(item))
      : new Model(mock);

    if (op === 'insertMany') {
      if (!Array.isArray(mock)) mock = [mock];

      for (const doc of mock) {
        const e = doc.validateSync();
        if (e) throw e;
      }
    }

    if (_mongooseOptions.lean || _mongooseOptions.rawResult) {
      mock = Array.isArray(mock)
        ? mock.map((item: any) => item.toObject())
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

// Patch Query.prototype for each operation
ops.forEach((op) => {
  (mongoose.Query.prototype as any)[op] = createMockFn().mockImplementation(
    function (
      this: any,
      criteria: any,
      doc: any,
      options: any,
      callback: any,
    ) {
      if (
        [
          'find',
          'findOne',
          'countDocuments',
          'deleteOne',
          'deleteMany',
          'updateOne',
          'updateMany',
          'findOneAndUpdate',
          'findOneAndDelete',
          'findOneAndReplace',
        ].includes(op) &&
        typeof criteria !== 'function'
      ) {
        // find and findOne can take conditions as the first parameter
        // ensure they make it into the Query conditions
        this.merge(criteria);
      }

      if (['distinct'].includes(op) && typeof doc !== 'function') {
        // distinct has the conditions as the second parameter
        this.merge(doc);
      }

      if (/update/i.test(op) && typeof doc !== 'function' && doc) {
        this.setUpdate(doc);
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
    },
  );
});

// Patch Query.prototype.exec
(mongoose.Query.prototype as any).exec = createMockFn().mockImplementation(
  function (this: any, cb?: Function) {
    return mockedReturn.call(this, cb);
  },
);

// Patch Query.prototype.orFail
(mongoose.Query.prototype as any).orFail = createMockFn().mockImplementation(
  async function (this: any, err?: Function | string) {
    return this.then((doc: any) => {
      const hasAnyDocs = doc && Array.isArray(doc) && doc.length > 0;

      if (!doc || !hasAnyDocs) {
        if (!err) throw new Error();

        const isErrorFn = typeof err === 'function';
        throw isErrorFn ? err() : new Error(err as string);
      }

      return this;
    }).catch((err: any) => {
      throw err;
    });
  },
);

// Patch Aggregate.prototype.exec
(mongoose.Aggregate.prototype as any).exec = createMockFn().mockImplementation(
  async function (this: any, cb?: Function) {
    const {
      _model: { modelName },
    } = this;

    let mock =
      mockingoose.__mocks[modelName] &&
      mockingoose.__mocks[modelName].aggregate;

    let err: Error | null = null;

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
  },
);

// Patch Model.insertMany
(mongoose.Model as any).insertMany = createMockFn().mockImplementation(
  function (this: any, _arr: any, options: any, cb?: Function) {
    const op = 'insertMany';
    const { modelName } = this;

    if (typeof options === 'function') {
      cb = options;
      options = null;
    } else {
      this._mongooseOptions = options;
    }

    Object.assign(this, { op, model: { modelName } });
    return mockedReturn.call(this, cb);
  },
);

// Patch instance methods (save, remove, $save)
const instance = ['save', '$save'] as const;

instance.forEach((methodName) => {
  (mongoose.Model.prototype as any)[methodName] =
    createMockFn().mockImplementation(async function (
      this: any,
      options: any,
      cb?: Function,
    ) {
      const op = methodName;
      const { modelName } = this.constructor;

      if (typeof options === 'function') {
        cb = options;
      }

      Object.assign(this, { op, model: { modelName } });

      const hooks = this.constructor.hooks;

      await hooks.execPre(op, this, []);
      const ret = await mockedReturn.call(this, cb);
      await hooks.execPost(op, this, [ret]);

      return ret;
    });
});

// Mock the mongoose module
doMock('mongoose', () => mongoose);

// Proxy target and controller
const proxyTarget: MockingooseTarget & ((...args: any[]) => any) =
  Object.assign(() => void 0, {
    __mocks: {} as Record<string, Record<string, any>>,
    resetAll() {
      this.__mocks = {};
    },
    toJSON() {
      return this.__mocks;
    },
  });

const getMockController = (prop: string): MockController => {
  return {
    toReturn(o, op: Op = 'find') {
      proxyTarget.__mocks.hasOwnProperty(prop)
        ? (proxyTarget.__mocks[prop][op] = o)
        : (proxyTarget.__mocks[prop] = { [op]: o });

      return this;
    },

    reset(op?: Op) {
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

const mockModel = (model: any): MockController => {
  const modelName = typeof model === 'function' ? model.modelName : model;
  if (typeof modelName === 'string') {
    return getMockController(modelName);
  } else {
    throw new Error('model must be a string or mongoose.Model');
  }
};

const proxyTraps: ProxyHandler<typeof proxyTarget> = {
  get(target, prop: string) {
    if (target.hasOwnProperty(prop)) {
      return Reflect.get(target, prop);
    }

    return getMockController(prop);
  },
  apply: (_target, _thisArg, [prop]) => mockModel(prop),
};

const mockingoose = new Proxy(proxyTarget, proxyTraps) as unknown as Mockingoose;

export default mockingoose;
export { mockingoose };
export type {
  Op,
  MockController,
  MockingooseTarget,
  Mockingoose,
  ReturnFunction,
  MockReturnValue,
} from './types';
