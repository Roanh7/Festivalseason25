// 1. Lees uit localStorage welke festivals de gebruiker heeft aangevinkt
let attendingFestivals = JSON.parse(localStorage.getItem('attendingFestivals')) || [];

// 2. Pak het DOM-element waar de lijst moet komen
const myFestivalsList = document.getElementById('myFestivalsList');

// 3. Als er geen festivals zijn, toon een melding
if (attendingFestivals.length === 0) {
  myFestivalsList.innerHTML = `
    <p>Je hebt (nog) geen festivals aangevinkt op de <a href="agenda.html">agenda</a>.</p>
  `;
} else {
  // 4. Anders, bouw een HTML-lijst van festivals
  let html = '<ul>';
  attendingFestivals.forEach(festivalName => {
    // Voor DEMO: we tonen ook "Andere bezoekers" uit localStorage of uit een mock 
    // (In het echt zou je hier een API-call doen naar je database om 'echte' andere gebruikers op te halen)
    const otherAttendees = getOtherAttendeesMock(festivalName);
    
    html += `
      <li style="margin-bottom:20px;">
        <strong>${festivalName}</strong><br/>
        <em>Andere bezoekers:</em> ${otherAttendees.join(', ')}
      </li>
    `;
  });
  html += '</ul>';

  myFestivalsList.innerHTML = html;
}

/**
 * Voorbeeld: deze functie simuleert een lijst van andere mensen die ook
 * naar een bepaald festival gaan. In een echte app zou je hiervoor een 
 * API-aanvraag naar je database/backend doen.
 */
fetch(`/api/festivals/${festivalName}/attendees`)
  .then(response => response.json())
  .then(data => {
    // data kan bv. een array zijn met user-namen
  });