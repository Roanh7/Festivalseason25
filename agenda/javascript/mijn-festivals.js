// agenda/javascript/mijn-festivals.js

document.addEventListener('DOMContentLoaded', async () => {
  const userMenu = document.getElementById('userMenu');

  // Containers voor de twee lijsten
  const upcomingContainer = document.getElementById('upcomingFestContainer');
  const upcomingCountEl = document.getElementById('upcomingCount');
  const pastContainer = document.getElementById('pastFestContainer');
  const pastCountEl = document.getElementById('pastCount');

  // 1) Check of de gebruiker is ingelogd
  const token = localStorage.getItem('token');
  const email = localStorage.getItem('email');
  if (!token || !email) {
    upcomingContainer.innerHTML = "<p>Je bent niet ingelogd.</p>";
    pastContainer.innerHTML = "";
    return;
  }

  // 2) Definieer alle festivals + datum (pas aan naar jouw data)
  //    "name" moet exact overeenkomen met hoe je 'm in de DB hebt opgeslagen
  const festivalDates = {
    "Wavy": "2024-12-21",
    "DGTL": "2025-04-18",
    "Free your mind Kingsday": "2025-04-26",
    "Loveland Kingsday": "2025-04-26",
    "Verbond": "2025-05-05",
    "Awakenings Upclose": "2025-05-17",
    "Soenda": "2025-05-31",
    "909": "2025-06-07",
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
    "Vunzige Deuntjes": "2025-07-05",
    "Toffler": "2025-05-31",
    "Into the woods": "2025-09-19"
  };

  // Helper om datum als "YYYY-MM-DD" om te zetten naar "DD-MM-YYYY"
  function formatDate(isoDate) {
    const d = new Date(isoDate);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }

  // 3) Haal festivals op uit DB (enkel namen)
  try {
    const res = await fetch(`/my-festivals?email=${encodeURIComponent(email)}`);
    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }
    const data = await res.json();
    const festNames = data.festivals || [];

    // Verrijk met datum en filter: [ { name, date }, ... ]
    const now = new Date().setHours(0, 0, 0, 0); // middernacht vandaag
    let upcomingFests = [];
    let pastFests = [];

    festNames.forEach(name => {
      const isoDate = festivalDates[name];
      if (!isoDate) {
        // Festival niet gevonden in festivalDates - evt. overslaan of datum "Onbekend"
        return;
      }
      const dateObj = new Date(isoDate).setHours(0, 0, 0, 0);
      const festivalObj = { name, date: isoDate, dateValue: dateObj };

      // Splitsen in upcoming vs past
      if (dateObj >= now) {
        upcomingFests.push(festivalObj);
      } else {
        pastFests.push(festivalObj);
      }
    });

    // Sorteer beide arrays op oplopende datum
    upcomingFests.sort((a, b) => a.dateValue - b.dateValue);
    pastFests.sort((a, b) => a.dateValue - b.dateValue);

    // Telling
    upcomingCountEl.textContent = `Je bent aangemeld voor ${upcomingFests.length} festival(s).`;
    pastCountEl.textContent = `Je hebt ${pastFests.length} festival(s) meegemaakt.`;

    // 4) Maak cards voor upcoming festivals
    upcomingFests.forEach(fest => {
      const card = createFestivalCard(fest.name, fest.date, email);
      upcomingContainer.appendChild(card);
    });

    // 5) Maak cards voor past festivals
    pastFests.forEach(fest => {
      const card = createFestivalCard(fest.name, fest.date, email);
      pastContainer.appendChild(card);
    });

  } catch (err) {
    upcomingContainer.innerHTML = `<p>Fout bij ophalen festivals: ${err.message}</p>`;
    pastContainer.innerHTML = "";
  }

  // =========== Hulpfunctie om een festival-card te bouwen ===========
  function createFestivalCard(festName, isoDate, currentUserEmail) {
    // Outer div
    const card = document.createElement('div');
    card.classList.add('festival-card');

    // Title + datum
    const titleDiv = document.createElement('div');
    titleDiv.classList.add('festival-title');
    titleDiv.textContent = `${festName} - ${formatDate(isoDate)}`;
    card.appendChild(titleDiv);

    // Knop
    const btnRow = document.createElement('div');
    btnRow.classList.add('festival-text');
    const toggleBtn = document.createElement('button');
    toggleBtn.textContent = "Wie gaan er nog meer?";
    btnRow.appendChild(toggleBtn);
    card.appendChild(btnRow);

    // Attendees-list (collapsible)
    const attendeesDiv = document.createElement('div');
    attendeesDiv.classList.add('festival-text', 'collapsible');
    card.appendChild(attendeesDiv);

    let expanded = false;
    let fetched = false;

    toggleBtn.addEventListener('click', async () => {
      if (!expanded) {
        // Openen
        expanded = true;
        toggleBtn.textContent = "Verbergen";
        attendeesDiv.classList.add('expanded');

        if (!fetched) {
          // Haal pas nu de data op
          try {
            const resp = await fetch(`/festival-attendees?festival=${encodeURIComponent(festName)}`);
            if (!resp.ok) {
              throw new Error(`Attendees fetch returned ${resp.status}`);
            }
            const result = await resp.json();
            const allAttendees = result.attendees || [];
            // Filter jezelf eruit
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
        // Inklappen
        expanded = false;
        toggleBtn.textContent = "Wie gaan er nog meer?";
        attendeesDiv.classList.remove('expanded');
      }
    });

    return card;
  }
});