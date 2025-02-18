// agenda/javascript/mijn-festivals.js

document.addEventListener('DOMContentLoaded', async () => {
  const userMenu = document.getElementById('userMenu');
  const festivalsContainer = document.getElementById('festivalsContainer');
  const festCountEl = document.getElementById('festCount');

  // 1) Check of we ingelogd zijn (token + email)
  const token = localStorage.getItem('token');
  const email = localStorage.getItem('email');

  if (!token || !email) {
    festivalsContainer.innerHTML = "<p>Je bent niet ingelogd.</p>";
    return;
  }

  // 2) Haal de festivals op
  try {
    const res = await fetch(`/my-festivals?email=${encodeURIComponent(email)}`);
    if (!res.ok) {
      throw new Error(`Server returned status ${res.status}`);
    }
    const data = await res.json();
    const myFests = data.festivals || [];

    // Toon aantal festivals
    if (myFests.length === 0) {
      festCountEl.textContent = "Je hebt nog geen festivals aangevinkt.";
      return;
    } else {
      festCountEl.textContent = `Je bent aangemeld voor ${myFests.length} festival(s).`;
    }

    // 3) Bouw per festival een "festival"-hokje
    myFests.forEach(festivalName => {
      const card = document.createElement('div');
      card.classList.add('festival');

      // Festivalnaam
      const titleDiv = document.createElement('div');
      titleDiv.classList.add('festival-title');
      titleDiv.textContent = festivalName;
      card.appendChild(titleDiv);

      // Knop (Wie gaan er nog meer?)
      const buttonRow = document.createElement('div');
      buttonRow.classList.add('festival-text');

      const toggleBtn = document.createElement('button');
      toggleBtn.textContent = "Wie gaan er nog meer?";
      buttonRow.appendChild(toggleBtn);
      card.appendChild(buttonRow);

      // Div voor andere attendees
      const attendeesDiv = document.createElement('div');
      attendeesDiv.classList.add('festival-text');
      attendeesDiv.style.display = "none"; // begint verborgen
      card.appendChild(attendeesDiv);

      let fetched = false;  // al data opgehaald?
      let expanded = false; // uit-/ingeklapt?

      // 4) Klik op de knop => toggle
      toggleBtn.addEventListener('click', async () => {
        if (!expanded) {
          // Uitklappen
          expanded = true;
          toggleBtn.textContent = "Verbergen";
          attendeesDiv.style.display = "block";

          if (!fetched) {
            // Data nog niet opgehaald, dus nu doen
            try {
              const resp = await fetch(`/festival-attendees?festival=${encodeURIComponent(festivalName)}`);
              if (!resp.ok) {
                throw new Error(`Attendees fetch returned ${resp.status}`);
              }
              const result = await resp.json();
              const allAttendees = result.attendees || [];
              const others = allAttendees.filter(u => u !== email);

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
          attendeesDiv.style.display = "none";
        }
      });

      // Voeg de "festival"-card toe aan container
      festivalsContainer.appendChild(card);
    });
  } catch (err) {
    festivalsContainer.innerHTML = `<p>Fout bij ophalen van jouw festivals: ${err.message}</p>`;
  }
});