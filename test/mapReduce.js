const mongoose = require('mongoose');

const Store = require('./store');

mongoose.Promise = global.Promise;
mongoose.connect(
  'mongodb://localhost:27017/test',
  { useNewUrlParser: true }
);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

const arr = [
  { name: 'nguyen binh trong', description: 'rat dep trai he he' },
  { name: 'ly ly', description: 'rat xau gai he' }
];

const map = function() {
  const document = this;
  const keys = Object.keys(document).filter(
    key => typeof document[key] === 'string' && key !== '_id'
  );
  keys.forEach(key => {
    /* eslint-disable */
    document[key].split(' ').forEach(word => emit(word, 1));
    /* eslint-enable */
  });
};

const reduce = function(key, values) {
  /* eslint-disable */
  return values.reduce((result, e) => (result += e), 0);
  /* eslint-disable */
};

const mrObject = {
  map,
  reduce,
  out: { replace: 'words' }
};

async function db() {
  await Store.deleteMany();
  await Store.insertMany(arr);
  await Store.mapReduce(mrObject);
  await mongoose.disconnect();
}

const arr2 = [{ name: 'nguyen binh trong', description: 'rat dep trai he he' }];

async function db2() {
  const results = await Store.insertMany(arr2);
  await Store.mapReduce({
    map,
    reduce,
    out: { reduce: 'words' },
    query: { _id: results[0]._id }
  });
  await mongoose.disconnect();
}

// db().catch(err => {
//   console.log(err);
//   mongoose.disconnect();
// });

db2().catch(err => {
  console.log(err);
  mongoose.disconnect();
});
