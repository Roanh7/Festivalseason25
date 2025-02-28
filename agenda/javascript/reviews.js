document.addEventListener("DOMContentLoaded", async () => {
  try {
    // 1) Haal de voorbije festivals van de user
    const userFestsRes = await fetch("/api/reviews/user");
    if (!userFestsRes.ok) {
      throw new Error("Kon user festivals niet ophalen.");
    }
    const userFestsData = await userFestsRes.json();
    renderUserFestivals(userFestsData);

    // 2) Haal de ranglijst
    const rankingRes = await fetch("/api/reviews/ranking");
    if (!rankingRes.ok) {
      throw new Error("Kon ranking niet ophalen.");
    }
    const rankingData = await rankingRes.json();
    renderRanking(rankingData);

  } catch (err) {
    console.error(err);
  }
});

/**
 * Maak voor ieder festival (dat de user bezocht) een "kaart" 
 * met naam, datum, gemiddelde rating, en een button of userRating
 */
function renderUserFestivals(festivals) {
  const container = document.getElementById("reviewsContainer");
  container.innerHTML = "";

  if (!festivals || festivals.length === 0) {
    container.innerHTML = "<p>Er zijn geen voorbije festivals waar je aan deelnam.</p>";
    return;
  }

  festivals.forEach((fest) => {
    // Outer card
    const card = document.createElement("div");
    card.classList.add("review-card");

    // Linker info
    const infoDiv = document.createElement("div");
    infoDiv.classList.add("festival-info");
    
    const festName = document.createElement("div");
    festName.classList.add("festival-name");
    festName.textContent = `- ${fest.festival_name} -`;

    const festDate = document.createElement("div");
    festDate.classList.add("festival-date");
    festDate.textContent = fest.festival_date ? fest.festival_date : "";

    infoDiv.appendChild(festName);
    infoDiv.appendChild(festDate);

    // Rechter deel
    const ratingSection = document.createElement("div");
    ratingSection.classList.add("rating-section");

    // Gem. rating in een cirkel
    const ratingCircle = document.createElement("div");
    ratingCircle.classList.add("rating-circle");

    // Ster
    const star = document.createElement("div");
    star.classList.add("rating-star");
    star.textContent = "★";
    ratingCircle.appendChild(star);

    // Gem. rating (waarde)
    const avg = fest.avg_rating ? Number(fest.avg_rating).toFixed(1) : "0.0";
    const ratingValue = document.createElement("div");
    ratingValue.classList.add("rating-value");
    ratingValue.textContent = avg;
    ratingCircle.appendChild(ratingValue);

    // Label
    const ratingLabel = document.createElement("div");
    ratingLabel.classList.add("rating-label");
    ratingLabel.textContent = "Gem. Rating";
    ratingCircle.appendChild(ratingLabel);

    ratingSection.appendChild(ratingCircle);

    // User's eigen rating of een knop
    if (fest.user_rating && fest.user_rating > 0) {
      // Toon eigen rating
      const userRatingP = document.createElement("div");
      userRatingP.textContent = `Jouw rating: ${fest.user_rating}`;
      userRatingP.style.fontWeight = "bold";
      userRatingP.style.marginLeft = "1rem";
      ratingSection.appendChild(userRatingP);
    } else {
      // Knop om rating te geven
      const rateBtn = document.createElement("button");
      rateBtn.textContent = "Geef een rating!";
      rateBtn.classList.add("rate-button");
      rateBtn.addEventListener("click", () => {
        geefRating(fest.festival_name);
      });
      ratingSection.appendChild(rateBtn);
    }

    // Samenvoegen
    card.appendChild(infoDiv);
    card.appendChild(ratingSection);
    container.appendChild(card);
  });
}

/**
 * Prompt de user om een rating (1-10) in te voeren, en POST die naar /api/reviews
 */
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
    // Opnieuw data ophalen
    location.reload();
  } catch (err) {
    console.error(err);
    alert("Er ging iets mis bij het opslaan van je rating.");
  }
}

/**
 * Toon de ranglijst onderaan de pagina in dezelfde 'kaart'-stijl
 */
function renderRanking(ranking) {
  const container = document.getElementById("rankingContainer");
  container.innerHTML = "";

  if (!ranking || ranking.length === 0) {
    container.innerHTML = "<p>Er zijn nog geen ratings om te tonen.</p>";
    return;
  }

  ranking.forEach((item) => {
    const card = document.createElement("div");
    card.classList.add("ranking-card");

    // Linkerinformatie: festivalnaam, datum
    const leftDiv = document.createElement("div");
    leftDiv.classList.add("ranking-info");
    leftDiv.textContent = `${item.festival_name} (${item.festival_date || "Onbekend"})`;

    // Rechter deel: gem rating
    const avg = item.average_rating ? Number(item.average_rating).toFixed(1) : "0.0";
    const avgDiv = document.createElement("div");
    avgDiv.style.fontWeight = "bold";
    avgDiv.style.fontSize = "1.2rem";
    avgDiv.textContent = `Gem. rating: ${avg}`;

    card.appendChild(leftDiv);
    card.appendChild(avgDiv);
    container.appendChild(card);
  });
}