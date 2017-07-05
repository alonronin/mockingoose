# Mockingoose
![logo]
> A Jest package for mocking mongoose models

## Installation
```bash
$ npm i mockingoose -D
```

## Usage
```js
// model.js
import mongoose from 'mongoose';
const { Schema } = mongoose;

const schema = Schema({
    name: String,
    value: String
})

export default mongoose.model('Model', schema);
```

```js
// __tests__/model.test.js
import mockingoose from 'mockingoose';
import model from './model';

const doc = {
    _id: '507f191e810c19729de860ea',
    name: 'name',
    value: 'value'
};

mockingoose.Model.findById.toReturn(doc);

describe('test mongoose model', () => {
    it('should return the doc with findById', () => {
        return model
            .findById({ _id: '507f191e810c19729de860ea'})
            .then(_doc => {
                expect(_doc).toEqual(doc);
            })
    })
})
```
[logo]: http://animals.sandiegozoo.org/sites/default/files/2016-12/DwarfMongoose_ZN.jpg
