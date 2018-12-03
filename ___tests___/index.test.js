import mockingoose from '../src/index';
import mongoose from 'mongoose';
import User from './User';

describe('mockingoose', () => {
	beforeEach(() => {
		mockingoose.resetAll();
		jest.clearAllMocks();
	});

	describe('explicit tests', () => {
		it('should validate', () => {
			const user = new User({
				name: 'user',
				email: 'user@email.com'
			});

			return user.validate().then(() => {
				expect(user.toObject()).toHaveProperty('created');
				expect(user.toObject()).toHaveProperty('_id');
			});
		});

		it('should lean', () => {
			mockingoose.User.toReturn([{ name: '2' }]);

			return User
				.find()
				.lean()
				.then(result => {
					expect(result[0]).toMatchObject({ name: '2' });
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
			mockingoose.User.toReturn(null, 'findOne');

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

		it('should countDocuments', () => {
			const count = 2;
			mockingoose.User.toReturn(count, 'countDocuments');

			return User.countDocuments().then(result => {
				expect(result).toBe(count);
			});
		});

		it('should estimatedDocumentCount', () => {
			const count = 2;
			mockingoose.User.toReturn(count, 'estimatedDocumentCount');

			return User.estimatedDocumentCount().then(result => {
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

		it('should countDocuments exec and cb', (done) => {
			const count = 2;
			mockingoose.User.toReturn(count, 'countDocuments');

			User
				.countDocuments()
				.exec((err, result) => {
					expect(result).toBe(count);
					done();
				});
		});

		it('should estimatedDocumentCount exec and cb', (done) => {
			const count = 2;
			mockingoose.User.toReturn(count, 'estimatedDocumentCount');

			User
				.estimatedDocumentCount()
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

		it('should update with callback', (done) => {
			mockingoose.User.toReturn({ ok: 1, nModified: 1, n: 1 }, 'update');

			User
				.update({ name: 'name' }, { email: 'name@mail.com' }, {}, (err, result) => {
					expect(result).toEqual({ ok: 1, nModified: 1, n: 1 });
					done();
				});
		});

		it('should aggregate with callback', (done) => {
			mockingoose.User.toReturn([{ _id: { accountId: '5aef17c3d7c488f401c101bd' } }], 'aggregate');

			User
				.aggregate(
					[{
						'$group': {
							'_id': {
								'accountId': '$accountId'
							}
						}
					}],
					(err, result) => {
						expect(result).toEqual([{ _id: { accountId: '5aef17c3d7c488f401c101bd' } }]);
						done();
					}
				);
		});

		it('should aggregate with exec snd callback', (done) => {
			mockingoose.User.toReturn([{ _id: { accountId: '5aef17c3d7c488f401c101bd' } }], 'aggregate');

			User
				.aggregate(
					[{
						'$group': {
							'_id': {
								'accountId': '$accountId'
							}
						}
					}]
				).exec(
				(err, result) => {
					expect(result).toEqual([{ _id: { accountId: '5aef17c3d7c488f401c101bd' } }]);
					done();
				}
			);
		});

		it('should aggregate with promise', () => {
			mockingoose.User.toReturn([{ _id: { accountId: '5aef17c3d7c488f401c101bd' } }], 'aggregate');

			return User
				.aggregate(
					[{
						'$group': {
							'_id': {
								'accountId': '$accountId'
							}
						}
					}])
				.then(result => {
					expect(result).toEqual([{ _id: { accountId: '5aef17c3d7c488f401c101bd' } }]);
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
			mockingoose.User.toReturn(new Error('My Error'), 'save');

			return User
				.create({ name: 'name', email: 'name@mail.com' })
				.catch(err => {
					expect(err.message).toBe('My Error');
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
						name: 'name'
					},
					findOne: {
						name: 'a name too'
					},
					save: {
						name: 'another name'
					}
				}
			};

			expect(JSON.stringify(mockingoose)).toBe(mocksString);
			expect(JSON.stringify(mockingoose.User)).toBe(mockString);
			expect(mockingoose.toJSON()).toEqual(mocksObject);
		});
	});

	describe('check all instance methods', () => {
		const instanceMethods = [
			'save',
			'remove'
		];

		instanceMethods.forEach(op => {
			it(`${op} resolves its promise correctly`, () => {
				const mocked = {
					name: op,
					email: 'name@email.com'
				};

				mockingoose.User.toReturn(mocked, 'findOne')
					.toReturn(mocked, op);

				return User.findOne().then(user => {
					return user[op]();
				})
					.then(user => {
						expect(user).toBeTruthy();
					});
			});
		});

		it(`save calls its hook correctly`, () => {
			const mocked = {
				name: 'save',
				email: 'name@email.com'
			};

			mockingoose.User.toReturn(null, 'save');

			User.create(mocked).then(user => {
				expect(user.saveCount).toBe(1);
				user.name = 'save2';
				user.save((err, user) => {
					expect(user.saveCount).toBe(2);
				})
			});
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
			'update',
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

					const args = [];

					if (op === 'update') {
						args.push({}, {});
					}

					return User[op](...args)
						.then(doc => expect(doc instanceof mongoose.Model
							? doc.toObject() : doc).toMatchObject(mocked));
				});
			});
		});

		describe('with exec and callback', () => {
			ops.forEach(op => {
				it(op, (done) => {
					const mocked = {
						name: op
					};

					mockingoose.User.toReturn(mocked, op);

					const args = [];

					if (op === 'update') {
						args.push({}, {});
					}

					User[op](...args).exec((err, doc) => {
						expect(err).toBeNull();
						expect(doc instanceof mongoose.Model
							? doc.toObject() : doc).toMatchObject(mocked);
						done();
					});
				});
			});
		});

		describe('with callback', () => {
			ops.forEach(op => {
				it(op, (done) => {
					const mocked = {
						name: op
					};

					mockingoose.User.toReturn(mocked, op);

					const args = [];

					switch (op) {
						case 'distinct':
						case 'findOne':
						case 'findOneAndRemove':
							args.push({});

							break;
						case 'update':
						case 'findOneAndUpdate':
							args.push({}, {}, {});

							break;
					}

					args.push((err, doc) => {
						expect(err).toBeNull();
						expect(doc instanceof mongoose.Model
							? doc.toObject() : doc).toMatchObject(mocked);
						done();
					});

					User[op](...args);
				});
			});
		});
	});

	describe('mongoose connections', () => {
		it('should mock mongoose.connect', () => {
			return mongoose.connect().then(() => {
				expect(mongoose.connect).toBeCalled();
			});
		});

		it('should mock mongoose.createConnection', (done) => {
			mongoose.createConnection().then(() => {
				expect(mongoose.createConnection).toBeCalled();
				done();
			});
		});

		it('createConnection with callback', () => {
			const conn = mongoose.createConnection('mongodb://localhost/test');

			conn.once('open', console.log);
			conn.on('error', console.error);

			conn.then((result) => {
				expect(result).toBe(conn);
			});
		});

		it('register models on createConnection instance', (done) => {
			mockingoose.Model.toReturn({ name: 'test' }, 'save');
			const conn = mongoose.createConnection('mongodb://localhost/test');

			const schema = mongoose.Schema({
				name: String
			});

			const Model = conn.model('Model', schema);

			Model.create({ name: 'test' }).then((result) => {
				expect(result.toObject()).toMatchObject({ name: 'test' });
				done();
			});
		});
	});
});
