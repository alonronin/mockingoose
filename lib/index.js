'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

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

var ops = ['find', 'findOne', 'count', 'countDocuments', 'estimatedDocumentCount', 'distinct', 'findOneAndUpdate', 'findOneAndDelete', 'findOneAndRemove', 'findOneAndReplace', 'remove', 'update', 'deleteOne', 'deleteMany'];

var mockedReturn = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(cb) {
    var op, modelName, _mongooseOptions2, _mongooseOptions, Model, mock, err;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            op = this.op, modelName = this.model.modelName, _mongooseOptions2 = this._mongooseOptions, _mongooseOptions = _mongooseOptions2 === undefined ? {} : _mongooseOptions2;
            Model = _mongoose2.default.model(modelName);
            mock = mockingoose.__mocks[modelName] && mockingoose.__mocks[modelName][op];
            err = null;


            if (mock instanceof Error) err = mock;

            if (!(mock instanceof Function)) {
              _context.next = 9;
              break;
            }

            _context.next = 8;
            return mock(this);

          case 8:
            mock = _context.sent;

          case 9:

            if (!mock && op === 'save') {
              mock = this;
            }

            if (mock && mock instanceof Model === false && !['update', 'count', 'countDocuments', 'estimatedDocumentCount'].includes(op)) {
              mock = Array.isArray(mock) ? mock.map(function (item) {
                return new Model(item);
              }) : new Model(mock);

              if (_mongooseOptions.lean) mock = Array.isArray(mock) ? mock.map(function (item) {
                return item.toObject();
              }) : mock.toObject();
            }

            if (!cb) {
              _context.next = 13;
              break;
            }

            return _context.abrupt('return', cb(err, mock));

          case 13:
            if (!err) {
              _context.next = 15;
              break;
            }

            throw err;

          case 15:
            return _context.abrupt('return', mock);

          case 16:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function mockedReturn(_x) {
    return _ref.apply(this, arguments);
  };
}();

ops.forEach(function (op) {
  _mongoose2.default.Query.prototype[op] = jest.fn().mockImplementation(function (criteria, doc, options, callback) {
    if (['find', 'findOne', 'count', 'countDocuments', 'remove', 'deleteOne', 'deleteMany', 'findOneAndUpdate', 'findOneAndRemove', 'findOneAndDelete', 'findOneAndReplace'].includes(op) && typeof criteria !== 'function') {
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
        if (typeof options === 'function' || typeof options === 'undefined') {
          callback = options;
          options = {};
        }
        break;
      case 2:
        if (typeof doc === 'function' || typeof doc === 'undefined') {
          callback = doc;
          doc = criteria;
          criteria = undefined;
        }
        options = undefined;
        break;
      case 1:
        if (typeof criteria === 'function' || typeof criteria === 'undefined') {
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

_mongoose2.default.Aggregate.prototype.exec = jest.fn().mockImplementation(function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(cb) {
    var modelName, mock, err;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            modelName = this._model.modelName;
            mock = mockingoose.__mocks[modelName] && mockingoose.__mocks[modelName].aggregate;
            err = null;


            if (mock instanceof Error) err = mock;

            if (!(mock instanceof Function)) {
              _context2.next = 8;
              break;
            }

            _context2.next = 7;
            return mock(this);

          case 7:
            mock = _context2.sent;

          case 8:
            if (!cb) {
              _context2.next = 10;
              break;
            }

            return _context2.abrupt('return', cb(err, mock));

          case 10:
            if (!err) {
              _context2.next = 12;
              break;
            }

            throw err;

          case 12:
            return _context2.abrupt('return', mock);

          case 13:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));

  function cb(_x2) {
    return _ref2.apply(this, arguments);
  }

  return cb;
}());

var instance = ['remove', 'save'];

instance.forEach(function (methodName) {
  _mongoose2.default.Model.prototype[methodName] = jest.fn().mockImplementation(function (options, cb) {
    var _this = this;

    var op = methodName;
    var modelName = this.constructor.modelName;


    if (typeof options === 'function') cb = options;

    Object.assign(this, { op: op, model: { modelName: modelName } });

    var hooks = this.constructor.hooks;

    return new Promise(function (resolve, reject) {
      hooks.execPre(op, _this, [cb], function (err) {
        if (err) {
          reject(err);
          return;
        }

        var ret = mockedReturn.call(_this, cb);

        if (cb) {
          hooks.execPost(op, _this, [ret], function (err) {
            if (err) {
              reject(err);
              return;
            }

            resolve(ret);
          });
        } else {
          ret.then(function (ret) {
            hooks.execPost(op, _this, [ret], function (err) {
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