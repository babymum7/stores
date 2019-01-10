const fs = require('fs');
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

const { window } = new JSDOM('');
const DOMPurify = createDOMPurify(window);

exports.pureDom = DOMPurify.sanitize;

exports.moment = require('moment');

exports.dump = obj => JSON.stringify(obj, undefined, 2);

/* prettier-ignore */
exports.staticMap = ([lng, lat]) => `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=15&size=800x150&scale=2&markers=size:tiny|color:red|${lat},${lng}&key=${process.env.MAP_KEY}`;

exports.icon = name => fs.readFileSync(`./frontend/images/icons/${name}.svg`);

exports.siteName = "Now That's Delicious!";

exports.menu = [
  { slug: '/stores', title: 'Stores', icon: 'store' },
  { slug: '/tags', title: 'Tags', icon: 'tag' },
  { slug: '/top', title: 'Top', icon: 'top' },
  { slug: '/add', title: 'Add', icon: 'add' },
  { slug: '/map', title: 'Map', icon: 'map' }
];
