// reviews.js

document.addEventListener('DOMContentLoaded', async () => {

  // A) Hamburger
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
    });
  }

  // B) Festival-lijst
  const festivalList = [
    "Wavy",
    "DGTL",
    "Free your mind Kingsday",
    "Loveland Kingsday",
    "Vunzige Deuntjes",
    "Toffler",
    "Boothstock",
    "Mysteryland",
    "No Art",
    "Loveland",
    "Strafwerk",
    "Latin Village",
    "Parels van de stad",
    "Awakenings Festival",
    "Tomorrowland",
    "Mystic Garden Festival",
    "Open Air",
    "Free Your Mind",
    "Awakenings Upclose",
    "Soenda",
    "909",
    "Into the woods",
    "Verbond"
  ];

  // C) Bouw een tabel
  const reviewsContainer = document.getElementById('reviewsContainer');
  const table = document.createElement('table');
  table.classList.add('reviews-table');

  // Tabel-head
  const thead = document.createElement('thead');
  thead.innerHTML = `
    <tr>
      <th>Festival</th>
      <th>Gemiddelde (1-10)</th>
      <th>Sterren</th>
      <th>Aantal Reviews</th>
    </tr>
  `;
  table.appendChild(thead);

  // Tbody
  const tbody = document.createElement('tbody');
  table.appendChild(tbody);

  // Plaats de tabel in container
  reviewsContainer.appendChild(table);

  // D) Voor elk festival rating ophalen
  for (const festName of festivalList) {
    try {
      const resp = await fetch(`/rating?festival=${encodeURIComponent(festName)}`);
      if (!resp.ok) {
        throw new Error(`Server returned status ${resp.status}`);
      }
      const data = await resp.json();
      // { festival:..., averageRating:..., ratings:[...] }
      const avgRaw = data.averageRating; 
      // Kan null zijn als geen ratings
      let avgNum = avgRaw ? Number(avgRaw) : 0;
      // afronden op 1 decimaal
      const avgOneDecimal = avgNum.toFixed(1);

      // Maak ster-string
      const starHTML = makeStarString(avgNum);

      const count = data.ratings ? data.ratings.length : 0;

      // Maak row
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${festName}</td>
        <td>${avgRaw ? avgOneDecimal : '-'}</td>
        <td>${starHTML}</td>
        <td>${count}</td>
      `;
      tbody.appendChild(tr);

    } catch (err) {
      console.error('Fout bij rating fetch voor', festName, err);
      // Rij zonder data
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${festName}</td>
        <td>-</td>
        <td></td>
        <td>0</td>
      `;
      tbody.appendChild(tr);
    }
  }
});

/**
 * Converteert een gemiddelde rating (0-10) naar 0-5 sterren (met evt. halve ster).
 */
function makeStarString(ratingOutOf10) {
  const maxStars = 5;
  // Schaal 0-10 => 0-5
  const starValue = (ratingOutOf10 / 10) * maxStars; 
  // starValue is nu bijv. 3.7 => ~3.7 sterren
  
  let fullStars = Math.floor(starValue);        // bv 3
  let hasHalf = (starValue - fullStars) >= 0.5; // check of er halve ster is

  // Bouw HTML
  let result = '';
  // Voeg de volle sterren toe
  for (let i = 0; i < fullStars; i++) {
    result += `<span class="star-full">★</span>`;
  }
  // Voeg halve ster toe indien nodig
  if (hasHalf && fullStars < maxStars) {
    result += `<span class="star-half">★</span>`; 
    // Of Unicode half-star: star-half, of we kunnen special char. 
    fullStars++; // we hebben 1 half star toegevoegd
  }
  // Rest opvullen met lege sterren
  for (let i = fullStars; i < maxStars; i++) {
    result += `<span class="star-empty">☆</span>`;
  }
  return result;
}