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

const mockedReturn = (op, modelName, cb) => {
  const mock = mockingoose.__mocks[modelName][op];
  let err = null;

  if(mock instanceof Error) err = mock;

  if(cb) return cb(err, mock);

  if(err) return Promise.reject(err);
  return Promise.resolve(mock)
};

ops.forEach(op => {
  mongoose.Query.prototype[op] = jest.fn().mockImplementation(function (condition, cb) {
    this.op = op;

    if(!cb) return this;

    return this.exec.call(this, cb);
  })
});

mongoose.Query.prototype.exec = jest.fn().mockImplementation(function cb(cb) {
  const { op, model: { modelName }} = this;

  return mockedReturn(op, modelName, cb);
});

mongoose.Model.prototype.save = function(options, cb) {
  const op = 'save';
  const { modelName } = this.constructor;

  if(typeof options === 'function') cb = options;

  return mockedReturn(op, modelName, cb);
};

jest.doMock('mongoose', () => mongoose);

const target = {
  __mocks: {}
};

const traps = {
  get(target, prop) {
    if(target.hasOwnProperty(prop)) return Reflect.get(target, prop);

    return {
      toReturn(o, op = 'find') {
        target.__mocks[prop] = {
          [op]: o
        };
      }
    }
  }
};

const mockingoose = new Proxy(target, traps);

export default mockingoose;
