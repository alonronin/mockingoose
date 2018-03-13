'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

if (!/^5/.test(_mongoose2.default.version)) _mongoose2.default.Promise = Promise;

_mongoose2.default.connect = jest.fn().mockImplementation(function () {
  return Promise.resolve();
});
_mongoose2.default.createConnection = jest.fn().mockReturnValue({
  on: jest.fn(),
  once: jest.fn(),
  then: function then(resolve) {
    return Promise.resolve(resolve(this));
  },
  catch: function _catch() {},

  model: _mongoose2.default.model.bind(_mongoose2.default)
});

var ops = ['find', 'findOne', 'count', 'distinct', 'findOneAndUpdate', 'findOneAndRemove', 'remove', 'deleteOne', 'deleteMany'];

var mockedReturn = function mockedReturn(cb) {
  var op = this.op,
      modelName = this.model.modelName,
      _mongooseOptions2 = this._mongooseOptions,
      _mongooseOptions = _mongooseOptions2 === undefined ? {} : _mongooseOptions2;

  var Model = _mongoose2.default.model(modelName);

  var mock = mockingoose.__mocks[modelName] && mockingoose.__mocks[modelName][op];

  var err = null;

  if (mock instanceof Error) err = mock;

  if (!mock && op === 'save') {
    mock = this;
  }

  if (mock && mock instanceof Model === false && !['update', 'count'].includes(op)) {
    mock = Array.isArray(mock) ? mock.map(function (item) {
      return new Model(item);
    }) : new Model(mock);

    if (_mongooseOptions.lean) mock = Array.isArray(mock) ? mock.map(function (item) {
      return item.toObject();
    }) : mock.toObject();
  }

  if (cb) return cb(err, mock);

  if (err) return Promise.reject(err);

  return Promise.resolve(mock);
};

ops.forEach(function (op) {
  _mongoose2.default.Query.prototype[op] = jest.fn().mockImplementation(function (criteria, doc, options, callback) {
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

    if (!callback) return this;

    return this.exec.call(this, callback);
  });
});

_mongoose2.default.Query.prototype.exec = jest.fn().mockImplementation(function cb(cb) {
  return mockedReturn.call(this, cb);
});

var instance = ['remove', 'save'];

instance.forEach(function (methodName) {
  _mongoose2.default.Model.prototype[methodName] = jest.fn().mockImplementation(function (options, cb) {
    var op = methodName;
    var modelName = this.constructor.modelName;


    if (typeof options === 'function') cb = options;

    Object.assign(this, { op: op, model: { modelName: modelName } });

    return mockedReturn.call(this, cb);
  });
});

jest.doMock('mongoose', function () {
  return _mongoose2.default;
});

var target = {
  __mocks: {},
  resetAll: function resetAll() {
    this.__mocks = {};
  },
  toJSON: function toJSON() {
    return this.__mocks;
  }
};

var traps = {
  get: function get(target, prop) {
    if (target.hasOwnProperty(prop)) return Reflect.get(target, prop);

    return {
      toReturn: function toReturn(o) {
        var op = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'find';

        target.__mocks.hasOwnProperty(prop) ? target.__mocks[prop][op] = o : target.__mocks[prop] = _defineProperty({}, op, o);

        return this;
      },
      reset: function reset(op) {
        op && delete target.__mocks[prop][op] || delete target.__mocks[prop];

        return this;
      },
      toJSON: function toJSON() {
        return target.__mocks[prop] || {};
      }
    };
  }
};

var mockingoose = new Proxy(target, traps);

exports.default = mockingoose;
//# sourceMappingURL=index.js.map