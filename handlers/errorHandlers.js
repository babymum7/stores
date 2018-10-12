exports.handleErrors = fn => (req, res, next) => fn(req, res, next).catch(next);

exports.notFound = (req, res, next) => {
  res.status(404).render('notFound', { message: 'Page not found' });
};

exports.productionErrors = (err, req, res, next) => {
  const message = err.message || 'something went wrong';
  req.flash('error', message);
  if (req.method === 'POST') {
    res.redirect('back');
  } else {
    res.redirect('/');
  }
};

exports.developmentErrors = (err, req, res, next) => {
  if (err.stack) {
    const stack = err.stack
      .replace(/[a-z_-\d]+.js:\d+:\d+/gi, '<mark>$&</mark>')
      .replace(/^(.+)?Error:.+(?=\n)/, '<span style="color:red">$&</span>');
    res.status(500).format({
      'text/html': () => res.render('error', { stack }),
      'application/json': () => res.json(stack)
    });
  }
};
