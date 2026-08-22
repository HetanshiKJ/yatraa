// ===========================================================================
// data.js — single source of truth for GlobeTrotter India (Screens 7, 8, 9)
// Loaded before screen7.js / screen8.js / screen9.js on every page.
// Keeping this data in one place avoids the screens drifting out of sync
// with each other (e.g. Screen 8 overwriting Screen 9's demo itinerary).
// ===========================================================================

const preplannedTrips = [
  { id: 1, name: "Rajasthan Heritage", dates: "10 Oct – 16 Oct 2026", city: "Jaipur", emoji: "🏰" },
  { id: 2, name: "Kerala Escape", dates: "02 Nov – 08 Nov 2026", city: "Kochi", emoji: "🌴" },
  { id: 3, name: "Himalayan Adventure", dates: "20 Dec – 27 Dec 2026", city: "Manali", emoji: "🏔️" }
];

const previousTrips = [
  { id: 4, name: "Goa Beach Trip", dates: "12 Apr – 16 Apr 2026", city: "Goa", emoji: "🏖️" },
  { id: 5, name: "Varanasi Journey", dates: "03 Mar – 06 Mar 2026", city: "Varanasi", emoji: "🛕" },
  { id: 6, name: "Mumbai Weekend", dates: "10 Jan – 13 Jan 2026", city: "Mumbai", emoji: "🌆" }
];

const searchData = [
  { id: 1, name: "Amber Fort", city: "Jaipur", category: "Culture", description: "Explore the magnificent hilltop fort and Rajput architecture.", duration: 150, cost: 200, emoji: "🏰" },
  { id: 2, name: "City Palace", city: "Jaipur", category: "Sightseeing", description: "Visit the historic royal palace complex in the heart of Jaipur.", duration: 120, cost: 300, emoji: "👑" },
  { id: 3, name: "Backwater Houseboat", city: "Alappuzha", category: "Nature", description: "Enjoy a peaceful cruise through Kerala's famous backwaters.", duration: 240, cost: 2500, emoji: "🛶" },
  { id: 4, name: "Fort Kochi Walk", city: "Kochi", category: "Sightseeing", description: "Discover colonial streets, Chinese fishing nets and local heritage.", duration: 120, cost: 500, emoji: "🌴" },
  { id: 5, name: "Taj Mahal", city: "Agra", category: "Culture", description: "Visit India's iconic monument of love.", duration: 180, cost: 500, emoji: "🕌" },
  { id: 6, name: "Ganges Sunrise Boat Ride", city: "Varanasi", category: "Nature", description: "Experience sunrise over the Ganges from a traditional boat.", duration: 90, cost: 600, emoji: "🛶" },
  { id: 7, name: "Goa Beach Day", city: "Goa", category: "Relaxation", description: "Relax on Goa's beaches and enjoy the coastal atmosphere.", duration: 300, cost: 800, emoji: "🏖️" },
  { id: 8, name: "Gateway of India", city: "Mumbai", category: "Sightseeing", description: "See Mumbai's famous waterfront landmark and harbour.", duration: 90, cost: 0, emoji: "🌆" },
  { id: 9, name: "Manali Mountain Trek", city: "Manali", category: "Adventure", description: "Enjoy a guided Himalayan trek with scenic mountain views.", duration: 300, cost: 1800, emoji: "🏔️" },
  { id: 10, name: "Rishikesh River Rafting", city: "Rishikesh", category: "Adventure", description: "Experience white-water rafting on the Ganges.", duration: 180, cost: 1500, emoji: "🚣" },
  { id: 11, name: "Amritsari Food Walk", city: "Amritsar", category: "Food", description: "Taste local Punjabi favourites and street food.", duration: 150, cost: 900, emoji: "🍛" },
  { id: 12, name: "Meenakshi Temple", city: "Madurai", category: "Culture", description: "Explore the spectacular historic temple complex.", duration: 120, cost: 0, emoji: "🛕" }
];

// The itinerary shown on Screen 9 by default, and also what Screen 8 falls
// back to (via a deep clone) if a visitor adds an activity before any
// itinerary exists in localStorage. Keeping ONE copy of this here means
// adding from Screen 8 first no longer wipes out the Screen 9 demo data.
const defaultItineraryDays = [
  {
    id: 1,
    date: "10 October 2026",
    activities: [
      { id: 101, name: "Amber Fort", city: "Jaipur", duration: 150, cost: 200, startTime: "09:00" },
      { id: 102, name: "City Palace", city: "Jaipur", duration: 120, cost: 300, startTime: "13:00" },
      { id: 103, name: "Hawa Mahal Evening Visit", city: "Jaipur", duration: 90, cost: 100, startTime: "18:00" }
    ]
  },
  {
    id: 2,
    date: "11 October 2026",
    activities: [
      { id: 104, name: "Jantar Mantar", city: "Jaipur", duration: 90, cost: 100, startTime: "10:00" },
      { id: 105, name: "Rajasthani Dinner", city: "Jaipur", duration: 120, cost: 800, startTime: "19:00" }
    ]
  }
];

// Small helper so every screen clones instead of mutating the shared arrays.
function cloneDefaultItinerary() {
  return JSON.parse(JSON.stringify(defaultItineraryDays));
}
