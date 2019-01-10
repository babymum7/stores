const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

/* eslint-disable */
Node.prototype.on = window.on = function(name, fn) {
  this.addEventListener(name, fn);
};

NodeList.prototype.__proto__ = Array.prototype;

// prettier-ignore
NodeList.prototype.on = NodeList.prototype.addEventListener = function (name, fn) {
  this.forEach((elem) => {
    elem.on(name, fn);
  });
};

export { $, $$ };
