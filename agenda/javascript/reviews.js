// reviews.js

document.addEventListener("DOMContentLoaded", async () => {
  try {
    // 1) Haal de festivals op waar de user aan deelnam & die voorbij zijn
    const userFestsRes = await fetch("/api/reviews/user");
    if (!userFestsRes.ok) {
      throw new Error("Kon user festivals niet ophalen.");
    }
    const userFestsData = await userFestsRes.json();
    renderUserFestivals(userFestsData);

    // 2) (optioneel) Haal de ranking op
    // const rankingRes = await fetch("/api/reviews/ranking");
    // if (!rankingRes.ok) {
    //   throw new Error("Kon ranking niet ophalen.");
    // }
    // const rankingData = await rankingRes.json();
    // renderRanking(rankingData);

  } catch (err) {
    console.error(err);
  }
});

function renderUserFestivals(festivals) {
  const container = document.getElementById("reviewsContainer");
  container.innerHTML = "";

  if (!festivals || festivals.length === 0) {
    container.innerHTML = "<p>Er zijn geen voorbije festivals waar je aan deelnam.</p>";
    return;
  }

  festivals.forEach((fest) => {
    // Outer container, zelfde styling als "extra-info" blok
    const uitlegDiv = document.createElement("div");
    uitlegDiv.classList.add("uitleg");

    // Titel
    const titleDiv = document.createElement("div");
    titleDiv.classList.add("uitleg-title");
    titleDiv.textContent = fest.festival_name;
    uitlegDiv.appendChild(titleDiv);

    // Gemiddelde rating
    const avg = fest.avg_rating ? Number(fest.avg_rating).toFixed(1) : 0;
    const avgText = document.createElement("p");
    avgText.classList.add("uitleg-text");
    avgText.textContent = `Gemiddelde rating: ${avg}`;
    uitlegDiv.appendChild(avgText);

    // Eigen rating of knop
    if (fest.user_rating && fest.user_rating > 0) {
      const yourRating = document.createElement("p");
      yourRating.classList.add("uitleg-text");
      yourRating.textContent = `Jouw rating: ${fest.user_rating}`;
      uitlegDiv.appendChild(yourRating);
    } else {
      const rateBtn = document.createElement("button");
      rateBtn.textContent = "Geef een rating";
      rateBtn.classList.add("uitleg-text"); // als je wilt dat het lijkt op de text-styling
      rateBtn.addEventListener("click", () => {
        geefRating(fest.festival_name);
      });
      uitlegDiv.appendChild(rateBtn);
    }

    // Toevoegen aan container
    container.appendChild(uitlegDiv);
  });
}

// Prompt de user voor rating en POST deze naar backend
async function geefRating(festival_name) {
  let rating = prompt("Geef een rating (1-10):");
  if (!rating) return;
  rating = parseInt(rating);
  if (isNaN(rating) || rating < 1 || rating > 10) {
    alert("Ongeldige rating. Vul een getal tussen 1 en 10 in.");
    return;
  }

  try {
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ festival_name, rating }),
    });
    if (!res.ok) {
      throw new Error("Fout bij opslaan van rating.");
    }
    alert("Je rating is opgeslagen!");
    // Pagina refreshen of opnieuw data ophalen:
    location.reload();
  } catch (err) {
    console.error(err);
    alert("Er ging iets mis bij het opslaan van je rating.");
  }
}

// Optioneel: Ranking tonen in zelfde stijl
function renderRanking(ranking) {
  const container = document.getElementById("reviewsContainer");

  // Eventueel maak je er aparte blokken van, net als de userFestivals
  ranking.forEach((item) => {
    const uitlegDiv = document.createElement("div");
    uitlegDiv.classList.add("uitleg");

    const titleDiv = document.createElement("div");
    titleDiv.classList.add("uitleg-title");
    titleDiv.textContent = item.festival_name + " - Gemiddelde: " + item.average_rating;
    uitlegDiv.appendChild(titleDiv);

    container.appendChild(uitlegDiv);
  });
}