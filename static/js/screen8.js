// searchData now comes from data.js

const searchInput = document.getElementById("searchInput");
const groupFilter = document.getElementById("groupFilter");
const categoryFilter = document.getElementById("categoryFilter");
const sortFilter = document.getElementById("sortFilter");

[searchInput, groupFilter, categoryFilter, sortFilter].forEach(element => {
  element.addEventListener("input", performSearch);
  element.addEventListener("change", performSearch);
});

function performSearch() {
  const term = searchInput.value.toLowerCase().trim();
  const category = categoryFilter.value;
  const groupBy = groupFilter.value;
  const sortBy = sortFilter.value;

  let results = searchData.filter(item => {
    const matchesSearch =
      item.name.toLowerCase().includes(term) ||
      item.city.toLowerCase().includes(term) ||
      item.category.toLowerCase().includes(term);

    const matchesCategory =
      category === "all" || item.category === category;

    return matchesSearch && matchesCategory;
  });

  if (groupBy === "city") {
    results.sort((a, b) =>
      a.city.localeCompare(b.city) || a.name.localeCompare(b.name)
    );
  }

  if (groupBy === "category") {
    results.sort((a, b) =>
      a.category.localeCompare(b.category) || a.name.localeCompare(b.name)
    );
  }

  if (sortBy === "name") results.sort((a, b) => a.name.localeCompare(b.name));
  if (sortBy === "cost-low") results.sort((a, b) => a.cost - b.cost);
  if (sortBy === "cost-high") results.sort((a, b) => b.cost - a.cost);
  if (sortBy === "duration") results.sort((a, b) => a.duration - b.duration);

  document.getElementById("resultCount").textContent =
    `${results.length} result${results.length === 1 ? "" : "s"}`;

  renderResults(results);
}

function renderResults(results) {
  const container = document.getElementById("searchResults");
  container.innerHTML = "";

  if (!results.length) {
    container.innerHTML = `
      <div class="search-result">
        <div class="result-info">
          <h3>No results found</h3>
          <p>Try another Indian city, activity, or category.</p>
        </div>
      </div>
    `;
    return;
  }

  results.forEach(item => {
    const card = document.createElement("article");
    card.className = "search-result";

    card.innerHTML = `
      <div class="result-image">${item.emoji}</div>

      <div class="result-info">
        <h3>${item.name}</h3>
        <p>${item.description}</p>

        <div class="result-meta">
          <span class="meta-tag">${item.city}</span>
          <span class="meta-tag">${item.category}</span>
          <span class="meta-tag">${item.duration} min</span>
        </div>
      </div>

      <div class="result-actions">
        <span class="result-cost">
          ${item.cost === 0 ? "Free" : "₹" + item.cost.toLocaleString("en-IN")}
        </span>

        <button onclick="addActivity(${item.id})">Add to Trip</button>
      </div>
    `;

    container.appendChild(card);
  });
}

function addActivity(id) {
  const activity = searchData.find(item => item.id === id);
  if (!activity) return;

  const saved = JSON.parse(
    localStorage.getItem("globetrotterItinerary") || "null"
  );

  // If nothing has been saved yet, start from a clone of the same default
  // itinerary Screen 9 shows, rather than a blank single day — otherwise
  // adding an activity here before ever visiting Screen 9 would erase its
  // pre-planned demo days entirely.
  const itinerary = saved || cloneDefaultItinerary();

  itinerary[0].activities.push({
    id: Date.now(),
    name: activity.name,
    city: activity.city,
    duration: activity.duration,
    cost: activity.cost,
    startTime: "10:00"
  });

  localStorage.setItem("globetrotterItinerary", JSON.stringify(itinerary));
  alert(`${activity.name} added to your itinerary.`);
}

performSearch();
