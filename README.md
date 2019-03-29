# Mockingoose [![CircleCI](https://circleci.com/gh/alonronin/mockingoose/tree/master.svg?style=svg)](https://circleci.com/gh/alonronin/mockingoose/tree/master)

![logo]
> A Jest package for mocking mongoose models

## Installation
```bash
$ npm i mockingoose -D
```

## Import the library
```js
// using commonJS
const mockingoose = require('mockingoose').default;
const mockModel = mockingoose.mockModel;

// using es201x
import mockingoose from 'mockingoose';
import { mockModel } from 'mockingoose';
```

## Usage
```js
// user.js
import mongoose from 'mongoose';
const { Schema } = mongoose;

const schema = Schema({
    name: String,
    email: String,
    created: { type: Date, default: Date.now }
})

export default mongoose.model('User', schema);
```

#### mockModel#ModelName#toReturn(obj, operation = 'find')
Returns a plain object.
```js
// __tests__/user.test.js
import { mockModel } from 'mockingoose';

import model from './user';

describe('test mongoose User model', () => {
  it('should return the doc with findById', () => {
    const _doc = {
        _id: '507f191e810c19729de860ea',
        name: 'name',
        email: 'name@email.com'
    };
    
    mockModel(User).toReturn(_doc, 'findOne');

    return model
    .findById({ _id: '507f191e810c19729de860ea'})
    .then(doc => {
      expect(JSON.parse(JSON.stringify(doc))).toMatchObject(_doc);
    })
  })
  
  it('should return the doc with update', () => {
      const _doc = {
          _id: '507f191e810c19729de860ea',
          name: 'name',
          email: 'name@email.com'
      };
      
      mockingoose.User.toReturn(doc, 'update');
      
      return model
      .update({ name: 'changed' }) // this won't really change anything
      .where({ _id: '507f191e810c19729de860ea'})
      .then(doc => {
        expect(JSON.parse(JSON.stringify(doc))).toMatchObject(_doc);
      })
    })
})
```


#### mockModel#ModelName#toReturn(fn, operation = 'find')
Allows passing a function in order to return the result. 

You will be able to inspect the query using the parameter passed to the function. This will be either a Mongoose [Query](https://mongoosejs.com/docs/api.html#Query) or [Aggregate](https://mongoosejs.com/docs/api.html#Aggregate) class, depending on your usage.

You can use [snapshots](https://jestjs.io/docs/en/snapshot-testing) to automatically test that the queries sent out are valid.

```js
// __tests__/user.test.js
import { mockModel } from 'mockingoose';
import model from './user';

describe('test mongoose User model', () => {
  it('should return the doc with findById', () => {
    const _doc = {
      _id: '507f191e810c19729de860ea',
      name: 'name',
      email: 'name@email.com'
    }
    const finderMock = (query) => {
      expect(query.getQuery()).toMatchSnapshot('findById query');

      if (query.getQuery()._id === '507f191e810c19729de860ea') {
        return _doc;
      }
    };
    
    mockModel(User).toReturn(finderMock, 'findOne'); // findById is findOne
    
    return User
    .findById('507f191e810c19729de860ea')
    .then(doc => {
      expect(JSON.parse(JSON.stringify(doc))).toMatchObject(_doc);
    })
  })
})
```

#### mockModel#ModelName#reset(operation = undefined)

will reset Model mock, if pass an operation, will reset only this operation mock.

```js
it('should reset model mock', () => {
  mockModel(User).toReturn({ name: '1' });
  mockModel(User).toReturn({ name: '2' }, 'save');
  
  mockModel(User).reset(); // will reset all operations;
  mockModel(User).reset('find'); // will reset only find operations;
})
```

you can also chain `mockingoose#ModelName` operations:

```js
mockModel(User)
        .toReturn({ name: 'name' })
        .toReturn({ name: 'a name too' }, 'findOne')
        .toReturn({ name: 'another name' }, 'save')
        .reset('find');
```

#### mockingoose#resetAll()

will reset all mocks.

```js
beforeEach(() => {
  mockingoose.resetAll();
})
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
- [x] `update` - for update query
- [x] `save` - for create, and save documents `Model.create()` or `Model.save()` or `doc.save()`
- [x] `remove` - for remove query
- [x] `deleteOne` - for deleteOne query
- [x] `deleteMany` - for deleteMany query
- [x] `aggregate` - for aggregate framework

### Notes
The library is built with Typescript and typings are included.

All operations work with `exec`, `promise` and `callback`.  

if you are using `Model.create` and you don't pass a mock with mockingoose,  
you'll receive the mongoose created doc (with ObjectId and transformations)

validations are working as expected.

the returned document is an instance of mongoose Model.

`update` operation returns original mocked object.

you can simulate Error by passing an Error to mockingoose:

```js
mockModel(User).toReturn(new Error('My Error'), 'save');

return User
    .create({ name: 'name', email: 'name@email.com' })
    .catch(err => {
      expect(err.message).toBe('My Error');
    })
```

no connection is made to the database (mongoose.connect is jest.fn())

will work with node 6.4.x. tested with mongoose 4.x and jest 20.x.

check tests for more, feel free to fork and contribute.

### TODO:

- [x] Return `Jest.fn` for `Model.save` mock
- [x] Support `Model.aggregate`

[logo]: http://animals.sandiegozoo.org/sites/default/files/2016-12/DwarfMongoose_ZN.jpg
