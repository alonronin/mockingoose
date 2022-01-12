# Mockingoose [![CircleCI](https://circleci.com/gh/alonronin/mockingoose/tree/master.svg?style=svg)](https://circleci.com/gh/alonronin/mockingoose/tree/master)

![logo]

> A Jest package for mocking mongoose models

## Installation

With NPM:
```bash
$ npm i mockingoose -D
```

With Yarn:
```bash
$ yarn add mockingoose -D
```

## Import the library

```js
const mockingoose = require('mockingoose');

```

## Usage

```js
// user.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const schema = Schema({
  name: String,
  email: String,
  created: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', schema);
```

#### mockingoose(Model).toReturn(obj, operation = 'find')

Returns a plain object.

```js
// __tests__/user.test.js
const mockingoose = require('mockingoose');

const model = require('./user');

describe('test mongoose User model', () => {
  it('should return the doc with findById', () => {
    const _doc = {
      _id: '507f191e810c19729de860ea',
      name: 'name',
      email: 'name@email.com',
    };

    mockingoose(model).toReturn(_doc, 'findOne');

    return model.findById({ _id: '507f191e810c19729de860ea' }).then(doc => {
      expect(JSON.parse(JSON.stringify(doc))).toMatchObject(_doc);
    });
  });

  it('should return the doc with update', () => {
    const _doc = {
      _id: '507f191e810c19729de860ea',
      name: 'name',
      email: 'name@email.com',
    };

    mockingoose(model).toReturn(_doc, 'update');

    return model
      .update({ name: 'changed' }) // this won't really change anything
      .where({ _id: '507f191e810c19729de860ea' })
      .then(doc => {
        expect(JSON.parse(JSON.stringify(doc))).toMatchObject(_doc);
      });
  });
});
```

#### mockingoose(Model).toReturn(fn, operation = 'find')

Allows passing a function in order to return the result.

You will be able to inspect the query using the parameter passed to the function. This will be either a Mongoose [Query](https://mongoosejs.com/docs/api.html#Query) or [Aggregate](https://mongoosejs.com/docs/api.html#Aggregate) class, depending on your usage.

You can use [snapshots](https://jestjs.io/docs/en/snapshot-testing) to automatically test that the queries sent out are valid.

```js
// __tests__/user.test.js
const mockingoose = require('mockingoose');
const model = require('./user');

describe('test mongoose User model', () => {
  it('should return the doc with findById', () => {
    const _doc = {
      _id: '507f191e810c19729de860ea',
      name: 'name',
      email: 'name@email.com',
    };
    const finderMock = query => {
      expect(query.getQuery()).toMatchSnapshot('findById query');

      if (query.getQuery()._id === '507f191e810c19729de860ea') {
        return _doc;
      }
    };

    mockingoose(model).toReturn(finderMock, 'findOne'); // findById is findOne

    return model.findById('507f191e810c19729de860ea').then(doc => {
      expect(JSON.parse(JSON.stringify(doc))).toMatchObject(_doc);
    });
  });
});
```

#### mockingoose(Model).reset(operation = undefined)

will reset Model mock, if pass an operation, will reset only this operation mock.

```js
it('should reset model mock', () => {
  mockingoose(model).toReturn({ name: '1' });
  mockingoose(model).toReturn({ name: '2' }, 'save');

  mockingoose(model).reset(); // will reset all operations;
  mockingoose(model).reset('find'); // will reset only find operations;
});
```

you can also chain `mockingoose#ModelName` operations:

```js
mockingoose(model)
  .toReturn({ name: 'name' })
  .toReturn({ name: 'a name too' }, 'findOne')
  .toReturn({ name: 'another name' }, 'save')
  .reset('find');
```

#### mockingoose.resetAll()

will reset all mocks.

```js
beforeEach(() => {
  mockingoose.resetAll();
});
```

### Operations available:

- [x] `find` - for find query
- [x] `findOne` - for findOne query
- [x] `count` - for count query (deprecated)
- [x] `countDocuments` for count query
- [x] `estimatedDocumentCount` for count collection documents
- [x] `distinct` - for distinct query
- [x] `findOneAndUpdate` - for findOneAndUpdate query
- [x] `findOneAndRemove` - for findOneAndRemove query
- [x] `update` - for update query (DEPRECATED)
- [x] `updateOne` - for updateOne query
- [x] `updateMany` - for updateMany query
- [x] `save` - for create, and save documents `Model.create()` or `Model.save()` or `doc.save()`
- [x] `remove` - for remove query (DEPRECATED)
- [x] `deleteOne` - for deleteOne query
- [x] `deleteMany` - for deleteMany query
- [x] `aggregate` - for aggregate framework
- [x] `insertMany` - for `Model.insertMany()` bulk insert, can also pass `{ lean: true, rawResult: true }` options.

### Notes

All operations work with `exec`, `promise` and `callback`.

- if you are using `Model.create` and you don't pass a mock with mockingoose you'll receive the mongoose created doc (with ObjectId and transformations)

- validations are working as expected.

- the returned document is an instance of mongoose Model.

- `deleteOne` and `updateOne` operation returns original mocked object.

- you can simulate Error by passing an Error to mockingoose:

  ```js
  mockingoose(model).toReturn(new Error('My Error'), 'save');

  return model.create({ name: 'name', email: 'name@email.com' }).catch(err => {
    expect(err.message).toBe('My Error');
  });
  ```

- you can mock `.populate` in your mocked result just be sure to change 
  the `Schema`'s path to appropriate type (eg: `Object` | `Mixed`):
  
  ```js
  User.schema.path('foreignKey', Object);
  
  const doc = {
    email: 'test@mail.com',
    foreignKey: {
      _id: '5ca4af76384306089c1c30ba',
      name: 'test',
      value: 'test',
    },
    name: 'Name',
    saveCount: 1,
  };
    
  mockingoose(User).toReturn(doc);
    
  const result = await User.find();
    
  expect(result).toMatchObject(doc);
  ```

- you can mock the `Model.exists()` by passing the `findOne` operator. see [Issue #69](https://github.com/alonronin/mockingoose/issues/69)
  
- no connection is made to the database (mongoose.connect is jest.fn())

- will work with node 6.4.x. tested with mongoose 4.x and jest 20.x.

- check tests for more, feel free to fork and contribute.

#### Recent Changes:

- `mockingoose.ModelName` is deprecated, `mockingoose(Model)` is the now the recommended usage, with `Model` being a Mongoose model class.

  Alternatively, you may pass a string with the model name.

- `mockingoose(Model).toReturn((query) => value)` can now take also take a function as a parameter.

  The function is called with either a [Query](https://mongoosejs.com/docs/api.html#Query) or [Aggregate](https://mongoosejs.com/docs/api.html#Aggregate) object from Mongoose, depending on the request. This allows tests to ensure that proper queries are sent out, and helps with regression testing.

[logo]: http://animals.sandiegozoo.org/sites/default/files/2016-12/DwarfMongoose_ZN.jpg

### Shoutout to our amazing community

#### Stargazers

[![Stargazers repo roster for @alonronin/mockingoose](https://reporoster.com/stars/alonronin/mockingoose)](https://github.com/alonronin/mockingoose/stargazers)

#### Forkers

[![Forkers repo roster for @alonronin/mockingoose](https://reporoster.com/forks/alonronin/mockingoose)](https://github.com/alonronin/mockingoose/network/members)
