import mockingoose from '../src/index';
import * as mongoose from 'mongoose';
import User from './User';
import { mockModel } from '../src/index';
import { tuple } from '../src/tuple';

describe('mockingoose', () => {
	beforeEach(() => {
		mockingoose.resetAll();
		jest.clearAllMocks();
	});

	describe('explicit tests', () => {
		it('should validate', async () => {
			const user = new User({
				name: 'user',
				email: 'user@email.com'
			});

			await user.validate();
			expect(user.toObject()).toHaveProperty('created');
			expect(user.toObject()).toHaveProperty('_id');
		});

		it('should lean', async () => {
			mockingoose.User.toReturn([{ name: '2' }]);

			const result = await User
				.find()
				.lean();
			expect(result[0]).toMatchObject({ name: '2' });
		});

		it('should find', async () => {
			mockingoose.User.toReturn([{ name: '2' }]);

			const result = await User
				.find()
				.where('name')
				.in([1]);
			expect(result).toHaveLength(1);
			expect(result[0].toObject()).toHaveProperty('_id');
			expect(result[0].toObject()).toHaveProperty('created');
			expect(result[0].toObject()).toMatchObject({ name: '2' });
			expect(result[0]).toBeInstanceOf(User);
		});

		it('should find with mockModel with string', async () => {
			mockModel(User.modelName).toReturn([{ name: '2' }]);

			const result = await User
				.find()
				.where('name')
				.in([1]);
			expect(result).toHaveLength(1);
			expect(result[0].toObject()).toHaveProperty('_id');
			expect(result[0].toObject()).toHaveProperty('created');
			expect(result[0].toObject()).toMatchObject({ name: '2' });
			expect(result[0]).toBeInstanceOf(User);
		});

		it('should find with mockModel with Model', async () => {
			mockModel(User).toReturn([{ name: '2' }]);

			const result = await User
				.find()
				.where('name')
				.in([1]);
			expect(result).toHaveLength(1);
			expect(result[0].toObject()).toHaveProperty('_id');
			expect(result[0].toObject()).toHaveProperty('created');
			expect(result[0].toObject()).toMatchObject({ name: '2' });
			expect(result[0]).toBeInstanceOf(User);
		});

		it('should find with function', async () => {
			mockingoose.User.toReturn((query: mongoose.Query<any>) => {
				expect(query.getQuery()).toMatchObject({ name: { '$in': [ 1 ] } });
				return [{ name: '2' }];
			} );

			const result = await User
				.find({ name: 'a' })
				.where('name')
				.in([1]);
			expect(result).toHaveLength(1);
			expect(result[0].toObject()).toHaveProperty('_id');
			expect(result[0].toObject()).toHaveProperty('created');
			expect(result[0].toObject()).toMatchObject({ name: '2' });
			expect(result[0]).toBeInstanceOf(User);
		});

		it('should not find', async () => {
			mockingoose.User.toReturn([]);

			const result = await User
				.find();
			expect(result).toHaveLength(0);
		});

		it('should not findOne', async () => {
			mockingoose.User.toReturn(null, 'findOne');

			const result = await User
				.findOne();
			expect(result).toBeFalsy();
		});

		it('should findById', async () => {
			const _doc = { name: 'name' };
			mockingoose.User.toReturn(_doc, 'findOne');

			const doc = await User.findById(1);
			expect(doc.toObject()).toMatchObject(_doc);
		});

		it('should findById with function', async () => {
			const _doc = { name: 'name' };
			mockingoose.User.toReturn((query) => (expect(query).toBeInstanceOf(mongoose.Query), _doc), 'findOne');

			const doc = await User.findById(1);
			expect(doc.toObject()).toMatchObject(_doc);
		});

		it('should count', async () => {
			const count = 2;
			mockingoose.User.toReturn(count, 'count');

			const result = await User.count({});
			expect(result).toBe(count);
		});

		it('should count with function', async () => {
			const count = 2;
			mockingoose.User.toReturn((query) => (expect(query).toBeInstanceOf(mongoose.Query), count), 'count');

			const result = await User.count({});
			expect(result).toBe(count);
		});

		it('should countDocuments', async () => {
			const count = 2;
			mockingoose.User.toReturn(count, 'countDocuments');

			const result = await User.countDocuments();
			expect(result).toBe(count);
		});

		it('should countDocuments with function', async () => {
			const count = 2;
			mockingoose.User.toReturn((query) => (expect(query).toBeInstanceOf(mongoose.Query), count), 'countDocuments');

			const result = await User.countDocuments();
			expect(result).toBe(count);
		});

		it('should estimatedDocumentCount', async () => {
			const count = 2;
			mockingoose.User.toReturn(count, 'estimatedDocumentCount');

			const result = await User.estimatedDocumentCount();
			expect(result).toBe(count);
		});

		it('should estimatedDocumentCount with function', async () => {
			const count = 2;
			mockingoose.User.toReturn((query) => (expect(query).toBeInstanceOf(mongoose.Query), count), 'estimatedDocumentCount');

			const result = await User.estimatedDocumentCount();
			expect(result).toBe(count);
		});

		it('should count exec and cb', (done) => {
			const count = 2;
			mockingoose.User.toReturn(count, 'count');

			User
				.count({})
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

		it('should distinct with simple array', (done) => {
			const distinct = ['a', 'b'];
			mockingoose.User.toReturn(distinct, 'distinct');

			User
				.distinct('name')
				.exec((err, result) => {
					expect(result).toBe(distinct);
					done();
				});
		});

		it('should update with exec and callback', (done) => {
			mockingoose.User.toReturn({ ok: 1, nModified: 1, n: 1 }, 'update');

			User
				.update({ email: 'name@mail.com' }, {})
				.where('name', 'name')
				.exec((err, result) => {
					expect(result).toEqual({ ok: 1, nModified: 1, n: 1 });
					done();
				});
		});

		it('should update with exec and callback with function', (done) => {
			mockingoose.User.toReturn((query) => (expect(query).toBeInstanceOf(mongoose.Query), { ok: 1, nModified: 1, n: 1 }), 'update');

			User
				.update({ email: 'name@mail.com' }, {})
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

		it('should aggregate with callback using function', (done) => {
			mockingoose.User.toReturn((agg) => (expect(agg).toBeInstanceOf(mongoose.Aggregate), [{ _id: { accountId: '5aef17c3d7c488f401c101bd' } }]), 'aggregate');

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

		it('should aggregate with exec and callback', (done) => {
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

		it('should aggregate with promise', async () => {
			mockingoose.User.toReturn([{ _id: { accountId: '5aef17c3d7c488f401c101bd' } }], 'aggregate');

			const result = await User
				.aggregate([{
					'$group': {
						'_id': {
							'accountId': '$accountId'
						}
					}
				}]);
			expect(result).toEqual([{ _id: { accountId: '5aef17c3d7c488f401c101bd' } }]);
		});

		it('should create returns mock', async () => {
			mockingoose.User.toReturn({ _id: '507f191e810c19729de860ea' }, 'save');

			const result = await User
				.create({ email: 'name@mail.com' });
			expect(JSON.parse(JSON.stringify(result))).toMatchObject({ _id: '507f191e810c19729de860ea' });
		});

		it('should create returns mongoose document', async () => {
			const result = await User
				.create({ name: 'name', email: 'name@mail.com' });
			expect(result.toObject()).toMatchObject({ name: 'name', email: 'name@mail.com' });
		});

		it('should return error', async () => {
			const error = new Error('My Error');
			mockingoose.User.toReturn(error, 'save');
			await expect(User.create({ name: 'name', email: 'name@mail.com' })).rejects.toEqual(error);
		});

		it('should find with callback', (done) => {
			const _doc = [{ name: 'name' }];
			mockingoose.User.toReturn(_doc);

			User.find({ _id: 1 }, (err, doc) => {
				expect(err).toBeNull();
				expect(doc[0].toObject()).toMatchObject(_doc[0]);
				done();
			});
		});

		it('should reset a single mock', async () => {
			mockingoose.User.toReturn({ name: 'name' });
			mockingoose.User.reset();

			const doc = await User.find();
			expect(doc).toBeFalsy();
		});

		it('should reset a single mock operation', async () => {
			mockingoose.User.toReturn({ name: 'name' });
			mockingoose.User.reset('find');

			const doc = await User.find();
			expect(doc).toBeFalsy();
		});

		it('should fail to reset a single mock operation', async () => {
			mockingoose.User.toReturn([{ name: 'name' }]);
			mockingoose.User.reset('save');

			const doc = await User.find();
			expect(doc[0].toObject()).toMatchObject({ name: 'name' });
		});

		it('should be able to chain operations', async () => {
			mockingoose.User
				.toReturn({ name: 'name' }, 'findOne')
				.toReturn({ name: 'another name' }, 'save');

			const user = await User.findOne();
			expect(user.toObject()).toMatchObject({ name: 'name' });
			user.name = 'another name';
			user.email = 'name@email.com'; // or we will get Schema validation error
			const user_1 = await user.save();
			expect(user_1.toObject()).toMatchObject({ name: 'another name' });
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

		it('should populate the Query properly with findOne', async () => {
			const _doc = {
				_id: '507f191e810c19729de860ea',
				name: 'name',
				email: 'name@email.com'
			}
			const finder = (query) => {
				if (query.getQuery()._id === '507f191e810c19729de860ea') {
					return _doc;
				}
			};
			
			mockingoose.User.toReturn(finder, 'findOne'); // findById is findOne
			
			const doc = await User
				.findById('507f191e810c19729de860ea');
			expect(JSON.parse(JSON.stringify(doc))).toMatchObject(_doc);
		})
	});

	describe('check all instance methods', () => {
		const instanceMethods = tuple(
			'save',
			'remove'
		);

		instanceMethods.forEach(op => {
			it(`${op} resolves its promise correctly`, async () => {
				const mocked = {
					name: op,
					email: 'name@email.com'
				};

				mockingoose.User.toReturn(mocked, 'findOne')
					.toReturn(mocked, op);

				const user = await User.findOne();
				const user_1 = await user[op]();
				expect(user_1).toBeTruthy();
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
		const ops = tuple(
			'find',
			'findOne',
			'distinct',
			'findOneAndUpdate',
			'findOneAndRemove',
			'findOneAndDelete',
			'findOneAndReplace',
			'remove',
			'update',
			'deleteOne',
			'deleteMany'
		);

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
						case 'findOneAndDelete':
						case 'findOneAndReplace':
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
		it('should mock mongoose.connect', async () => {
			await mongoose.connect('mock');
			expect(mongoose.connect).toBeCalled();
		});

		it('should mock mongoose.createConnection', (done) => {
			mongoose.createConnection('mock').then(() => {
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

			const schema = new mongoose.Schema({
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
