# Mockingoose [![CI](https://github.com/alonronin/mockingoose/actions/workflows/ci.yml/badge.svg)](https://github.com/alonronin/mockingoose/actions/workflows/ci.yml)

![logo]

> A package for mocking Mongoose models — works with Jest and Vitest

## Installation

```bash
npm i mockingoose -D
```

## Import

```ts
// ESM / TypeScript
import mockingoose from 'mockingoose';

// CommonJS
const mockingoose = require('mockingoose');
```

## Usage

```ts
// user.ts
import mongoose, { Schema } from 'mongoose';

const schema = new Schema({
  name: String,
  email: String,
  created: { type: Date, default: Date.now },
});

export default mongoose.model('User', schema);
```

#### mockingoose(Model).toReturn(obj, operation = 'find')

Returns a plain object.

```ts
// __tests__/user.test.ts
import mockingoose from 'mockingoose';
import User from './user';

describe('test mongoose User model', () => {
  it('should return the doc with findById', async () => {
    const _doc = {
      _id: '507f191e810c19729de860ea',
      name: 'name',
      email: 'name@email.com',
    };

    mockingoose(User).toReturn(_doc, 'findOne');

    const doc = await User.findById('507f191e810c19729de860ea');
    expect(JSON.parse(JSON.stringify(doc))).toMatchObject(_doc);
  });

  it('should return the doc with updateOne', async () => {
    const _doc = { ok: 1, nModified: 1, n: 1 };

    mockingoose(User).toReturn(_doc, 'updateOne');

    const result = await User.updateOne({ name: 'changed' }, {});
    expect(result).toMatchObject(_doc);
  });
});
```

#### mockingoose(Model).toReturn(fn, operation = 'find')

Allows passing a function in order to return the result.

You will be able to inspect the query using the parameter passed to the function. This will be either a Mongoose [Query](https://mongoosejs.com/docs/api.html#Query) or [Aggregate](https://mongoosejs.com/docs/api.html#Aggregate) class, depending on your usage.

```ts
import mockingoose from 'mockingoose';
import User from './user';

describe('test mongoose User model', () => {
  it('should return the doc with findById', async () => {
    const _doc = {
      _id: '507f191e810c19729de860ea',
      name: 'name',
      email: 'name@email.com',
    };

    const finderMock = (query: any) => {
      if (query.getQuery()._id === '507f191e810c19729de860ea') {
        return _doc;
      }
    };

    mockingoose(User).toReturn(finderMock, 'findOne');

    const doc = await User.findById('507f191e810c19729de860ea');
    expect(JSON.parse(JSON.stringify(doc))).toMatchObject(_doc);
  });
});
```

#### mockingoose(Model).reset(operation = undefined)

Will reset Model mock. If passed an operation, will reset only that operation's mock.

```ts
mockingoose(User).toReturn({ name: '1' });
mockingoose(User).toReturn({ name: '2' }, 'save');

mockingoose(User).reset(); // will reset all operations
mockingoose(User).reset('find'); // will reset only find operation
```

You can also chain operations:

```ts
mockingoose(User)
  .toReturn({ name: 'name' })
  .toReturn({ name: 'a name too' }, 'findOne')
  .toReturn({ name: 'another name' }, 'save')
  .reset('find');
```

#### mockingoose.resetAll()

Will reset all mocks.

```ts
beforeEach(() => {
  mockingoose.resetAll();
});
```

### Operations available:

- `find` - for find query
- `findOne` - for findOne query
- `countDocuments` - for count query
- `estimatedDocumentCount` - for count collection documents
- `distinct` - for distinct query
- `findOneAndUpdate` - for findOneAndUpdate query
- `findOneAndDelete` - for findOneAndDelete query
- `findOneAndReplace` - for findOneAndReplace query
- `updateOne` - for updateOne query
- `updateMany` - for updateMany query
- `save` - for create, and save documents `Model.create()` or `Model.save()` or `doc.save()`
- `deleteOne` - for deleteOne query
- `deleteMany` - for deleteMany query
- `aggregate` - for aggregate framework
- `replaceOne` - for replaceOne query
- `insertMany` - for `Model.insertMany()` bulk insert, can also pass `{ lean: true, rawResult: true }` options.
- `bulkWrite` - for `Model.bulkWrite()` bulk operations
- `bulkSave` - for `Model.bulkSave()` bulk save

### Cursor Support

You can mock `cursor()` on find queries. The cursor uses the `find` mock data and supports `next()`, `eachAsync()`, `close()`, and `for await...of`:

```ts
mockingoose(User).toReturn([{ name: 'a' }, { name: 'b' }]);

// next()
const cursor = User.find().cursor();
const first = await cursor.next();
const second = await cursor.next();
const done = await cursor.next(); // null

// for await...of
for await (const doc of User.find().cursor()) {
  console.log(doc);
}

// eachAsync
await User.find()
  .cursor()
  .eachAsync((doc) => {
    console.log(doc);
  });
```

### Notes

All operations work with `exec` and `promise` patterns.

- If you are using `Model.create` and you don't pass a mock with mockingoose you'll receive the mongoose created doc (with ObjectId and transformations)

- Validations work as expected.

- The returned document is an instance of mongoose Model.

- `deleteOne` and `updateOne` operations return the original mocked object.

- You can simulate errors by passing an Error to mockingoose:

  ```ts
  mockingoose(User).toReturn(new Error('My Error'), 'save');

  await expect(
    User.create({ name: 'name', email: 'name@email.com' })
  ).rejects.toThrow('My Error');
  ```

- You can mock `.populate` in your mocked result — just change the Schema's path to appropriate type (e.g., `Object` | `Mixed`):

  ```ts
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

- You can mock `Model.exists()` via the `findOne` operation. See [Issue #69](https://github.com/alonronin/mockingoose/issues/69)

- No connection is made to the database (mongoose.connect is mocked)

- Requires Node.js 18+ and Mongoose 9+. Tested with Vitest and Jest.

### v3.0.0 Breaking Changes

- Rewritten in TypeScript with full type exports
- Requires Node.js >= 18 and Mongoose >= 9
- Removed deprecated operations: `count`, `update`, `remove`, `findOneAndRemove`
- ESM + CJS dual package (use `import` or `require`)
- Tests use Vitest (Jest still supported at runtime)

#### Notes:

- `mockingoose.ModelName` is deprecated, `mockingoose(Model)` is the recommended usage, with `Model` being a Mongoose model class.

  Alternatively, you may pass a string with the model name.

- `mockingoose(Model).toReturn((query) => value)` can also take a function as a parameter.

  The function is called with either a [Query](https://mongoosejs.com/docs/api.html#Query) or [Aggregate](https://mongoosejs.com/docs/api.html#Aggregate) object from Mongoose, depending on the request. This allows tests to ensure that proper queries are sent out, and helps with regression testing.

[logo]: mockingoose.png

### Shoutout to our amazing community

#### Stargazers

[![Stargazers repo roster for @alonronin/mockingoose](https://reporoster.com/stars/dark/alonronin/mockingoose)](https://github.com/alonronin/mockingoose/stargazers)

#### Forkers

[![Forkers repo roster for @alonronin/mockingoose](https://reporoster.com/forks/dark/alonronin/mockingoose)](https://github.com/alonronin/mockingoose/network/members)
