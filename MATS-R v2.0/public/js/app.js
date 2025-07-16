const API_KEY        = '310654161eab15e0273da3b44e4a090c'; 
const form          = document.getElementById('searchForm');
const input         = form.querySelector('input[name="query"]');
const resultsHolder = document.getElementById('results');

// keep a set of already-requested IDs
let existing = new Set();

// fetch existing requests once on load
fetch('/api/requests')
  .then(r => r.json())
  .then(list => {
    list.forEach(item => existing.add(item.external_id));
  });

form.addEventListener('submit', e => {
  e.preventDefault();
  const q = input.value.trim();
  if (!q) return;

  // search both endpoints
  Promise.all([
    fetch(`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(q)}`)
       .then(r=>r.json()).then(d=>d.results.map(m=>({...m, _type:'movie'}))),
    fetch(`https://api.themoviedb.org/3/search/tv?api_key=${API_KEY}&query=${encodeURIComponent(q)}`)
       .then(r=>r.json()).then(d=>d.results.map(t=>({...t, _type:'tv'})))
  ])
  .then(([movies, shows]) => renderResults([...movies, ...shows]))
  .catch(console.error);
});

function renderResults(items) {
  resultsHolder.innerHTML = '';
  if (!items.length) {
    resultsHolder.textContent = 'No results found';
    return;
  }

  items.forEach(item => {
    const isMovie = item._type === 'movie';
    const title   = isMovie ? item.title : item.name;
    const date    = isMovie ? item.release_date : item.first_air_date;
    const poster  = item.poster_path
                     ? `https://image.tmdb.org/t/p/w200${item.poster_path}`
                     : 'placeholder.png';

    const card = document.createElement('div');
    card.className = 'movie-card';
    card.innerHTML = `
      <img src="${poster}" alt="${title}">
      <h3>${title}</h3>
      <p>${isMovie ? 'Release' : 'First Air'}: ${date||'N/A'}</p>
      <button class="request-btn">
        Request
      </button>
    `;

    const btn = card.querySelector('.request-btn');

    // if already requested, mark it
    if (existing.has(item.id)) {
      btn.classList.add('requested');
      btn.disabled = true;
      btn.textContent = 'Requested';
    }

    btn.addEventListener('click', () => {
      btn.disabled = true;
      fetch('/api/requests', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({
          external_id:   item.id,
          media_type:    item._type,
          title:         title,
          release_date:  date,
          poster_path:   item.poster_path
        })
      })
      .then(res => {
        if (!res.ok) throw new Error(res.statusText);
        existing.add(item.id);               // remember it
        btn.classList.add('requested');      // turn green + check
        btn.textContent = 'Requested';
      })
      .catch(err => {
        console.error(err);
        btn.disabled = false;
      });
    });

    resultsHolder.appendChild(card);
  });
}