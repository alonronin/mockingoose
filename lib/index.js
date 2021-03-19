"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e2) { throw _e2; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e3) { didErr = true; err = _e3; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var mongoose = require('mongoose');

if (!/^5/.test(mongoose.version)) {
  mongoose.Promise = Promise;
}

mongoose.connect = jest.fn().mockImplementation(function () {
  return Promise.resolve();
});
mongoose.createConnection = jest.fn().mockReturnValue({
  "catch": function _catch() {
    /* no op */
  },
  model: mongoose.model.bind(mongoose),
  on: jest.fn(),
  once: jest.fn(),
  then: function then(resolve) {
    return Promise.resolve(resolve(this));
  }
});
var ops = ['find', 'findOne', 'count', 'countDocuments', 'estimatedDocumentCount', 'distinct', 'findOneAndUpdate', 'findOneAndDelete', 'findOneAndRemove', 'findOneAndReplace', 'remove', 'update', 'updateOne', 'updateMany', 'deleteOne', 'deleteMany', 'save', 'aggregate'];

var mockedReturn = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(cb) {
    var op, modelName, _this$_mongooseOption, _mongooseOptions, Model, mock, err, _iterator, _step, doc, e;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            op = this.op, modelName = this.model.modelName, _this$_mongooseOption = this._mongooseOptions, _mongooseOptions = _this$_mongooseOption === void 0 ? {} : _this$_mongooseOption;
            Model = mongoose.model(modelName);
            mock = mockingoose.__mocks[modelName] && mockingoose.__mocks[modelName][op];
            err = null;

            if (mock instanceof Error) {
              err = mock;
            }

            if (!(typeof mock === 'function')) {
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

            if (!(mock && !(mock instanceof Model) && !['remove', 'deleteOne', 'deleteMany', 'update', 'updateOne', 'updateMany', 'count', 'countDocuments', 'estimatedDocumentCount', 'distinct'].includes(op))) {
              _context.next = 33;
              break;
            }

            mock = Array.isArray(mock) ? mock.map(function (item) {
              return new Model(item);
            }) : new Model(mock);

            if (!(op === 'insertMany')) {
              _context.next = 32;
              break;
            }

            if (!Array.isArray(mock)) mock = [mock];
            _iterator = _createForOfIteratorHelper(mock);
            _context.prev = 15;

            _iterator.s();

          case 17:
            if ((_step = _iterator.n()).done) {
              _context.next = 24;
              break;
            }

            doc = _step.value;
            e = doc.validateSync();

            if (!e) {
              _context.next = 22;
              break;
            }

            throw e;

          case 22:
            _context.next = 17;
            break;

          case 24:
            _context.next = 29;
            break;

          case 26:
            _context.prev = 26;
            _context.t0 = _context["catch"](15);

            _iterator.e(_context.t0);

          case 29:
            _context.prev = 29;

            _iterator.f();

            return _context.finish(29);

          case 32:
            if (_mongooseOptions.lean || _mongooseOptions.rawResult) {
              mock = Array.isArray(mock) ? mock.map(function (item) {
                return item.toObject();
              }) : mock.toObject();
            }

          case 33:
            if (!cb) {
              _context.next = 35;
              break;
            }

            return _context.abrupt("return", cb(err, mock));

          case 35:
            if (!err) {
              _context.next = 37;
              break;
            }

            throw err;

          case 37:
            return _context.abrupt("return", mock);

          case 38:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this, [[15, 26, 29, 32]]);
  }));

  return function mockedReturn(_x) {
    return _ref.apply(this, arguments);
  };
}();

