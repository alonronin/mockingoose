# Mockingoose
> A Jest package for mocking mongoose models

## Installation
```bash
$ npm i mockingoose -D
```

## Usage
```javascript
import mockingoose from 'mockingoose';

const doc = {
    _id: '1',
    name: 'name',
    value: 'value'
};

mockingoose.findById.returns(doc);

```