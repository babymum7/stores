import axios from 'axios';
import dompurify from 'dompurify';
import debounce from 'lodash.debounce';

function searchResultsHTML(stores) {
  return stores
    .map(
      store => `
      <a href="/store/${store.slug}" class="search__result">
        <strong>${store.name}</strong>
      </a>
    `
    )
    .join('');
}

function typeAhead(search) {
  if (!search) return;

  const searchInput = search.querySelector('input[name="search"]');
  const searchResults = search.querySelector('.search__results');

  searchInput.on(
    'input',
    debounce(function() {
      console.log('hey');
      if (!this.value) {
        searchResults.style.display = 'none';
        return;
      }

      searchResults.style.display = 'block';

      axios
        .get(`/api/search?q=${this.value}`)
        .then(res => {
          if (res.data.length) {
            searchResults.innerHTML = dompurify.sanitize(searchResultsHTML(res.data), {
              ALLOWED_TAGS: ['p', '#text', 'strong', 'a']
            });
            return;
          }

          searchResults.innerHTML = dompurify.sanitize(
            `<div class="search__notfound">No results for ${this.value}</div>`
          );
        })
        .catch(console.log);
    }, 500)
  );

  searchInput.on('keyup', function(e) {
    const items = search.querySelectorAll('.search__result');
    if (![13, 38, 40].includes(e.keyCode) || !items.length) {
      return;
    }
    const activeClass = 'search__result--active';
    const current = search.querySelector(`.${activeClass}`);
    let next;
    if (e.keyCode === 40 && current) {
      next = current.nextElementSibling || items[0];
    } else if (e.keyCode === 40) {
      [next] = items;
    } else if (e.keyCode === 38 && current) {
      next = current.previousElementSibling || items[items.length - 1];
    } else if (e.keyCode === 38) {
      next = items[items.length - 1];
    } else if (e.keyCode === 13) {
      if (current && this.value) {
        window.location = current.href;
        return;
      }
      return;
    }
    if (current) {
      current.classList.remove(activeClass);
    }
    next.classList.add(activeClass);
  });
}

export default typeAhead;
