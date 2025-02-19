// reviews.js

document.addEventListener('DOMContentLoaded', async () => {
  // A) Hamburger toggle (als je niet navstatus.js gebruikt, kun je dit herhalen)
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
    });
  }

  // B) We definiëren hier de festivals die we willen tonen op de reviewspagina
  // (of haal ze op uit de DB / server, dat kan ook)
  const festivalList = [
    "Wavy", 
    "DGTL", 
    "Free your mind Kingsday",
    "Loveland Kingsday",
    "Verbond",
    "Vunzige Deuntjes",
    "Toffler",
    // etc. 
  ];

  // C) We maken een tabel om de data in te tonen
  const reviewsContainer = document.getElementById('reviewsContainer');

  // Bouw de basis van de tabel
  const table = document.createElement('table');
  table.classList.add('reviews-table');

  // Tabel-head
  const thead = document.createElement('thead');
  thead.innerHTML = `
    <tr>
      <th>Festival</th>
      <th>Gemiddelde Rating</th>
      <th>Aantal Reviews</th>
    </tr>
  `;
  table.appendChild(thead);

  // Tabel-body
  const tbody = document.createElement('tbody');
  table.appendChild(tbody);

  // Plaats de tabel in de container
  reviewsContainer.appendChild(table);

  // D) Voor elk festival, haal average rating op
  for (const festName of festivalList) {
    try {
      const resp = await fetch(`/rating?festival=${encodeURIComponent(festName)}`);
      if (!resp.ok) {
        // Als er nog geen rating is, bijv. 404 of 400?
        // We doen hier ff no-op of fallback
        throw new Error(`Server returned ${resp.status}`);
      }

      const data = await resp.json(); 
      // data = { festival: "DGTL", averageRating: 7.5, ratings: [...] }

      const avg = data.averageRating ? Number(data.averageRating).toFixed(1) : '-';
      const count = data.ratings ? data.ratings.length : 0;

      // Maak een row
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${festName}</td>
        <td>${avg}</td>
        <td>${count}</td>
      `;
      tbody.appendChild(tr);

    } catch (err) {
      console.error('Fout bij ophalen rating voor', festName, err);
      // We maken evengoed een row, maar met no rating
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${festName}</td>
        <td>?</td>
        <td>0</td>
      `;
      tbody.appendChild(tr);
    }
  }
});