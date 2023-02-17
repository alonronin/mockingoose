const mongoose = require('mongoose');

if (!/^5/.test(mongoose.version)) {
  mongoose.Promise = Promise;
}

mongoose.connect = jest.fn().mockImplementation(() => Promise.resolve());

mongoose.createConnection = jest.fn().mockReturnValue({
  catch() {
    /* no op */
  },
  model: mongoose.model.bind(mongoose),
  on: jest.fn(),
  once: jest.fn(),
  then(resolve) {
    return Promise.resolve(resolve(this));
  },
});

const ops = [
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
  'updateOne',
  'updateMany',
  'deleteOne',
  'deleteMany',
  'save',
  'aggregate',
  '$save',
];

const mockedReturn = async function (cb) {
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

  if (!mock && op === '$save') {
    mock = this;
  }

  if (
    mock &&
    !(mock instanceof Model) &&
    ![
      'remove',
      'deleteOne',
      'deleteMany',
      'update',
      'updateOne',
      'updateMany',
      'count',
      'countDocuments',
      'estimatedDocumentCount',
      'distinct',
    ].includes(op)
  ) {
    mock = Array.isArray(mock)
      ? mock.map((item) => new Model(item))
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
        ? mock.map((item) => item.toObject())
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

ops.forEach((op) => {
  mongoose.Query.prototype[op] = jest
    .fn()
    .mockImplementation(function (criteria, doc, options, callback) {
      if (
        [
          'find',
          'findOne',
          'count',
          'countDocuments',
          'remove',
          'deleteOne',
          'deleteMany',
          'update',
          'updateOne',
          'updateMany',
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
    });
});

mongoose.Query.prototype.exec = jest.fn().mockImplementation(function (cb) {
  return mockedReturn.call(this, cb);
});

mongoose.Query.prototype.orFail = jest
  .fn()
  .mockImplementation(async function (err, _) {

    return this.then((doc) => {
      const hasAnyDocs = doc && Array.isArray(doc) && doc.length > 0;

      if (!doc || !hasAnyDocs) {
        if (!err) throw new Error();

        const isErrorFn = typeof err === 'function';
        throw isErrorFn ? err() : new Error(err);
      }

      return this;
    }).catch((err) => {
      throw err;
    });
  });

mongoose.Aggregate.prototype.exec = jest
  .fn()
  .mockImplementation(async function (cb) {
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

mongoose.Model.insertMany = jest
  .fn()
  .mockImplementation(function (arr, options, cb) {
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
  });

const instance = ['remove', 'save', '$save'];

instance.forEach((methodName) => {
  mongoose.Model.prototype[methodName] = jest
    .fn()
    .mockImplementation(function (options, cb) {
      const op = methodName;
      const { modelName } = this.constructor;

      if (typeof options === 'function') {
        cb = options;
      }

      Object.assign(this, { op, model: { modelName } });

      const hooks = this.constructor.hooks;

      return new Promise((resolve, reject) => {
        hooks.execPre(op, this, [cb], (err) => {
          if (err) {
            reject(err);
            return;
          }

          const ret = mockedReturn.call(this, cb);

          if (cb) {
            hooks.execPost(op, this, [ret], (err2) => {
              if (err2) {
                reject(err2);
                return;
              }

              resolve(ret);
            });
          } else {
            ret
              .then((ret2) => {
                hooks.execPost(op, this, [ret2], (err3) => {
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

const getMockController = (prop) => {
  return {
    toReturn(o, op = 'find') {
      proxyTarget.__mocks.hasOwnProperty(prop)
        ? (proxyTarget.__mocks[prop][op] = o)
        : (proxyTarget.__mocks[prop] = { [op]: o });

      return this;
    },

    reset(op) {
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

const proxyTraps = {
  get(target, prop) {
    if (target.hasOwnProperty(prop)) {
      return Reflect.get(target, prop);
    }

    return getMockController(prop);
  },
  apply: (target, thisArg, [prop]) => mockModel(prop),
};

const mockingoose = new Proxy(proxyTarget, proxyTraps);

/**
 * Returns a helper with which you can set up mocks for a particular Model
 */
const mockModel = (model) => {
  const modelName = typeof model === 'function' ? model.modelName : model;
  if (typeof modelName === 'string') {
    return getMockController(modelName);
  } else {
    throw new Error('model must be a string or mongoose.Model');
  }
};

module.exports = mockingoose;
