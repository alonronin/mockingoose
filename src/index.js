import mongoose from 'mongoose';

mongoose.Promise = Promise;
mongoose.connect = jest.fn();

const ops = [
  'find',
  'findOne',
  'count',
  'distinct',
  'findOneAndUpdate',
  'findOneAndRemove',
  'remove',
  'deleteOne',
  'deleteMany'
];

const mockedReturn = function(cb) {
  const { op, model: { modelName }} = this;
  const Model = mongoose.model(modelName);

  let mock = mockingoose.__mocks[modelName] && mockingoose.__mocks[modelName][op];

  if(!mock && op === 'save') { mock = this;}

  if(mock && mock instanceof Model === false && (op !== 'update')) {
    mock = Array.isArray(mock) ? mock.map(item => new Model(item)) : new Model(mock);
  }

  let err = null;

  if(mock instanceof Error) err = mock;

  if(cb) return cb(err, mock);

  if(err) return Promise.reject(err);

  return Promise.resolve(mock)
};

ops.forEach(op => {
  mongoose.Query.prototype[op] = jest.fn().mockImplementation(function (criteria, doc, options, callback) {
    switch (arguments.length) {
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

    if(!callback) return this;

    return this.exec.call(this, callback);
  })
});

mongoose.Query.prototype.exec = jest.fn().mockImplementation(function cb(cb) {
  return mockedReturn.call(this, cb);
});

mongoose.Model.prototype.save = function(options, cb) {
  const op = 'save';
  const { modelName } = this.constructor;

  if(typeof options === 'function') cb = options;

  Object.assign(this, { op, model: { modelName }});

  return mockedReturn.call(this, cb);
};

jest.doMock('mongoose', () => mongoose);

const target = {
  __mocks: {},
  resetAll() { this.__mocks = {} },
  toJSON() { return this.__mocks }
};

const traps = {
  get(target, prop) {
    if(target.hasOwnProperty(prop)) return Reflect.get(target, prop);

    return {
      toReturn(o, op = 'find') {
        target.__mocks.hasOwnProperty(prop)
            ? target.__mocks[prop][op] = o
            : target.__mocks[prop] = { [op]: o };

        return this;
      },

      reset(op) {
        op && delete target.__mocks[prop][op] || delete target.__mocks[prop];

        return this;
      },

      toJSON() {
        return target.__mocks[prop] || {};
      }
    };
  }
};

const mockingoose = new Proxy(target, traps);

export default mockingoose;
