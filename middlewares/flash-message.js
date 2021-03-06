/* eslint-disable */
function _flash(type, msg) {
  var msgs = (this.session.flash = this.session.flash || {});
  if (type && msg) {
    if (arguments.length > 2) {
      var args = Array.prototype.slice.call(arguments, 1);
      msg = args.join(' ');
    } else if (Array.isArray(msg)) {
      msg.forEach(function(val) {
        (msgs[type] = msgs[type] || []).push(val);
      });
      return msgs[type].length;
    }
    return (msgs[type] = msgs[type] || []).push(msg);
  } else if (type) {
    var arr = msgs[type];
    delete msgs[type];
    return arr || [];
  } else {
    delete this.session.flash;
    return msgs;
  }
}

module.exports = function(req, res, next) {
  if (req.session === undefined) throw new Error('flash requires sessions');
  req.flash = _flash;
  next();
};
