---
name: mongoose-mongodb
description: Work with MongoDB in Node.js using Mongoose ODM for schema design, CRUD operations, relationships, and advanced queries
sasmp_version: "1.3.0"
bonded_agent: 01-nodejs-fundamentals
bond_type: PRIMARY_BOND
---

# Mongoose & MongoDB Skill

Master MongoDB database integration in Node.js with Mongoose, the elegant object modeling library.

## Quick Start

Connect and CRUD in 4 steps:
1. **Install** - `npm install mongoose`
2. **Connect** - `mongoose.connect(uri)`
3. **Define Schema** - Create data models
4. **CRUD** - Create, Read, Update, Delete

## Core Concepts

### Connection Setup
```javascript
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

mongoose.connection.on('connected', () => {
  console.log('MongoDB connected');
});
```

### Schema & Model
```javascript
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: 3,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  age: {
    type: Number,
    min: 18,
    max: 120
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  }
}, {
  timestamps: true  // createdAt, updatedAt
});

const User = mongoose.model('User', userSchema);
```

### CRUD Operations
```javascript
// Create
const user = await User.create({
  name: 'John Doe',
  email: 'john@example.com'
});

// Read
const users = await User.find({ age: { $gte: 18 } });
const user = await User.findById(id);
const user = await User.findOne({ email: 'john@example.com' });

// Update
const updated = await User.findByIdAndUpdate(
  id,
  { name: 'Jane Doe' },
  { new: true, runValidators: true }
);

// Delete
await User.findByIdAndDelete(id);
await User.deleteMany({ age: { $lt: 18 } });
```

### Relationships & Population
```javascript
const postSchema = new mongoose.Schema({
  title: String,
  content: String,
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

// Populate relationship
const post = await Post.findById(id).populate('author');
// post.author is now full user object
```

## Learning Path

### Beginner (2-3 weeks)
- ✅ Install MongoDB and Mongoose
- ✅ Create schemas and models
- ✅ CRUD operations
- ✅ Basic queries

### Intermediate (4-5 weeks)
- ✅ Relationships and population
- ✅ Validation and middleware
- ✅ Indexes for performance
- ✅ Query operators

### Advanced (6-8 weeks)
- ✅ Aggregation pipelines
- ✅ Transactions
- ✅ Schema design patterns
- ✅ Performance optimization

## Advanced Features

### Indexes
```javascript
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ name: 1, age: -1 });
```

### Middleware (Hooks)
```javascript
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});
```

### Virtual Properties
```javascript
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});
```

### Aggregation Pipeline
```javascript
const stats = await User.aggregate([
  { $match: { age: { $gte: 18 } } },
  { $group: {
    _id: '$role',
    count: { $sum: 1 },
    avgAge: { $avg: '$age' }
  }},
  { $sort: { count: -1 } }
]);
```

## Query Operators
```javascript
// Comparison
User.find({ age: { $gt: 18 } })     // Greater than
User.find({ age: { $gte: 18 } })    // Greater or equal
User.find({ age: { $lt: 65 } })     // Less than
User.find({ age: { $lte: 65 } })    // Less or equal
User.find({ age: { $ne: 30 } })     // Not equal

// Logical
User.find({ $and: [{ age: { $gte: 18 } }, { age: { $lte: 65 } }] })
User.find({ $or: [{ role: 'admin' }, { role: 'moderator' }] })

// Array
User.find({ tags: { $in: ['node', 'mongodb'] } })
User.find({ tags: { $nin: ['deprecated'] } })

// Regex
User.find({ email: /gmail\.com$/ })
```

## Best Practices
- ✅ Use environment variables for connection strings
- ✅ Create indexes for frequently queried fields
- ✅ Use `lean()` for read-only queries (better performance)
- ✅ Validate data at schema level
- ✅ Use transactions for multi-document operations
- ✅ Handle connection errors properly
- ✅ Close connections on app shutdown

## When to Use

Use MongoDB with Mongoose when:
- Building Node.js applications
- Need flexible schema (document-based)
- Handling large volumes of data
- Rapid prototyping and iteration
- Working with JSON-like data

## Related Skills
- Express REST API (connect to MongoDB)
- Async Programming (async database operations)
- JWT Authentication (store users)
- Jest Testing (test database operations)

## Resources
- [Mongoose Documentation](https://mongoosejs.com)
- [MongoDB Manual](https://docs.mongodb.com)
- [Schema Design Patterns](https://www.mongodb.com/blog/post/building-with-patterns-a-summary)
