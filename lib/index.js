'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

_mongoose2.default.Promise = Promise;
_mongoose2.default.connect = jest.fn();

var ops = ['find', 'findOne', 'count', 'distinct', 'findOneAndUpdate', 'findOneAndRemove', 'remove', 'deleteOne', 'deleteMany'];

var mockedReturn = function mockedReturn(op, modelName, cb) {
  var mock = mockingoose.__mocks[modelName][op];
  var err = null;

  if (mock instanceof Error) err = mock;

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
  var op = this.op,
      modelName = this.model.modelName;


  return mockedReturn(op, modelName, cb);
});

_mongoose2.default.Model.prototype.save = function (options, cb) {
  var op = 'save';
  var modelName = this.constructor.modelName;


  if (typeof options === 'function') cb = options;

  return mockedReturn(op, modelName, cb);
};

jest.doMock('mongoose', function () {
  return _mongoose2.default;
});

var target = {
  __mocks: {}
};

var traps = {
  get: function get(target, prop) {
    if (target.hasOwnProperty(prop)) return Reflect.get(target, prop);

    return {
      toReturn: function toReturn(o) {
        var op = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'find';

        target.__mocks[prop] = _defineProperty({}, op, o);
      }
    };
  }
};

var mockingoose = new Proxy(target, traps);

exports.default = mockingoose;
//# sourceMappingURL=index.js.map