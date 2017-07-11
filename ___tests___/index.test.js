import mockingoose from '../src/index';
import User from './User';

describe('mockingoose', () => {
  beforeEach(() => mockingoose.resetAll());

  describe('explicit tests', () => {
    it('should validate', () => {
      const user = new User({
        name: 'user',
        email: 'user@email.com'
      });

      return user.validate().then(() => {
        expect(user.toObject()).toHaveProperty('created');
        expect(user.toObject()).toHaveProperty('_id')
      })
    });

    it('should find', () => {
      mockingoose.User.toReturn({ name: "2" });

      return User
      .find()
      .where('name')
      .in([1])
      .then(result => {
        expect(result.toObject()).toMatchObject({ name: "2" });
      })
    });

    it('should update with exec and callback', (done) => {
      mockingoose.User.toReturn({  ok: 1, nModified: 1, n: 1 }, 'update');

      User
      .update({ email: 'name@mail.com' })
      .where('name', 'name')
      .exec((err, result) => {
        expect(result).toEqual({  ok: 1, nModified: 1, n: 1 });
        done();
      })
    });

    it('should create returns mock', () => {
      mockingoose.User.toReturn({ _id: '507f191e810c19729de860ea' }, 'save');

      return User
      .create({ email: 'name@mail.com' })
      .then(result => {
        expect(JSON.parse(JSON.stringify(result))).toMatchObject({ _id: '507f191e810c19729de860ea' });
      })
    });

    it('should create returns mongoose document', () => {
      return User
      .create({ name: 'name', email: 'name@mail.com' })
      .then(result => {
        expect(result.toObject()).toMatchObject({ name: 'name', email: 'name@mail.com' });
      })
    });

    it('should return error', () => {
      mockingoose.User.toReturn(new Error(), 'save');

      return User
      .create({ email: 'name@mail.com' })
      .catch(err => {
        expect(err).toBeInstanceOf(Error);
      })
    });

    it('should find with callback', (done) => {
      const _doc = { name: 'name' };
      mockingoose.User.toReturn(_doc);

      User.find({ _id: 1}, (err, doc) => {
        expect(err).toBeNull();
        expect(doc.toObject()).toMatchObject(_doc);
        done();
      })
    });

    it('should reset a single mock', () => {
      mockingoose.User.toReturn({ name: 'name' });
      mockingoose.User.reset();

      return User.find().then(doc => {
        expect(doc.toObject()).not.toMatchObject({ name: 'name' })
      })
    });

    it('should reset a single mock operation', () => {
      mockingoose.User.toReturn({ name: 'name' });
      mockingoose.User.reset('find');

      return User.find().then(doc => {
        expect(doc.toObject()).not.toMatchObject({ name: 'name' })
      })
    });

    it('should fail to reset a single mock operation', () => {
      mockingoose.User.toReturn({ name: 'name' });
      mockingoose.User.reset('save');

      return User.find().then(doc => {
        expect(doc.toObject()).toMatchObject({ name: 'name' })
      })
    })
  });

  describe('check all operations', () => {
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

    describe('with promise', () => {
      ops.forEach(op => {
        it(op, () => {
          const mocked = {
            name: op
          };

          mockingoose.User.toReturn(mocked, op);

          return User[op]().then(doc => expect(doc.toObject()).toMatchObject(mocked));
        });
      })
    });

    describe('with exec and callback', () => {
      ops.forEach(op => {
        it(op, (done) => {
          const mocked = {
            name: op
          };

          mockingoose.User.toReturn(mocked, op);

          User[op]().exec((err, doc) => {
            expect(err).toBeNull();
            expect(doc.toObject()).toMatchObject(mocked)
            done();
          });
        });
      })
    });

    describe('with callback', () => {
      ops.forEach(op => {
        it(op, (done) => {
          const mocked = {
            name: op
          };

          mockingoose.User.toReturn(mocked, op);

          switch(op) {
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
                expect(doc.toObject()).toMatchObject(mocked)
                done();
              });

              break;
            default:
              User[op]((err, doc) => {
                expect(err).toBeNull();
                expect(doc.toObject()).toMatchObject(mocked)
                done();
              });
          }
        });
      })
    })
  });
});

