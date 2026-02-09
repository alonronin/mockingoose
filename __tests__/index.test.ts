import { describe, it, expect, beforeEach, vi } from 'vitest';
import mongoose from 'mongoose';
import mockingoose from '../src/index';
import User from './User';

describe('mockingoose', () => {
  beforeEach(() => {
    mockingoose.resetAll();
    vi.clearAllMocks();
  });

  describe('explicit tests', () => {
    it('should validate', async () => {
      const user = new User({
        email: 'user@email.com',
        name: 'user',
      });

      await user.validate();
      expect(user.toObject()).toHaveProperty('created');
      expect(user.toObject()).toHaveProperty('_id');
    });

    it('should lean', async () => {
      mockingoose(User).toReturn([{ name: '2' }]);

      const result = await User.find().lean();
      expect(result[0]).toMatchObject({ name: '2' });
    });

    it('should find', async () => {
      mockingoose(User).toReturn([{ name: '2' }]);

      const result = await User.find().where('name').in([1]);
      expect(result).toHaveLength(1);
      expect(result[0].toObject()).toHaveProperty('_id');
      expect(result[0].toObject()).toHaveProperty('created');
      expect(result[0].toObject()).toMatchObject({ name: '2' });
      expect(result[0]).toBeInstanceOf(User);
    });

    it('should work with function that is not an instance of a function', async () => {
      const returnMock = vi.fn().mockReturnValue({ name: '2' });
      mockingoose(User).toReturn(returnMock, 'findOne');

      const result = await User.findOne();
      expect(result!.toObject()).toHaveProperty('_id');
      expect(result!.toObject()).toHaveProperty('created');
      expect(result!.toObject()).toMatchObject({ name: '2' });
      expect(result).toBeInstanceOf(User);
    });

    it('should work with mockingoose(User)', async () => {
      const returnMock = vi.fn().mockReturnValue({ name: '2' });
      mockingoose(User).toReturn(returnMock, 'findOne');

      const result = await User.findOne();
      expect(result!.toObject()).toHaveProperty('_id');
      expect(result!.toObject()).toHaveProperty('created');
      expect(result!.toObject()).toMatchObject({ name: '2' });
      expect(result).toBeInstanceOf(User);
    });

    it('should find with mockingoose(model) with string', async () => {
      mockingoose(User.modelName).toReturn([{ name: '2' }]);

      const result = await User.find().where('name').in([1]);
      expect(result).toHaveLength(1);
      expect(result[0].toObject()).toHaveProperty('_id');
      expect(result[0].toObject()).toHaveProperty('created');
      expect(result[0].toObject()).toMatchObject({ name: '2' });
      expect(result[0]).toBeInstanceOf(User);
    });

    it('should find with function', async () => {
      mockingoose(User).toReturn((query: any) => {
        expect(query.getFilter()).toMatchObject({ name: { $in: [1] } });
        return [{ name: '2' }];
      });

      const result = await User.find({ name: 'a' }).where('name').in([1]);
      expect(result).toHaveLength(1);
      expect(result[0].toObject()).toHaveProperty('_id');
      expect(result[0].toObject()).toHaveProperty('created');
      expect(result[0].toObject()).toMatchObject({ name: '2' });
      expect(result[0]).toBeInstanceOf(User);
    });

    it('should not find', async () => {
      mockingoose(User).toReturn([]);

      const result = await User.find();
      expect(result).toHaveLength(0);
    });

    it('should not findOne', async () => {
      mockingoose(User).toReturn(null, 'findOne');

      const result = await User.findOne();
      expect(result).toBeFalsy();
    });

    it('should findById', async () => {
      const docObj = { name: 'name' };
      mockingoose(User).toReturn(docObj, 'findOne');

      const doc = await User.findById(1);
      expect(doc!.toObject()).toMatchObject(docObj);
    });

    it('should findById with function', async () => {
      const docObj = { name: 'name' };

      mockingoose(User).toReturn((query: any) => {
        expect(query).toBeInstanceOf(mongoose.Query);
        return docObj;
      }, 'findOne');

      const doc = await User.findById(1);
      expect(doc!.toObject()).toMatchObject(docObj);
    });

    it('should countDocuments', async () => {
      const count = 2;
      mockingoose(User).toReturn(count, 'countDocuments');

      const result = await User.countDocuments();
      expect(result).toBe(count);
    });

    it('should countDocuments with function', async () => {
      const count = 2;
      mockingoose(User).toReturn((query: any) => {
        expect(query).toBeInstanceOf(mongoose.Query);
        return count;
      }, 'countDocuments');

      const result = await User.countDocuments();
      expect(result).toBe(count);
    });

    it('should estimatedDocumentCount', async () => {
      const count = 2;
      mockingoose(User).toReturn(count, 'estimatedDocumentCount');

      const result = await User.estimatedDocumentCount();
      expect(result).toBe(count);
    });

    it('should estimatedDocumentCount with function', async () => {
      const count = 2;
      mockingoose(User).toReturn((query: any) => {
        expect(query).toBeInstanceOf(mongoose.Query);
        return count;
      }, 'estimatedDocumentCount');

      const result = await User.estimatedDocumentCount();
      expect(result).toBe(count);
    });

    it('should countDocuments exec', async () => {
      const count = 2;
      mockingoose(User).toReturn(count, 'countDocuments');

      const result = await User.countDocuments().exec();
      expect(result).toBe(count);
    });

    it('should estimatedDocumentCount exec', async () => {
      const count = 2;
      mockingoose(User).toReturn(count, 'estimatedDocumentCount');

      const result = await User.estimatedDocumentCount().exec();
      expect(result).toBe(count);
    });

    it('should distinct with simple array', async () => {
      const distinct = ['a', 'b'];
      mockingoose(User).toReturn(distinct, 'distinct');

      const result = await User.distinct('name').exec();
      expect(result).toBe(distinct);
    });

    it('should update with exec and callback', async () => {
      mockingoose(User).toReturn({ ok: 1, nModified: 1, n: 1 }, 'updateMany');

      const result = await User.updateMany({ email: 'name@mail.com' }, {})
        .where('name', 'name')
        .exec();
      expect(result).toEqual({ ok: 1, nModified: 1, n: 1 });
    });

    it('should update with exec and callback with function', async () => {
      mockingoose(User).toReturn((query: any) => {
        expect(query).toBeInstanceOf(mongoose.Query);
        return { ok: 1, nModified: 1, n: 1 };
      }, 'updateMany');

      const result = await User.updateMany({ email: 'name@mail.com' }, {})
        .where('name', 'name')
        .exec();
      expect(result).toEqual({ ok: 1, nModified: 1, n: 1 });
    });

    it('should update with callback', async () => {
      mockingoose(User).toReturn({ ok: 1, nModified: 1, n: 1 }, 'updateOne');

      const result = await User.updateOne(
        { name: 'name' },
        { email: 'name@mail.com' }
      );
      expect(result).toEqual({ ok: 1, nModified: 1, n: 1 });
    });

    it('should aggregate with callback', async () => {
      mockingoose(User).toReturn(
        [{ _id: { accountId: '5aef17c3d7c488f401c101bd' } }],
        'aggregate'
      );

      const result = await User.aggregate([
        {
          $group: {
            _id: {
              accountId: '$accountId',
            },
          },
        },
      ]);
      expect(result).toEqual([
        { _id: { accountId: '5aef17c3d7c488f401c101bd' } },
      ]);
    });

    it('should aggregate with callback using function', async () => {
      mockingoose(User).toReturn((agg: any) => {
        expect(agg).toBeInstanceOf(mongoose.Aggregate);
        return [{ _id: { accountId: '5aef17c3d7c488f401c101bd' } }];
      }, 'aggregate');

      const result = await User.aggregate([
        {
          $group: {
            _id: {
              accountId: '$accountId',
            },
          },
        },
      ]);
      expect(result).toEqual([
        { _id: { accountId: '5aef17c3d7c488f401c101bd' } },
      ]);
    });

    it('should aggregate with exec and callback', async () => {
      mockingoose(User).toReturn(
        [{ _id: { accountId: '5aef17c3d7c488f401c101bd' } }],
        'aggregate'
      );

      const result = await User.aggregate([
        {
          $group: {
            _id: {
              accountId: '$accountId',
            },
          },
        },
      ]).exec();
      expect(result).toEqual([
        { _id: { accountId: '5aef17c3d7c488f401c101bd' } },
      ]);
    });

    it('should aggregate with promise', async () => {
      mockingoose(User).toReturn(
        [{ _id: { accountId: '5aef17c3d7c488f401c101bd' } }],
        'aggregate'
      );

      const result = await User.aggregate([
        {
          $group: {
            _id: {
              accountId: '$accountId',
            },
          },
        },
      ]);
      expect(result).toEqual([
        { _id: { accountId: '5aef17c3d7c488f401c101bd' } },
      ]);
    });

    it('should create returns mongoose document', async () => {
      const result = await User.create({
        email: 'name@mail.com',
        name: 'name',
      });
      expect(result.toObject()).toMatchObject({
        email: 'name@mail.com',
        name: 'name',
      });
    });

    it('should find with callback', async () => {
      const docObj = [{ name: 'name' }];
      mockingoose(User).toReturn(docObj);

      const doc = await User.find({ _id: 1 });
      expect(doc[0].toObject()).toMatchObject(docObj[0]);
    });

    it('should reset a single mock', async () => {
      mockingoose(User).toReturn({ name: 'name' });
      mockingoose(User).reset();

      const doc = await User.find();
      expect(doc).toBeFalsy();
    });

    it('should reset a single mock operation', async () => {
      mockingoose(User).toReturn({ name: 'name' });
      mockingoose(User).reset('find');

      const doc = await User.find();
      expect(doc).toBeFalsy();
    });

    it('should fail to reset a single mock operation', async () => {
      mockingoose(User).toReturn([{ name: 'name' }]);
      mockingoose(User).reset('save');

      const doc = await User.find();
      expect(doc[0].toObject()).toMatchObject({ name: 'name' });
    });

    it('should be able to chain operations', async () => {
      mockingoose(User)
        .toReturn({ name: 'name' }, 'findOne')
        .toReturn({ name: 'another name' }, 'save');

      const user = await User.findOne();
      expect(user!.toObject()).toMatchObject({ name: 'name' });
      user!.name = 'another name';
      user!.email = 'name@email.com'; // or we will get Schema validation error
      const user1 = await user!.save();
      expect(user1.toObject()).toMatchObject({ name: 'another name' });
    });

    it('should return object with .toJSON()', () => {
      mockingoose(User)
        .toReturn({ name: 'name' })
        .toReturn({ name: 'a name too' }, 'findOne')
        .toReturn({ name: 'another name' }, 'save');

      const mocksString =
        '{"User":{"find":{"name":"name"},"findOne":{"name":"a name too"},"save":{"name":"another name"}}}';
      const mockString =
        '{"find":{"name":"name"},"findOne":{"name":"a name too"},"save":{"name":"another name"}}';

      const mocksObject = {
        User: {
          find: {
            name: 'name',
          },
          findOne: {
            name: 'a name too',
          },
          save: {
            name: 'another name',
          },
        },
      };

      expect(JSON.stringify(mockingoose)).toBe(mocksString);
      expect(JSON.stringify(mockingoose(User))).toBe(mockString);
      expect(mockingoose.toJSON()).toEqual(mocksObject);
    });

    it('should populate the Query properly with findOne', async () => {
      const docObj = {
        _id: '507f191e810c19729de860ea',
        email: 'name@email.com',
        name: 'name',
      };
      const finder = (query: any) => {
        if (query.getQuery()._id === '507f191e810c19729de860ea') {
          return docObj;
        }
      };

      mockingoose(User).toReturn(finder, 'findOne'); // findById is findOne

      const doc = await User.findById('507f191e810c19729de860ea');
      expect(JSON.parse(JSON.stringify(doc))).toMatchObject(docObj);
    });

    it('should mock .populate', async () => {
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
    });

    it('return correct mock for deleteOne', async () => {
      const doc = { n: 0, ok: 0, deletedCount: 0 };
      mockingoose(User).toReturn(doc, 'deleteOne');

      const result = await User.deleteOne({ name: 'test' });

      expect(result).toBe(doc);
    });

    it('return correct mock for deleteMany', async () => {
      const doc = { n: 1, ok: 1, deletedCount: 10 };
      mockingoose(User).toReturn(doc, 'deleteMany');

      const result = await User.deleteMany({ name: 'test' });

      expect(result).toBe(doc);
    });

    it('should return error in orFail() if we pass null', async () => {
      mockingoose(User).toReturn(null, 'findOne');

      await expect(User.findOne().orFail()).rejects.toEqual(new Error());
    });

    it('should return our custom error in orFail() if we pass null', async () => {
      const error = new Error('Empty Document');
      mockingoose(User).toReturn(error, 'findOne');

      await expect(User.findOne().orFail()).rejects.toEqual(error);
    });

    it('should return error in orFail() with find() if we pass null', async () => {
      mockingoose(User).toReturn(null, 'find');

      await expect(User.findOne().orFail()).rejects.toEqual(new Error());
    });

    it('should pass orFail() if there are some doc exist', async () => {
      const doc = [{ _id: 'abc' }];
      mockingoose(User).toReturn(doc, 'find');

      const result = await User.find().orFail();

      expect(result.length).toEqual(doc.length);
    });

    it('should replaceOne', async () => {
      const doc = { acknowledged: true, modifiedCount: 1, matchedCount: 1 };
      mockingoose(User).toReturn(doc, 'replaceOne');
      const result = await User.replaceOne(
        { name: 'test' },
        { name: 'replaced' }
      );
      expect(result).toBe(doc);
    });
  });

  describe('check all instance methods', () => {
    it('save resolves its promise correctly', async () => {
      const mocked = {
        email: 'name@email.com',
        name: 'save',
      };

      mockingoose(User).toReturn(mocked, 'findOne').toReturn(mocked, 'save');

      const user = await User.findOne();
      const user1 = await user!.save();
      expect(user1).toBeTruthy();
    });

    it('$save resolves its promise correctly', async () => {
      const mocked = { email: 'name@email.com', name: '$save' };
      mockingoose(User).toReturn(mocked, 'findOne').toReturn(mocked, '$save');
      const user = await User.findOne();
      const saved = await (user as any).$save();
      expect(saved).toBeTruthy();
      expect(saved.toObject()).toMatchObject(mocked);
    });

    it('returns false for exists method', async () => {
      mockingoose(User).toReturn(null, 'findOne');

      const result = await User.exists({ name: 'test' });

      expect(result).toBeFalsy();
    });

    it('returns true for exists method', async () => {
      mockingoose(User).toReturn({}, 'findOne');

      const result = await User.exists({ name: 'test' });

      expect(result).toBeTruthy();
    });

    it('returns should correctly mock insertMany', async () => {
      const docs = [{ email: '1' }, { email: '2' }, { email: 3 }];

      mockingoose(User).toReturn(docs, 'insertMany');

      const result = await User.insertMany(docs);

      expect(result.map((doc) => doc instanceof mongoose.Model)).toStrictEqual([
        true,
        true,
        true,
      ]);
    });

    it('returns should correctly mock insertMany with lean option', async () => {
      const docs = [{ email: '1' }, { email: '2' }, { email: 3 }];

      mockingoose(User).toReturn(docs, 'insertMany');

      const result = await User.insertMany(docs, { lean: true });

      expect(result.map((doc) => doc instanceof mongoose.Model)).toStrictEqual([
        false,
        false,
        false,
      ]);
    });

    it('returns should correctly mock insertMany with rawResult option', async () => {
      const docs = [{ email: '1' }, { email: '2' }, { email: 3 }];

      mockingoose(User).toReturn(docs, 'insertMany');

      const result: any = await User.insertMany(docs, { rawResult: true });

      expect(
        result.map((doc: any) => doc instanceof mongoose.Model)
      ).toStrictEqual([false, false, false]);
    });
  });

  describe('check all operations', () => {
    const ops = [
      'find',
      'findOne',
      'distinct',
      'findOneAndUpdate',
      'findOneAndDelete',
      'findOneAndReplace',
      'replaceOne',
      'updateOne',
      'updateMany',
      'deleteOne',
      'deleteMany',
    ] as const;

    describe('with promise', () => {
      ops.forEach((op) => {
        it(op, () => {
          const mocked = {
            name: op,
          };

          mockingoose(User).toReturn(mocked, op);

          const args: any[] = [];

          if (['updateOne', 'updateMany', 'replaceOne'].includes(op)) {
            args.push({}, {});
          }

          return (User as any)
            [op](...args)
            .then((doc: any) =>
              expect(
                doc instanceof mongoose.Model ? doc.toObject() : doc
              ).toMatchObject(mocked)
            );
        });
      });
    });

    describe('with exec and callback', () => {
      ops.forEach((op) => {
        it(op, async () => {
          const mocked = {
            name: op,
          };

          mockingoose(User).toReturn(mocked, op);

          const args: any[] = [];

          if (['updateOne', 'updateMany', 'replaceOne'].includes(op)) {
            args.push({}, {});
          }

          const doc = await (User as any)[op](...args).exec();
          expect(
            doc instanceof mongoose.Model ? doc.toObject() : doc
          ).toMatchObject(mocked);
        });
      });
    });

    describe('with callback', () => {
      ops.forEach((op) => {
        it(op, async () => {
          const mocked = {
            name: op,
          };

          mockingoose(User).toReturn(mocked, op);

          const args: any[] = [];

          switch (op) {
            case 'distinct':
            case 'findOne':
            case 'findOneAndDelete':
            case 'findOneAndReplace':
              args.push({});
              break;
            case 'updateOne':
            case 'updateMany':
            case 'findOneAndUpdate':
            case 'replaceOne':
              args.push({}, {});
              break;
          }

          const doc = await (User as any)[op](...args);
          expect(
            doc instanceof mongoose.Model ? doc.toObject() : doc
          ).toMatchObject(mocked);
        });
      });
    });
  });

  describe('bulkWrite', () => {
    it('should mock bulkWrite', async () => {
      const mockResult = {
        insertedCount: 1,
        modifiedCount: 0,
        deletedCount: 0,
      };
      mockingoose(User).toReturn(mockResult, 'bulkWrite');
      const result = await User.bulkWrite([
        { insertOne: { document: { name: 'test', email: 'test@mail.com' } } },
      ]);
      expect(result).toBe(mockResult);
    });

    it('should mock bulkWrite with function', async () => {
      mockingoose(User).toReturn(() => {
        return { insertedCount: 2, modifiedCount: 0, deletedCount: 0 };
      }, 'bulkWrite');
      const result = await User.bulkWrite([
        { insertOne: { document: { name: 'a', email: 'a@mail.com' } } },
        { insertOne: { document: { name: 'b', email: 'b@mail.com' } } },
      ]);
      expect(result).toEqual({
        insertedCount: 2,
        modifiedCount: 0,
        deletedCount: 0,
      });
    });

    it('should mock bulkWrite with error', async () => {
      mockingoose(User).toReturn(new Error('bulkWrite failed'), 'bulkWrite');
      await expect(
        User.bulkWrite([
          { insertOne: { document: { name: 'test', email: 'test@mail.com' } } },
        ])
      ).rejects.toThrow('bulkWrite failed');
    });
  });

  describe('bulkSave', () => {
    it('should mock bulkSave', async () => {
      const mockResult = {
        insertedCount: 2,
        modifiedCount: 0,
        deletedCount: 0,
      };
      mockingoose(User).toReturn(mockResult, 'bulkSave');
      const docs = [
        new User({ name: 'a', email: 'a@mail.com' }),
        new User({ name: 'b', email: 'b@mail.com' }),
      ];
      const result = await User.bulkSave(docs);
      expect(result).toBe(mockResult);
    });
  });

  describe('cursor support', () => {
    it('should iterate with next()', async () => {
      mockingoose(User).toReturn([
        { name: 'a', email: 'a@b.com' },
        { name: 'b', email: 'b@b.com' },
      ]);
      const cursor = User.find().cursor();
      const first = await cursor.next();
      const second = await cursor.next();
      const third = await cursor.next();
      expect(first!.toObject()).toMatchObject({ name: 'a' });
      expect(second!.toObject()).toMatchObject({ name: 'b' });
      expect(third).toBeNull();
    });

    it('should iterate with for-await-of', async () => {
      mockingoose(User).toReturn([
        { name: 'x', email: 'x@b.com' },
        { name: 'y', email: 'y@b.com' },
      ]);
      const results: any[] = [];
      for await (const doc of User.find().cursor()) {
        results.push(doc);
      }
      expect(results).toHaveLength(2);
      expect(results[0].toObject()).toMatchObject({ name: 'x' });
      expect(results[1].toObject()).toMatchObject({ name: 'y' });
    });

    it('should support eachAsync', async () => {
      mockingoose(User).toReturn([
        { name: 'p', email: 'p@b.com' },
        { name: 'q', email: 'q@b.com' },
      ]);
      const collected: any[] = [];
      await User.find()
        .cursor()
        .eachAsync((doc: any) => {
          collected.push(doc.toObject());
        });
      expect(collected).toHaveLength(2);
      expect(collected[0]).toMatchObject({ name: 'p' });
    });

    it('should support close()', async () => {
      mockingoose(User).toReturn([{ name: 'a', email: 'a@b.com' }]);
      const cursor = User.find().cursor();
      await cursor.close();
      const result = await cursor.next();
      expect(result).toBeNull();
    });
  });

  describe('delegated operations', () => {
    it('findByIdAndUpdate delegates to findOneAndUpdate mock', async () => {
      const doc = { name: 'updated', email: 'a@b.com' };
      mockingoose(User).toReturn(doc, 'findOneAndUpdate');
      const result = await User.findByIdAndUpdate('507f191e810c19729de860ea', {
        name: 'updated',
      });
      expect(result!.toObject()).toMatchObject(doc);
    });

    it('findByIdAndDelete delegates to findOneAndDelete mock', async () => {
      const doc = { name: 'deleted', email: 'a@b.com' };
      mockingoose(User).toReturn(doc, 'findOneAndDelete');
      const result = await User.findByIdAndDelete('507f191e810c19729de860ea');
      expect(result!.toObject()).toMatchObject(doc);
    });
  });

  describe('mongoose connections', () => {
    it('should mock mongoose.connect', async () => {
      await mongoose.connect('mock');
      expect(mongoose.connect).toBeCalled();
    });

    it('should mock mongoose.createConnection', async () => {
      await mongoose.createConnection('mock');
      expect(mongoose.createConnection).toBeCalled();
    });

    it('createConnection with callback', async () => {
      const conn = mongoose.createConnection('mongodb://localhost/test');

      (conn as any).once('open', console.log);
      (conn as any).on('error', console.error);

      const result = await conn;
      expect(result).toBe(conn);
    });

    it('register models on createConnection instance', async () => {
      mockingoose.Model.toReturn({ name: 'test' }, 'save');
      const conn = mongoose.createConnection('mongodb://localhost/test');

      const schema = new mongoose.Schema({
        name: String,
      });

      const Model = conn.model('Model', schema);

      const result = await Model.create({ name: 'test' });
      expect(result.toObject()).toMatchObject({ name: 'test' });
    });
  });
});