ops.forEach(function (op) {
  mongoose.Query.prototype[op] = jest.fn().mockImplementation(function (criteria, doc, options, callback) {
    if (['find', 'findOne', 'count', 'countDocuments', 'remove', 'deleteOne', 'deleteMany', 'update', 'updateOne', 'updateMany', 'findOneAndUpdate', 'findOneAndRemove', 'findOneAndDelete', 'findOneAndReplace'].includes(op) && typeof criteria !== 'function') {
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
mongoose.Query.prototype.exec = jest.fn().mockImplementation(function (cb) {
  return mockedReturn.call(this, cb);
});
mongoose.Aggregate.prototype.exec = jest.fn().mockImplementation( /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(cb) {
    var modelName, mock, err;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            modelName = this._model.modelName;
            mock = mockingoose.__mocks[modelName] && mockingoose.__mocks[modelName].aggregate;
            err = null;

            if (mock instanceof Error) {
              err = mock;
            }

            if (!(typeof mock === 'function')) {
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

            return _context2.abrupt("return", cb(err, mock));

          case 10:
            if (!err) {
              _context2.next = 12;
              break;
            }

            throw err;

          case 12:
            return _context2.abrupt("return", mock);

          case 13:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));

  return function (_x2) {
    return _ref2.apply(this, arguments);
  };
}());
mongoose.Model.insertMany = jest.fn().mockImplementation(function (arr, options, cb) {
  var op = 'insertMany';
  var modelName = this.modelName;

  if (typeof options === 'function') {
    cb = options;
    options = null;
  } else {
    this._mongooseOptions = options;
  }

  Object.assign(this, {
    op: op,
    model: {
      modelName: modelName
    }
  });
  return mockedReturn.call(this, cb);
});
var instance = ['remove', 'save'];
instance.forEach(function (methodName) {
  mongoose.Model.prototype[methodName] = jest.fn().mockImplementation(function (options, cb) {
    var _this = this;

    var op = methodName;
    var modelName = this.constructor.modelName;

    if (typeof options === 'function') {
      cb = options;
    }

    Object.assign(this, {
      op: op,
      model: {
        modelName: modelName
      }
    });
    var hooks = this.constructor.hooks;
    return new Promise(function (resolve, reject) {
      hooks.execPre(op, _this, [cb], function (err) {
        if (err) {
          reject(err);
          return;
        }

        var ret = mockedReturn.call(_this, cb);

        if (cb) {
          hooks.execPost(op, _this, [ret], function (err2) {
            if (err2) {
              reject(err2);
              return;
            }

            resolve(ret);
          });
        } else {
          ret.then(function (ret2) {
            hooks.execPost(op, _this, [ret2], function (err3) {
              if (err3) {
                reject(err3);
                return;
              }

              resolve(ret2);
            });
          })["catch"](reject);
        }
      });
    });
  });
});
jest.doMock('mongoose', function () {
  return mongoose;
}); // extend a plain function, we will override it with the Proxy later

var proxyTarget = Object.assign(function () {
  return void 0;
}, {
  __mocks: {},
  resetAll: function resetAll() {
    this.__mocks = {};
  },
  toJSON: function toJSON() {
    return this.__mocks;
  }
});

var getMockController = function getMockController(prop) {
  return {
    toReturn: function toReturn(o) {
      var op = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'find';
      proxyTarget.__mocks.hasOwnProperty(prop) ? proxyTarget.__mocks[prop][op] = o : proxyTarget.__mocks[prop] = _defineProperty({}, op, o);
      return this;
    },
    reset: function reset(op) {
      if (op) {
        delete proxyTarget.__mocks[prop][op];
      } else {
        delete proxyTarget.__mocks[prop];
      }

      return this;
    },
    toJSON: function toJSON() {
      return proxyTarget.__mocks[prop] || {};
    }
  };
};

var proxyTraps = {
  get: function get(target, prop) {
    if (target.hasOwnProperty(prop)) {
      return Reflect.get(target, prop);
    }

    return getMockController(prop);
  },
  apply: function apply(target, thisArg, _ref3) {
    var _ref4 = _slicedToArray(_ref3, 1),
        prop = _ref4[0];

    return mockModel(prop);
  }
};
var mockingoose = new Proxy(proxyTarget, proxyTraps);
/**
 * Returns a helper with which you can set up mocks for a particular Model
 */

var mockModel = function mockModel(model) {
  var modelName = typeof model === 'function' ? model.modelName : model;

  if (typeof modelName === 'string') {
    return getMockController(modelName);
  } else {
    throw new Error('model must be a string or mongoose.Model');
  }
};

module.exports = mockingoose;
//# sourceMappingURL=index.js.map