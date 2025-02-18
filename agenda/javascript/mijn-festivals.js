// agenda/javascript/mijn-festivals.js

document.addEventListener('DOMContentLoaded', async () => {
  const userMenu = document.getElementById('userMenu');
  const festivalsContainer = document.getElementById('festivalsContainer');

  // 1) Check of we ingelogd zijn via localStorage
  const token = localStorage.getItem('token');
  const email = localStorage.getItem('email');

  if (!token || !email) {
    festivalsContainer.innerHTML = "<p>Je bent niet ingelogd.</p>";
    return;
  }

  // 2) Ophalen van de festivals voor deze gebruiker
  try {
    const res = await fetch(`/my-festivals?email=${encodeURIComponent(email)}`);
    if (!res.ok) {
      throw new Error(`Server returned status ${res.status}`);
    }
    const data = await res.json();
    const myFests = data.festivals || [];

    if (myFests.length === 0) {
      festivalsContainer.innerHTML = "<p>Je hebt nog geen festivals aangevinkt.</p>";
      return;
    }

    // 3) Voor elk festival maken we een 'uitleg'-hokje
    myFests.forEach(festival => {
      // Buitenste div met class="uitleg"
      const card = document.createElement('div');
      card.classList.add('uitleg');

      // Titel
      const titleDiv = document.createElement('div');
      titleDiv.classList.add('uitleg-title');
      titleDiv.textContent = festival;
      card.appendChild(titleDiv);

      // Knop "Wie gaan er nog meer?" in een uitleg-text
      const buttonParagraph = document.createElement('div');
      buttonParagraph.classList.add('uitleg-text');
      const btn = document.createElement('button');
      btn.textContent = "Wie gaan er nog meer?";
      buttonParagraph.appendChild(btn);
      card.appendChild(buttonParagraph);

      // Div voor attendees (ook uitleg-text zodat het op de rest lijkt)
      const attendeesDiv = document.createElement('div');
      attendeesDiv.classList.add('uitleg-text');
      // (Nog leeg)
      card.appendChild(attendeesDiv);

      // Click event => haal andere gebruikers op
      btn.addEventListener('click', async () => {
        try {
          const resp = await fetch(`/festival-attendees?festival=${encodeURIComponent(festival)}`);
          if (!resp.ok) {
            throw new Error(`Attendees fetch returned ${resp.status}`);
          }
          const result = await resp.json();
          const allAttendees = result.attendees || [];

          // Jezelf niet tonen? Dan filter je:
          const others = allAttendees.filter(u => u !== email);

          // Toon in attendeesDiv
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
        } catch (err) {
          attendeesDiv.textContent = `Fout bij ophalen attendees: ${err.message}`;
        }
      });

      // Voeg de "card" toe aan de container
      festivalsContainer.appendChild(card);
    });

  } catch (err) {
    festivalsContainer.innerHTML = `<p>Fout bij ophalen van jouw festivals: ${err.message}</p>`;
  }
});