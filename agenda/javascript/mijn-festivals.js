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

  // 2) Festivals ophalen
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

    // 3) Per festival een "festival"-hokje
    myFests.forEach(festivalName => {
      const card = document.createElement('div');
      card.classList.add('festival');

      // Titel
      const titleDiv = document.createElement('div');
      titleDiv.classList.add('festival-title');
      titleDiv.textContent = festivalName;
      card.appendChild(titleDiv);

      // Knop
      const buttonRow = document.createElement('div');
      buttonRow.classList.add('festival-text');

      const toggleBtn = document.createElement('button');
      toggleBtn.textContent = "Wie gaan er nog meer?";
      buttonRow.appendChild(toggleBtn);
      card.appendChild(buttonRow);

      // Div voor andere deelnemers => collapsible
      const attendeesDiv = document.createElement('div');
      attendeesDiv.classList.add('festival-text', 'collapsible');
      // (Standaard niet expanded)
      card.appendChild(attendeesDiv);

      let fetched = false;  // al data opgehaald?
      let expanded = false; // staat het open?

      // 4) Klik => togglen
      toggleBtn.addEventListener('click', async () => {
        if (!expanded) {
          // Gaat nu uitklappen
          expanded = true;
          toggleBtn.textContent = "Verbergen";
          // CSS-animatie via class
          attendeesDiv.classList.add('expanded');

          // Data nog niet opgehaald => haal op
          if (!fetched) {
            try {
              const resp = await fetch(
                `/festival-attendees?festival=${encodeURIComponent(festivalName)}`
              );
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
          attendeesDiv.classList.remove('expanded');
        }
      });

      // Plaats de card in container
      festivalsContainer.appendChild(card);
    });
  } catch (err) {
    festivalsContainer.innerHTML = `<p>Fout bij ophalen van jouw festivals: ${err.message}</p>`;
  }
});