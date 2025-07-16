// Grab the container
const container = document.getElementById('requests');

// Fetch all saved requests
fetch('/api/requests')
  .then(r => {
    if (!r.ok) throw new Error(r.statusText);
    return r.json();
  })
  .then(list => {
    if (!list.length) {
      container.textContent = 'No requests yet.';
      return;
    }

    // Render each requested movie
    list.forEach(item => {
      const card = document.createElement('div');
      card.className = 'movie-card';

      // Poster URL (or placeholder)
      const posterURL = item.poster_path
        ? `https://image.tmdb.org/t/p/w200${item.poster_path}`
        : 'placeholder.png';

      card.innerHTML = `
        <img src="${posterURL}" alt="${item.title} poster">
        <h3>${item.title}</h3>
        <p>Release: ${item.release_date || 'N/A'}</p>
      `;
      container.appendChild(card);
    });
  })
  .catch(err => {
    console.error(err);
    container.textContent = 'Error loading requests.';
  });
