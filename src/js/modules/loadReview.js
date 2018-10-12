import axios from 'axios';

function loadReview(form) {
  const button = form.querySelector('button');
  const reviews = document.querySelector('.reviews');
  let skip = 10;
  button.on('click', function() {
    button.classList.add('loading');
    button.style.pointerEvents = 'none';
    axios
      .post(form.action, { skip })
      .then(res => {
        reviews.insertAdjacentHTML('beforeend', res.data);
        skip += 10;
        button.style.pointerEvents = null;
        button.classList.remove('loading');
      })
      .catch(console.log);
  });
}

export default loadReview;
