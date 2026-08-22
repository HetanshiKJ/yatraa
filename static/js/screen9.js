// Default itinerary content now comes from data.js (defaultItineraryDays),
// so Screen 8 and Screen 9 can never drift out of sync with each other.
let itineraryDays = cloneDefaultItinerary();

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0
});

function loadItinerary() {
  const saved = localStorage.getItem("globetrotterItinerary");
  if (!saved) return;

  try {
    itineraryDays = JSON.parse(saved);
  } catch (error) {
    console.error("Could not load itinerary", error);
  }
}

function saveItinerary() {
  localStorage.setItem(
    "globetrotterItinerary",
    JSON.stringify(itineraryDays)
  );
}

function renderItinerary() {
  const container = document.getElementById("itineraryDays");
  container.innerHTML = "";

  itineraryDays.forEach((day, dayIndex) => {
    const dayCard = document.createElement("article");
    dayCard.className = "day-card";

    let content = "";

    if (!day.activities.length) {
      content = `<div class="empty-day">No activities planned.</div>`;
    } else {
      content = `
        <table class="activity-table">
          <thead>
            <tr>
              <th>Physical Activity</th>
              <th>IST Time</th>
              <th>Expense</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${day.activities.map((activity, index) => `
              <tr>
                <td>
                  <span class="drag-handle">⋮⋮</span>
                  <span class="activity-name">${activity.name}</span>
                  <br>
                  <span class="activity-time">
                    ${activity.city} · ${activity.duration} min
                  </span>
                </td>
                <td>${activity.startTime}</td>
                <td class="activity-cost">${INR.format(activity.cost)}</td>
                <td class="activity-actions">
                  <button onclick="moveActivity(${dayIndex}, ${index}, -1)">↑</button>
                  <button onclick="moveActivity(${dayIndex}, ${index}, 1)">↓</button>
                  <button onclick="removeActivity(${dayIndex}, ${index})">×</button>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      `;
    }

    dayCard.innerHTML = `
      <div class="day-header">
        <h2>Day ${dayIndex + 1}</h2>
        <span>${day.date} · IST</span>
      </div>
      ${content}
    `;

    container.appendChild(dayCard);
  });

  updateBudget();
}

function removeActivity(dayIndex, activityIndex) {
  const activity = itineraryDays[dayIndex].activities[activityIndex];

  if (!confirm(`Remove "${activity.name}"?`)) return;

  itineraryDays[dayIndex].activities.splice(activityIndex, 1);
  saveItinerary();
  renderItinerary();
}

function moveActivity(dayIndex, activityIndex, direction) {
  const activities = itineraryDays[dayIndex].activities;
  const newIndex = activityIndex + direction;

  if (newIndex < 0 || newIndex >= activities.length) return;

  [activities[activityIndex], activities[newIndex]] =
    [activities[newIndex], activities[activityIndex]];

  saveItinerary();
  renderItinerary();
}

function updateBudget() {
  let activityTotal = 0;

  itineraryDays.forEach(day => {
    day.activities.forEach(activity => {
      activityTotal += Number(activity.cost);
    });
  });

  // Demo categories; replace with trip_expenses API data later.
  const transportTotal = 4500;
  const accommodationTotal = 12000;
  const mealTotal = 5000;
  const total = activityTotal + transportTotal + accommodationTotal + mealTotal;

  document.getElementById("activityCost").textContent = INR.format(activityTotal);
  document.getElementById("transportCost").textContent = INR.format(transportTotal);
  document.getElementById("accommodationCost").textContent = INR.format(accommodationTotal);
  document.getElementById("mealCost").textContent = INR.format(mealTotal);
  document.getElementById("totalBudget").textContent = INR.format(total);

  const plannedBudget = 40000;
  const percentage = Math.min(Math.round((total / plannedBudget) * 100), 100);

  document.getElementById("budgetProgress").value = percentage;
  document.getElementById("budgetPercentage").textContent = `${percentage}%`;
}

loadItinerary();
renderItinerary();
