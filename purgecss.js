// this file run when build prod, after webpack, to remove all css unused
// it logs all css was removed, if have ant mistake add css rule to ingore in "whitelistPatterns" below

const Purgecss = require('purgecss');
const path = require('path');
const fs = require('fs');

const results = fs.readdirSync(path.resolve('public'));
const cssFiles = results.filter(el => el.includes('.css'))[0];
const purgecss = new Purgecss({
  content: ['frontend/**/*.js', 'views/**/*.pug'],
  css: [`public/${cssFiles}`],
  whitelistPatterns: [/svg/, /flash/],
  rejected: true
});
const purgecssResult = purgecss.purge();
fs.writeFileSync(path.resolve('public', cssFiles), purgecssResult[0].css);
purgecssResult[0].rejected.forEach(el => console.log(el));
