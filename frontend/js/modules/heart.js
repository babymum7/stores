import axios from 'axios';
import { $ } from './bind';

function ajaxHeart(e) {
  e.preventDefault();
  this.heart.style.pointerEvents = 'none';
  const isHearted = this.heart.classList.toggle('heart__button--hearted');
  if (isHearted) {
    this.heart.classList.add('heart__button--float');
    setTimeout(() => this.heart.classList.remove('heart__button--float'), 2500);
    $('.heart-count').textContent = Number($('.heart-count').textContent) + 1;
  } else {
    this.heart.classList.remove('heart__button--float');
    $('.heart-count').textContent = Number($('.heart-count').textContent) - 1;
  }
  axios
    .post(this.action)
    .then(() => {
      this.heart.style.pointerEvents = null;
    })
    .catch(console.log);
}

export default ajaxHeart;
