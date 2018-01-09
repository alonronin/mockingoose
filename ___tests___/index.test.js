import mockingoose from '../src/index';
import User from './User';

describe('mockingoose', () => {
  beforeEach(() => mockingoose.resetAll());

  describe('explicit tests', () => {
    it('should validate', () => {
      const user = new User({
        name: 'user',
        email: 'user@email.com',
      });

      return user.validate().then(() => {
        expect(user.toObject()).toHaveProperty('created');
        expect(user.toObject()).toHaveProperty('_id');
      });
    });

    it('should find', () => {
      mockingoose.User.toReturn([{ name: '2' }]);

      return User
        .find()
        .where('name')
        .in([1])
        .then(result => {
          expect(result).toHaveLength(1);
          expect(result[0].toObject()).toHaveProperty('_id');
          expect(result[0].toObject()).toHaveProperty('created');
          expect(result[0].toObject()).toMatchObject({ name: '2' });
          expect(result[0]).toBeInstanceOf(User);
        });
    });

    it('should not find', () => {
      mockingoose.User.toReturn([]);

      return User
        .find()
        .then(result => {
          expect(result).toHaveLength(0);
        });
    });

    it('should not findOne', () => {
      mockingoose.User.toReturn(null);

      return User
        .findOne()
        .then(result => {
          expect(result).toBeFalsy();
        });
    });

    it('should findById', () => {
      const _doc = { name: 'name' };
      mockingoose.User.toReturn(_doc, 'findOne');

      return User.findById(1).then(doc => {
        expect(doc.toObject()).toMatchObject(_doc);
      });
    });

    it('should count', () => {
      const count = 2;
      mockingoose.User.toReturn(count, 'count');

      return User.count().then(result => {
        expect(result).toBe(count);
      });
    });

    it('should count exec and cb', (done) => {
      const count = 2;
      mockingoose.User.toReturn(count, 'count');

      User
        .count()
        .exec((err, result) => {
          expect(result).toBe(count);
          done();
        });
    });

    it('should update with exec and callback', (done) => {
      mockingoose.User.toReturn({ ok: 1, nModified: 1, n: 1 }, 'update');

      User
        .update({ email: 'name@mail.com' })
        .where('name', 'name')
        .exec((err, result) => {
          expect(result).toEqual({ ok: 1, nModified: 1, n: 1 });
          done();
        });
    });

    it('should create returns mock', () => {
      mockingoose.User.toReturn({ _id: '507f191e810c19729de860ea' }, 'save');

      return User
        .create({ email: 'name@mail.com' })
        .then(result => {
          expect(JSON.parse(JSON.stringify(result))).toMatchObject({ _id: '507f191e810c19729de860ea' });
        });
    });

    it('should create returns mongoose document', () => {
      return User
        .create({ name: 'name', email: 'name@mail.com' })
        .then(result => {
          expect(result.toObject()).toMatchObject({ name: 'name', email: 'name@mail.com' });
        });
    });

    it('should return error', () => {
      mockingoose.User.toReturn(new Error(), 'save');

      return User
        .create({ email: 'name@mail.com' })
        .catch(err => {
          expect(err).toBeInstanceOf(Error);
        });
    });

    it('should find with callback', (done) => {
      const _doc = { name: 'name' };
      mockingoose.User.toReturn(_doc);

      User.find({ _id: 1 }, (err, doc) => {
        expect(err).toBeNull();
        expect(doc.toObject()).toMatchObject(_doc);
        done();
      });
    });

    it('should reset a single mock', () => {
      mockingoose.User.toReturn({ name: 'name' });
      mockingoose.User.reset();

      return User.find().then(doc => {
        expect(doc).toBeFalsy();
      });
    });

    it('should reset a single mock operation', () => {
      mockingoose.User.toReturn({ name: 'name' });
      mockingoose.User.reset('find');

      return User.find().then(doc => {
        expect(doc).toBeFalsy();
      });
    });

    it('should fail to reset a single mock operation', () => {
      mockingoose.User.toReturn({ name: 'name' });
      mockingoose.User.reset('save');

      return User.find().then(doc => {
        expect(doc.toObject()).toMatchObject({ name: 'name' });
      });
    });

    it('should be able to chain operations', () => {
      mockingoose.User
        .toReturn({ name: 'name' }, 'findOne')
        .toReturn({ name: 'another name' }, 'save');

      return User.findOne().then(user => {
        expect(user.toObject()).toMatchObject({ name: 'name' });

        user.name = 'another name';
        user.email = 'name@email.com'; // or we will get Schema validation error

        return user.save().then(user => {
          expect(user.toObject()).toMatchObject({ name: 'another name' });
        });
      });
    });

    it('should return object with .toJSON()', () => {
      mockingoose.User
        .toReturn({ name: 'name' })
        .toReturn({ name: 'a name too' }, 'findOne')
        .toReturn({ name: 'another name' }, 'save');

      const mocksString = '{"User":{"find":{"name":"name"},"findOne":{"name":"a name too"},"save":{"name":"another name"}}}';
      const mockString = '{"find":{"name":"name"},"findOne":{"name":"a name too"},"save":{"name":"another name"}}';

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
      expect(JSON.stringify(mockingoose.User)).toBe(mockString);
      expect(mockingoose.toJSON()).toEqual(mocksObject);
    });
  });

  describe('check all operations', () => {
    const ops = [
      'find',
      'findOne',
      'distinct',
      'findOneAndUpdate',
      'findOneAndRemove',
      'remove',
      'deleteOne',
      'deleteMany',
    ];

    describe('with promise', () => {
      ops.forEach(op => {
        it(op, () => {
          const mocked = {
            name: op,
          };

          mockingoose.User.toReturn(mocked, op);

          return User[op]().then(doc => expect(doc.toObject()).toMatchObject(mocked));
        });
      });
    });

    describe('with exec and callback', () => {
      ops.forEach(op => {
        it(op, (done) => {
          const mocked = {
            name: op,
          };

          mockingoose.User.toReturn(mocked, op);

          User[op]().exec((err, doc) => {
            expect(err).toBeNull();
            expect(doc.toObject()).toMatchObject(mocked);
            done();
          });
        });
      });
    });

    describe('with callback', () => {
      ops.forEach(op => {
        it(op, (done) => {
          const mocked = {
            name: op,
          };

          mockingoose.User.toReturn(mocked, op);

          switch (op) {
            case 'distinct':
            case 'findOne':
            case 'findOneAndRemove':
              User[op]({}, (err, doc) => {
                expect(err).toBeNull();
                expect(doc.toObject()).toMatchObject(mocked);
                done();
              });

              break;
            case 'findOneAndUpdate':
              User[op]({}, {}, {}, (err, doc) => {
                expect(err).toBeNull();
                expect(doc.toObject()).toMatchObject(mocked);
                done();
              });

              break;
            default:
              User[op]((err, doc) => {
                expect(err).toBeNull();
                expect(doc.toObject()).toMatchObject(mocked);
                done();
              });
          }
        });
      });
    });
  });
});

