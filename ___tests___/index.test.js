import mockingoose from '../src/index';
import User from './User';

describe('mockingoose', () => {
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

  it('should update', () => {
    mockingoose.User.toReturn({ email: 'alon@ronin.co.il' }, 'update');

    return User
    .update({ email: 'alon@ronin.co.il' })
    .where('name', 'alon')
    .exec((err, result) => {
      expect(result).toEqual({ email: 'alon@ronin.co.il' });
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
  })
});