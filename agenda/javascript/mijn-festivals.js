// mijn-festivals.js

document.addEventListener('DOMContentLoaded', async () => {
  // Grijp onze elementen
  const upcomingCount     = document.getElementById('upcomingCount');
  const upcomingContainer = document.getElementById('upcomingFestContainer');
  const pastCount         = document.getElementById('pastCount');
  const pastContainer     = document.getElementById('pastFestContainer');

  const navToggle = document.getElementById('navToggle');
  const navMenu   = document.getElementById('navMenu');

  // Hamburger-menu toggle (optioneel)
  navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('open');
  });

  // 1) Check of gebruiker ingelogd is (voorbeeld)
  const token = localStorage.getItem('token');
  const email = localStorage.getItem('email');
  if (!token || !email) {
    upcomingContainer.innerHTML = '<p>Je bent niet ingelogd.</p>';
    return;
  }

  // 2) Festivals ophalen en sorteren
  try {
    const res = await fetch('/api/festivalItems?email=' + encodeURIComponent(email));
    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }

    const data = await res.json();
    // Zorg dat data.festivals een array bevat:
    const festivals = data.festivals || [];

    const upcomingFests = [];
    const pastFests     = [];

    // Splitsen in toekomstige & afgelopen
    festivals.forEach(f => {
      // Stel f.datum is "2025-05-10", etc.
      const festDate = new Date(f.datum);
      const now      = new Date();
      if (festDate >= now) {
        upcomingFests.push(f);
      } else {
        pastFests.push(f);
      }
    });

    // Sorteren op datum (optioneel)
    upcomingFests.sort((a, b) => new Date(a.datum) - new Date(b.datum));
    pastFests.sort((a, b) => new Date(b.datum) - new Date(a.datum));

    // 3) Aantallen zetten
    upcomingCount.textContent = `Je bent aangemeld voor ${upcomingFests.length} festival(s)!`;
    pastCount.textContent     = `Je hebt ${pastFests.length} festival(s) meegemaakt!`;

    // 4) Kaarten aanmaken voor de toekomstige festivals
    upcomingFests.forEach(fest => {
      const card = document.createElement('div');
      card.classList.add('festival-card');
      card.innerHTML = `
        <h3 class="festival-title">${fest.naam}</h3>
        <p class="festival-text">Datum: ${fest.datum}</p>
        <button class="attendees-btn">Wie gaan er nog meer?</button>
        <div class="collapsible"></div>
      `;

      // Knop om deelnemers in te klappen/uit te klappen
      const btn         = card.querySelector('.attendees-btn');
      const collapsible = card.querySelector('.collapsible');
      btn.addEventListener('click', async () => {
        if (collapsible.classList.contains('expanded')) {
          // Al open -> klap in
          collapsible.classList.remove('expanded');
          collapsible.innerHTML = '';
        } else {
          // Ophalen en tonen wie nog meer gaat
          try {
            const attendeeRes = await fetch(
              '/api/festivalAttendees?festivalName=' + encodeURIComponent(fest.naam)
            );
            if (!attendeeRes.ok) {
              throw new Error(`Attendees fetch returned ${attendeeRes.status}`);
            }
            const result = await attendeeRes.json();
            const others = result.attendees || [];

            // Output maken
            if (others.length === 0) {
              collapsible.innerHTML = '<p>Momenteel geen andere gebruikers aangemeld.</p>';
            } else {
              const list = document.createElement('ul');
              others.forEach(name => {
                const li = document.createElement('li');
                li.textContent = name;
                list.appendChild(li);
              });
              collapsible.innerHTML = '<p>Andere aanwezigen:</p>';
              collapsible.appendChild(list);
            }
            collapsible.classList.add('expanded');
          } catch (err) {
            collapsible.innerHTML = `<p>Fout bij ophalen attendees: ${err.message}</p>`;
            collapsible.classList.add('expanded');
          }
        }
      });

      upcomingContainer.appendChild(card);
    });

    // 5) Kaarten aanmaken voor de afgelopen festivals
    pastFests.forEach(fest => {
      const card = document.createElement('div');
      card.classList.add('festival-card');
      card.innerHTML = `
        <h3 class="festival-title">${fest.naam}</h3>
        <p class="festival-text">Datum: ${fest.datum}</p>
        <!-- Eventueel een "Review" knop -->
        <button class="review-btn">Schrijf review</button>
      `;
      pastContainer.appendChild(card);
    });

  } catch (err) {
    // Als er iets misgaat met de fetch
    upcomingContainer.innerHTML = `<p>Fout bij ophalen festivals: ${err.message}</p>`;
  }
});