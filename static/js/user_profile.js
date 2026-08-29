// preplannedTrips and previousTrips now come from data.js

function updateAvatar(name) {
  const avatar = document.getElementById("profileAvatar");
  const words = name.trim().split(/\s+/);
  let initials = words[0]?.charAt(0) || "U";
  if (words.length > 1) initials += words[words.length - 1].charAt(0);
  avatar.textContent = initials.toUpperCase();
}

function renderTrips(trips, targetId) {
  const container = document.getElementById(targetId);
  container.innerHTML = "";

  trips.forEach(trip => {
    const card = document.createElement("article");
    card.className = "trip-card";
    card.innerHTML = `
      <div class="trip-image">${trip.emoji}</div>
      <div class="trip-content">
        <h3>${trip.name}</h3>
        <p>${trip.city}</p>
        <p>${trip.dates}</p>
        <button onclick="location.href='screen9.html'">View</button>
      </div>
    `;
    container.appendChild(card);
  });
}

function loadProfile() {
  const saved = localStorage.getItem("globetrotterProfile");
  if (!saved) {
    updateAvatar("Aarav Sharma");
    return;
  }

  const profile = JSON.parse(saved);
  document.getElementById("profileName").value = profile.name;
  document.getElementById("profileEmail").value = profile.email;
  document.getElementById("profileLanguage").value = profile.language;
  document.getElementById("profileCurrency").value = profile.currency;
  if (document.getElementById("profileTimezone")) {
    document.getElementById("profileTimezone").value = profile.timezone || "Asia/Kolkata";
  }
  updateAvatar(profile.name);
}

document.getElementById("profileForm").addEventListener("submit", event => {
  event.preventDefault();

  const profile = {
    name: document.getElementById("profileName").value,
    email: document.getElementById("profileEmail").value,
    language: document.getElementById("profileLanguage").value,
    currency: document.getElementById("profileCurrency").value,
    timezone: document.getElementById("profileTimezone").value
  };

  localStorage.setItem("globetrotterProfile", JSON.stringify(profile));
  updateAvatar(profile.name);

  const message = document.getElementById("profileMessage");
  message.textContent = "Profile updated successfully.";
  setTimeout(() => message.textContent = "", 2500);
});

document.getElementById("profileImageInput").addEventListener("change", event => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = e => {
    const avatar = document.getElementById("profileAvatar");
    avatar.style.backgroundImage = `url(${e.target.result})`;
    avatar.textContent = "";
  };
  reader.readAsDataURL(file);
});

document.getElementById("deleteAccount").addEventListener("click", () => {
  if (confirm("Are you sure you want to delete your account?")) {
    localStorage.removeItem("globetrotterProfile");
    alert("Account deletion request submitted.");
  }
});

loadProfile();
renderTrips(preplannedTrips, "preplannedTrips");
renderTrips(previousTrips, "previousTrips");
