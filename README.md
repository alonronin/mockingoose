# Mockingoose
![logo]
> A Jest package for mocking mongoose models

## Installation
```bash
$ npm i mockingoose -D
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

#### mockingoose#ModelName#toReturn(obj, operation = 'find')

```js
// __tests__/user.test.js
import mockingoose from 'mockingoose';
import model from './model';

describe('test mongoose User model', () => {
  it('should return the doc with findById', () => {
    const _doc = {
        _id: '507f191e810c19729de860ea',
        name: 'name',
        email: 'name@email.com'
    };
    
    mockingoose.User.toReturn(_doc); // operation `find` is default
    
    return model
    .findById({ _id: '507f191e810c19729de860ea'})
    .then(doc => {
      expect(JSON.parse(JSON.stringify(doc)).toMatchObject(_doc);
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
        expect(JSON.parse(JSON.stringify(doc)).toMatchObject(_doc);
      })
    })
})
```

#### mockingoose#ModelName#reset(operation = undefined)

will reset Model mock, if pass an operation, will reset only this operation mock.

```js
it('should reset model mock', () => {
  mockingoose.User.toReturn({ name: '1' });
  mockingoose.User.toReturn({ name: '2' }, 'save');
  
  mockingoose.User.reset(); // will reset all operations;
  mockingoose.User.reset('find'); // will reset only find operations;
})
```

you can also chain `mockingoose#ModelName` operations:

```js
mockingoose.User
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
- [x] `count` - for count query
- [x] `distinct` - for distinct query
- [x] `findOneAndUpdate` - for findOneAndUpdate query
- [x] `findOneAndRemove` - for findOneAndRemove query
- [x] `update` - for update query
- [x] `save` - for create, and save documents `Model.create()` or `Model.save()` or `doc.save()`
- [x] `remove` - for remove query
- [x] `deleteOne` - for deleteOne query
- [x] `deleteMany` - for deleteMany query

### Notes
All operations works with `exec`, `promise` and `callback`.  

if you are using `Model.create` and you don't pass a mock with mockingoose,  
you'll receive the mongoose created doc (with ObjectId and transformations)

validations are working as expected.

the returned document is an instance of mongoose Model.

`update` operation returns original mocked object.

you can simulate Error by passing an Error to mockingoose:

```js
mockingoose.User.toReturn(new Error(), 'save');

return User
    .create({ email: 'name@email.com' })
    .catch(err => {
      expect(err).toBeInstanceOf(Error);
    })
```

no connection is made to the database (mongoose.connect is jest.fn())

will work with node 6.4.x. tested with mongoose 4.x and jest 20.x.

check tests for more, feel free to fork and contribute.

[logo]: http://animals.sandiegozoo.org/sites/default/files/2016-12/DwarfMongoose_ZN.jpg
