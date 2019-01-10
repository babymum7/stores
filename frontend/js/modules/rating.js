import axios from 'axios';

function rating(form) {
  const buttons = form.querySelectorAll('.rating-stars button');
  const input = form.querySelector('input');
  buttons.on('click', function() {
    input.value = this.dataset.rating;
    buttons.forEach(e => {
      e.classList.remove('active');
      e.style.pointerEvents = 'none';
    });
    this.classList.add('active');
    axios
      .post(form.action, { rating: input.value })
      .then(res => {
        if (res.data) {
          const nmberOfRating = document.querySelector('#nmberOfRating');
          nmberOfRating.innerHTML = Number(nmberOfRating.innerHTML) + 1;
        }
        buttons.forEach(e => {
          e.style.pointerEvents = null;
        });
      })
      .catch(console.log);
  });
}

export default rating;
