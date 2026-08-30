document.addEventListener("DOMContentLoaded", () => {
    // 1. Fetch and process the Header
    fetch("user_header.html")
    .then(response => response.text())
    .then(data => {
        let header = document.getElementById("header-placeholder");
        header.innerHTML = data;

        // 🌟 RUN THE HIGHLIGHT LOGIC RIGHT HERE AFTER HEADER IS FULLY INJECTED!
        highlightActiveTab();
    })
    .catch(error => console.error("Error loading header:", error));

    // 2. Fetch and process the Footer
    fetch("user_footer.html")
    .then(response => response.text())
    .then(data => {
        document.getElementById("footer-placeholder").innerHTML = data;
    })
    .catch(error => console.error("Error loading footer:", error));
});

// Packaged cleanly into a helper function
function highlightActiveTab() {
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll(".nav-link");

  navLinks.forEach(link => {
    const linkHref = link.getAttribute("href");
    if (!linkHref) return;

    // Clean up the link's destination filename (e.g., "community.html")
    const cleanLinkPage = linkHref.split("/").pop();

    // Fallback check for the root home directory index
    if ((currentPath === "/" || currentPath.endsWith("index.html")) && cleanLinkPage === "my-trips.html") {
      link.classList.add("active-page");
      return;
    }

    // Check if the current URL string contains the link's destination filename
    if (currentPath.includes(cleanLinkPage)) {
      link.classList.add("active-page");
    } else {
      link.classList.remove("active-page");
    }
  });
}
