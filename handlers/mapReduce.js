// prettier-ignore
exports.mapAdd = function() {
  const document = this;
  const haveFields = ['name', 'description', 'tags'];
  const keys = Object.keys(document).filter(key => haveFields.includes(key));
  /* eslint-disable */
  /* prettier-ignore */
  const emitWords = string => string
    .replace(/[^\w\s]/gi, '')
    .toLowerCase()
    .trim()
    .split(' ')
    .forEach(word => emit(word, 1));
  /* eslint-enable */
  keys.forEach(key => {
    if (Array.isArray(document[key])) {
      document[key].forEach(element => emitWords(element));
    } else {
      emitWords(document[key]);
    }
  });
};

exports.mapMinus = function() {
  const document = this;
  const haveFields = ['name', 'description', 'tags'];
  const keys = Object.keys(document).filter(key => haveFields.includes(key));
  /* eslint-disable */
  /* prettier-ignore */
  const emitWords = string => string
    .replace(/[^\w\s]/gi, '')
    .toLowerCase()
    .trim()
    .split(' ')
    .forEach(word => emit(word, -1));
  /* eslint-enable */
  keys.forEach(key => {
    if (Array.isArray(document[key])) {
      document[key].forEach(element => emitWords(element));
    } else {
      emitWords(document[key]);
    }
  });
};

exports.reduce = function(key, values) {
  /* eslint-disable */
  return values.reduce((result, e) => (result += e), 0);
  /* eslint-enable */
};
