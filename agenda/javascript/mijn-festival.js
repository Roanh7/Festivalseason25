// mijn-festivals.js
document.addEventListener('DOMContentLoaded', async () => {
  const userMenu = document.getElementById('userMenu');  // optioneel
  const myFestList = document.getElementById('myFestList');
  const festivalDetails = document.getElementById('festivalDetails');

  // 1) Check of ingelogd
  const token = localStorage.getItem('token');
  const email = localStorage.getItem('email');
  if (!token || !email) {
    myFestList.innerHTML = "<li>Je bent niet ingelogd.</li>";
    return;
  }

  // 2) Haal eigen festivals
  try {
    const res = await fetch(`/my-festivals?email=${email}`);
    const data = await res.json(); 
    // data.festivals = ["Open Air", "DGTL", ...] 
    const myFests = data.festivals || [];

    if (myFests.length === 0) {
      myFestList.innerHTML = "<li>Je hebt nog geen festivals aangevinkt.</li>";
      return;
    }

    // 3) Bouw UI
    myFests.forEach(festival => {
      const li = document.createElement('li');
      li.textContent = festival;
      
      // Maak een knop "Wie gaat er nog meer?"
      const btn = document.createElement('button');
      btn.textContent = "Wie gaan er nog meer?";
      btn.addEventListener('click', () => {
        showAttendees(festival);
      });

      li.appendChild(btn);
      myFestList.appendChild(li);
    });

  } catch (err) {
    myFestList.innerHTML = `<li>Fout bij ophalen festivals: ${err}</li>`;
  }

  // 4) Functie om attendees te laten zien
  async function showAttendees(festival) {
    // clear
    festivalDetails.innerHTML = "";
    try {
      const resp = await fetch(`/festival-attendees?festival=${encodeURIComponent(festival)}`);
      const result = await resp.json(); 
      // result.attendees = ["roan@example.com", "chip@example.com", ...]

      const container = document.createElement('div');
      container.innerHTML = `<h3>${festival}</h3>`;

      const ul = document.createElement('ul');
      // Filter je eigen email eruit als je jezelf niet wil zien
      const others = result.attendees.filter(u => u !== email);

      if (others.length === 0) {
        ul.innerHTML = `<li>Geen andere gebruikers hebben zich aangemeld.</li>`;
      } else {
        others.forEach(u => {
          const li = document.createElement('li');
          li.textContent = u;
          ul.appendChild(li);
        });
      }

      container.appendChild(ul);
      festivalDetails.appendChild(container);

    } catch (e) {
      festivalDetails.textContent = "Fout bij ophalen attendees.";
    }
  }
});