# Mockingoose
> A Jest package for mocking mongoose models

## Installation
```bash
$ npm i mockingoose -D
```

## Usage
```js
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