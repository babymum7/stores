import '../sass/style.scss';
import '../fa/css/all.css';
import '../images/photos/store.png';
import '../images/photos/404.png';

import { $, $$ } from './modules/bind';
import typeAhead from './modules/typeAhead';

typeAhead($('.search'));

const heartForms = $$('form.heart');
if (heartForms) {
  import(/* webpackChunkName: "ajaxHeart" */ './modules/heart')
    .then(({ default: ajaxHeart }) => heartForms.on('submit', ajaxHeart))
    .catch(() => 'An error occurred while loading the component');
}

if ($('#address')) {
  import(/* webpackChunkName: "autocompleteForm" */ './modules/autocomplete')
    .then(({ default: autocompleteForm }) => autocompleteForm($('#address'), $('#lng'), $('#lat')))
    .catch(() => 'An error occurred while loading the component');
}
if ($('#map')) {
  import(/* webpackChunkName: "makeMap" */ './modules/map')
    .then(({ default: makeMap }) => makeMap($('#map')))
    .catch(() => 'An error occurred while loading the component');
}

if ($('#rating')) {
  import(/* webpackChunkName: "rating" */ './modules/rating')
    .then(({ default: rating }) => rating($('#rating')))
    .catch(() => 'An error occurred while loading the component');
}

if ($('#loadReview')) {
  import(/* webpackChunkName: "loadReview" */ './modules/loadReview')
    .then(({ default: loadReview }) => loadReview($('#loadReview')))
    .catch(() => 'An error occurred while loading the component');
}
