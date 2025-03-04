// mijn-festivals.js

document.addEventListener('DOMContentLoaded', async () => {
  const userMenu = document.getElementById('userMenu');
  const upcomingContainer = document.getElementById('upcomingFestContainer');
  const upcomingCountEl = document.getElementById('upcomingCount');
  const pastContainer = document.getElementById('pastFestContainer');
  const pastCountEl = document.getElementById('pastCount');

  // 1) Check of ingelogd
  const token = localStorage.getItem('token');
  const email = localStorage.getItem('email');
  if (!token || !email) {
    upcomingContainer.innerHTML = "<p>Je bent niet ingelogd.</p>";
    pastContainer.innerHTML = "";
    return;
  }

  // 2) Definieer alle festivals + datum
  //    (Moet overeenkomen met de festivalnamen in DB)
  const festivalDates = {
    "Wavy": "2024-12-21",
    "DGTL": "2025-04-18",
    "Free your mind Kingsday": "2025-04-26",
    "Loveland Kingsday": "2025-04-26",
    "Verbond": "2025-05-05",
    "Awakenings Upclose": "2025-05-17",
    "Soenda": "2025-05-31",
    "909": "2025-06-07",
    "Diynamic": "2025-06-07",
    "Open Air": "2025-06-08",
    "Free Your Mind": "2025-06-08",
    "Mystic Garden Festival": "2025-06-14",
    "Awakenings Festival": "2025-07-11",
    "Tomorrowland": "2025-07-18",
    "Mysteryland": "2025-07-22",
    "No Art": "2025-07-26",
    "Loveland": "2025-08-09",
    "Strafwerk": "2025-08-16",
    "Latin Village": "2025-08-17",
    "Parels van de stad": "2025-09-13",
    "KeineMusik": "2025-07-05",
    "Vunzige Deuntjes": "2025-07-05",
    "Toffler": "2025-05-31",
    "Into the woods": "2025-09-19"
  };

  // Helper om ISO "YYYY-MM-DD" => "DD-MM-YYYY"
  function formatDate(isoDate) {
    const d = new Date(isoDate);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }

  try {
    // 3) Haal festivals (namen) op voor deze user
    const res = await fetch(`/my-festivals?email=${encodeURIComponent(email)}`);
    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }
    const data = await res.json();
    const festNames = data.festivals || [];

    // We delen op in upcoming & past
    const now = new Date().setHours(0,0,0,0);
    let upcomingFests = [];
    let pastFests = [];

    festNames.forEach(name => {
      const isoDate = festivalDates[name];
      if (!isoDate) {
        // Niet gevonden in festivalDates => skip
        return;
      }
      const dateObj = new Date(isoDate).setHours(0,0,0,0);
      const festivalObj = { name, date: isoDate, dateValue: dateObj };

      if (dateObj >= now) {
        // toekomstdig
        upcomingFests.push(festivalObj);
      } else {
        // verleden
        pastFests.push(festivalObj);
      }
    });

    // Sorteer
    upcomingFests.sort((a,b) => a.dateValue - b.dateValue);
    pastFests.sort((a,b) => a.dateValue - b.dateValue);

    // Telling
    upcomingCountEl.textContent = `Je bent aangemeld voor ${upcomingFests.length} festival(s).`;
    pastCountEl.textContent = `Je hebt ${pastFests.length} festival(s) meegemaakt.`;

    // 4) Voor upcoming: maak cards zonder ratingknop
    upcomingFests.forEach(fest => {
      const card = createFestivalCard(fest.name, fest.date, email, false); // false => geen ratingknop
      upcomingContainer.appendChild(card);
    });

    // 5) Voor past: maak cards zonder ratingknop (previously we passed true here)
    pastFests.forEach(fest => {
      const card = createFestivalCard(fest.name, fest.date, email, false); // Changed to false - no rating button
      pastContainer.appendChild(card);
    });

  } catch (err) {
    upcomingContainer.innerHTML = `<p>Fout bij ophalen festivals: ${err.message}</p>`;
    pastContainer.innerHTML = "";
  }

  // =========== Functie om een festival-card te bouwen ===========
  function createFestivalCard(festName, isoDate, currentUserEmail, allowRating) {
    const card = document.createElement('div');
    card.classList.add('festival-card');

    // Titel (naam + datum)
    const titleDiv = document.createElement('div');
    titleDiv.classList.add('festival-title');
    titleDiv.textContent = `${festName} - ${formatDate(isoDate)}`;
    card.appendChild(titleDiv);

    // Een "Wie gaan er nog meer?"-knop
    const attendeesRow = document.createElement('div');
    attendeesRow.classList.add('festival-text');
    const toggleBtn = document.createElement('button');
    toggleBtn.textContent = "Wie gaan er nog meer?";
    attendeesRow.appendChild(toggleBtn);
    card.appendChild(attendeesRow);

    // Collapsible div voor attendees
    const attendeesDiv = document.createElement('div');
    attendeesDiv.classList.add('festival-text','collapsible');
    card.appendChild(attendeesDiv);

    let expanded = false;
    let fetched = false;
    toggleBtn.addEventListener('click', async () => {
      if (!expanded) {
        expanded = true;
        toggleBtn.textContent = "Verbergen";
        attendeesDiv.classList.add('expanded');

        if (!fetched) {
          try {
            const resp = await fetch(`/festival-attendees?festival=${encodeURIComponent(festName)}`);
            if (!resp.ok) {
              throw new Error(`Attendees fetch returned ${resp.status}`);
            }
            const result = await resp.json();
            const allAttendees = result.attendees || [];
            const others = allAttendees.filter(u => u !== currentUserEmail);

            if (others.length === 0) {
              attendeesDiv.textContent = "Geen andere gebruikers hebben zich aangemeld.";
            } else {
              attendeesDiv.innerHTML = "";
              others.forEach(u => {
                const p = document.createElement('p');
                p.textContent = u;
                attendeesDiv.appendChild(p);
              });
            }
            fetched = true;
          } catch (err) {
            attendeesDiv.textContent = `Fout bij ophalen attendees: ${err.message}`;
          }
        }
      } else {
        expanded = false;
        toggleBtn.textContent = "Wie gaan er nog meer?";
        attendeesDiv.classList.remove('expanded');
      }
    });

    // REMOVED: Rating button functionality - we no longer add the rating button
    // even if allowRating is true

    return card;
  }
});