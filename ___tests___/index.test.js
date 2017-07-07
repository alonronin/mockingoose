import mockingoose from '../src/index';
import User from './User';

describe('mockingoose', () => {
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
      mockingoose.User.toReturn({ name: 2 });

      return User
      .find()
      .where('name')
      .in([1])
      .then(result => {
        expect(result).toEqual({ name: 2 });
      })
    });

    it('should update with exec and callback', (done) => {
      mockingoose.User.toReturn({ email: 'alon@ronin.co.il' }, 'update');

      User
      .update({ email: 'alon@ronin.co.il' })
      .where('name', 'alon')
      .exec((err, result) => {
        expect(result).toEqual({ email: 'alon@ronin.co.il' });
        done();
      })
    });

    it('should create', () => {
      mockingoose.User.toReturn({ _id: '1' }, 'save');

      return User
      .create({ email: 'alon@ronin.co.il' })
      .then(result => {
        expect(result).toEqual({ _id: '1' });
      })
    });

    it('should return error', () => {
      mockingoose.User.toReturn(new Error(), 'save');

      return User
      .create({ email: 'alon@ronin.co.il' })
      .catch(err => {
        expect(err).toBeInstanceOf(Error);
      })
    });

    it('should find with callback', (done) => {
      const _doc = { name: 'alon' };
      mockingoose.User.toReturn(_doc);

      User.find({ _id: 1}, (err, doc) => {
        expect(err).toBeNull();
        expect(doc).toBe(_doc);
        done();
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
            op
          };

          mockingoose.User.toReturn(mocked, op);

          return User[op]().then(doc => expect(doc).toBe(mocked));
        });
      })
    });

    describe('with exec and callback', () => {
      ops.forEach(op => {
        it(op, (done) => {
          const mocked = {
            op
          };

          mockingoose.User.toReturn(mocked, op);

          User[op]().exec((err, doc) => {
            expect(err).toBeNull();
            expect(doc).toBe(mocked);
            done();
          });
        });
      })
    });

    describe('with callback', () => {
      ops.forEach(op => {
        it(op, (done) => {
          const mocked = {
            op
          };

          mockingoose.User.toReturn(mocked, op);

          switch(op) {
            case 'distinct':
            case 'findOne':
            case 'findOneAndRemove':
              User[op]({}, (err, doc) => {
                expect(err).toBeNull();
                expect(doc).toBe(mocked);
                done();
              });

              break;
            case 'findOneAndUpdate':
              User[op]({}, {}, {}, (err, doc) => {
                expect(err).toBeNull();
                expect(doc).toBe(mocked);
                done();
              });

              break;
            default:
              User[op]((err, doc) => {
                expect(err).toBeNull();
                expect(doc).toBe(mocked);
                done();
              });
          }

        });
      })
    })
  });
});

