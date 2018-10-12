import '../sass/style.scss';

import { $, $$ } from './modules/bind';
import typeAhead from './modules/typeAhead';

typeAhead($('.search'));

const heartForms = $$('form.heart');
if (heartForms) {
  import(/* webpackChunkName: "ajaxHeart" */ './modules/heart')
    .then(({ default: ajaxHeart }) => heartForms.on('submit', ajaxHeart))
    .catch(error => 'An error occurred while loading the component');
}

if ($('#address')) {
  import(/* webpackChunkName: "autocompleteForm" */ './modules/autocomplete')
    .then(({ default: autocompleteForm }) =>
      autocompleteForm($('#address'), $('#lng'), $('#lat'))
    )
    .catch(error => 'An error occurred while loading the component');
}
if ($('#map')) {
  import(/* webpackChunkName: "makeMap" */ './modules/map')
    .then(({ default: makeMap }) => makeMap($('#map')))
    .catch(error => 'An error occurred while loading the component');
}

if ($('#rating')) {
  import(/* webpackChunkName: "rating" */ './modules/rating')
    .then(({ default: rating }) => rating($('#rating')))
    .catch(error => 'An error occurred while loading the component');
}

if ($('#loadReview')) {
  import(/* webpackChunkName: "loadReview" */ './modules/loadReview')
    .then(({ default: loadReview }) => loadReview($('#loadReview')))
    .catch(error => 'An error occurred while loading the component');
}
