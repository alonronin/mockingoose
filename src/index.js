import mongoose from 'mongoose';

if(!/^5/.test(mongoose.version)) mongoose.Promise = Promise;

mongoose.connect = jest.fn().mockImplementation(() => Promise.resolve());
mongoose.createConnection = jest
  .fn()
  .mockReturnValue({
    on: jest.fn(),
    once: jest.fn(),
    then(resolve) { return Promise.resolve(resolve(this)); },
    catch() {},
    model: mongoose.model.bind(mongoose),
  });

/**
 * Gets the mock functions for a given model, creating objects if they are missing.
 */
function getModelMockFunctions(modelName) {
  if (!modelName) throw new Error('Model name must be defined');

  let allMockFunctions = mockingoose.__mockFunctions;
  if (!allMockFunctions) allMockFunctions = mockingoose.__mockFunctions = {};

  let modelMockFunctions = allMockFunctions[modelName];
  if (!modelMockFunctions) modelMockFunctions = allMockFunctions[modelName] = {};

  return modelMockFunctions;
}

/**
 * Gets the mock function for a given model and op, creating objects and mocks as needed.
 */
function getMockFunction(modelName, opName) {
  if (!opName) throw new Error('Op name must be defined');

  const modelMockFunctions = getModelMockFunctions(modelName);

  let mockFunction = modelMockFunctions[opName];
  if (!mockFunction) mockFunction = modelMockFunctions[opName] = jest.fn();

  return mockFunction;
}

/**
 * Retrieves a mock function and applies the supplied handler to the mock function before
 * invoking the mock function itself on behalf of the caller.
 */
function getApplyMock(modelName, opName, mockHandler, args) {
  const mockFn = getMockFunction(modelName, opName);
  mockFn.mockImplementation(mockHandler);
  return mockFn.apply(this, args);
}

const ops = [
  'find',
  'findOne',
  'count',
  'countDocuments',
  'estimatedDocumentCount',
  'distinct',
  'findOneAndUpdate',
  'findOneAndRemove',
  'remove',
  'update',
  'deleteOne',
  'deleteMany',
];

const mockedReturn = function (cb) {
  const { op, model: { modelName }, _mongooseOptions = {} } = this;
  const Model = mongoose.model(modelName);

  let mock = mockingoose.__mocks[modelName] && mockingoose.__mocks[modelName][op];

  let err = null;

  if (mock instanceof Error) err = mock;

  if (!mock && op === 'save') { mock = this;}

  if (mock && mock instanceof Model === false && (!['update', 'count', 'countDocuments', 'estimatedDocumentCount'].includes(op))) {
    mock = Array.isArray(mock) ? mock.map(item => new Model(item)) : new Model(mock);

    if (_mongooseOptions.lean) mock = Array.isArray(mock) ? mock.map(item => item.toObject()) : mock.toObject();
  }

  if (cb) return cb(err, mock);

  if (err) return Promise.reject(err);

  return Promise.resolve(mock);
};

/**
 * Common code path that is invoked by every query based mock
 * function. Which one made the call depends entirely on the
 * operation.
 */
function queryMockFunctionHandler(criteria, doc, options, callback) {
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

  return callback ? this.exec.call(this, callback) : this;
}

/**
 * Replacement for the Query operation function on the Mongoose Query
 * prototype. Kinda like a proxy that ensures we call the right mock
 * function before continuing.
 */
function getQueryOpHandler(op) {
  return function() {
    const { model: { modelName } } = this;
    this.op = op;
    return getApplyMock.call(this, modelName, op, queryMockFunctionHandler, arguments);
  };
}

ops.forEach(op => mongoose.Query.prototype[op] = getQueryOpHandler(op));

mongoose.Query.prototype.exec = function() {
  const { model: { modelName } } = this;
  // Op should have already been set by now.  So don't adjust it.
  return getApplyMock.call(this, modelName, 'exec', mockedReturn, arguments);
};

function aggregateExecMockFunctionHandler(cb) {
	const { _model: { modelName } } = this;

	let mock = mockingoose.__mocks[modelName] && mockingoose.__mocks[modelName].aggregate;

	let err = null;

	if (mock instanceof Error) err = mock;

	if (cb) return cb(err, mock);

	if (err) return Promise.reject(err);

	return Promise.resolve(mock);
}

// XXX: Aggregate.exec mock function conflicts with the Query.exec mock function. How to solve?
mongoose.Aggregate.prototype.exec = function() {
  const { _model: { modelName } } = this;
  return getApplyMock.call(this, modelName, 'exec', aggregateExecMockFunctionHandler, arguments);
}

mongoose.Aggregate.prototype.exec = jest.fn().mockImplementation(function cb(cb) {
  const { _model: { modelName } } = this;

	let mock = mockingoose.__mocks[modelName] && mockingoose.__mocks[modelName].aggregate;

	let err = null;

	if (mock instanceof Error) err = mock;

	if (cb) return cb(err, mock);

	if (err) return Promise.reject(err);

	return Promise.resolve(mock);
});

const instance = [
  'remove',
  'save'
];

function instanceMockFunctionHandler(options, cb) {
  const op = this.op;

  if (typeof options === 'function') cb = options;

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
        ret.then((ret) => {
          hooks.execPost(op, this, [ret], (err) => {
            if (err) {
              reject(err);
              return;
            }

            resolve(ret);
          });
        }).catch(reject);
      }
    });
  });
}

/**
 * Replacement for the instance operation function on the Mongoose
 * Model prototype. Kinda like a proxy that ensures we call the right
 * mock function before continuing.
 */
function getInstanceOpHandler(op) {
  return function() {
    const { modelName } = this.constructor;
    Object.assign(this, { op, model: { modelName } });
    return getApplyMock.call(this, modelName, op, instanceMockFunctionHandler, arguments);
  };
}

instance.forEach(op => mongoose.Model.prototype[op] = getInstanceOpHandler(op));

jest.doMock('mongoose', () => mongoose);

const target = {
  __mocks: {},
  __mockFunctions: {},
  clearAll() { this.__mockFunctions = {}; },
  resetAll() { this.__mocks = {}; },
  toJSON() { return this.__mocks; },
};

const traps = {
  get(target, prop) {
    if (target.hasOwnProperty(prop)) return Reflect.get(target, prop);

    return {
      toReturn(o, op = 'find') {
        target.__mocks.hasOwnProperty(prop)
          ? target.__mocks[prop][op] = o
          : target.__mocks[prop] = { [op]: o };

        return this;
      },

      clear(op) {
        if (op) {
          const mockFunction = getMockFunction(prop, op);
          mockFunction.clear();
        } else {
          const modelMockFunctions = getModelMockFunctions(prop);
          Object.keys(modelMockFunctions).forEach(op => {
            const mockFunction = getMockFunction(prop, op);
            mockFunction.clear();
          });
        }

        return this;
      },

      getMock(op) {
        return getMockFunction(prop, op);
      },

      reset(op) {
        op && delete target.__mocks[prop][op] || delete target.__mocks[prop];
        op && delete target.__mockFunctions[prop][op] || delete target.__mockFunctions[prop];

        return this;
      },

      toJSON() {
        return target.__mocks[prop] || {};
      },
    };
  },
};

const mockingoose = new Proxy(target, traps);

export default mockingoose;
