/**
 * Meetup Event Finder
 * Frontend JavaScript for handling API requests and rendering events
 */

document.addEventListener("DOMContentLoaded", () => {
  // DOM elements
  const searchForm = document.getElementById("search-form");
  const loadingIndicator = document.getElementById("loading");
  const resultsContainer = document.getElementById("results-container");
  const eventsGrid = document.getElementById("events-grid");
  const eventsTableContainer = document.getElementById(
    "events-table-container"
  );
  const eventsTableBody = document.getElementById("events-table-body");
  const eventCount = document.getElementById("event-count");
  const noResults = document.getElementById("no-results");
  const errorMessage = document.getElementById("error-message");
  const viewTableBtn = document.getElementById("view-table");
  const viewCardsBtn = document.getElementById("view-cards");
  const exportCsvBtn = document.getElementById("export-csv");

  // Store events data globally for export
  let eventsData = [];

  /**
   * Format date from ISO string to readable format
   * @param {string} isoString - ISO date string
   * @returns {string} - Formatted date string
   */
  const formatDate = (isoString) => {
    if (!isoString) return "Date not specified";

    const date = new Date(isoString);
    return date.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  /**
   * Format date to ISO string format for CSV export
   * @param {string} isoString - ISO date string
   * @returns {string} - ISO formatted date string
   */
  const formatISODate = (isoString) => {
    if (!isoString) return "";
    return isoString;
  };

  /**
   * Truncate text to specified length
   * @param {string} text - Text to truncate
   * @param {number} maxLength - Maximum length
   * @returns {string} - Truncated text
   */
  const truncateText = (text, maxLength) => {
    if (!text) return "";
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  /**
   * Create HTML for a single event card
   * @param {Object} event - Event data
   * @returns {string} - HTML string for the event card
   */
  const createEventCard = (event) => {
    // Clean description text
    const cleanDescription = event.description
      ? event.description.replace(/<[^>]*>/g, "")
      : "No description provided";

    // Location display
    const locationDisplay = event.isOnline
      ? "Online"
      : event.venue || "Location not specified";

    return `
      <div class="event-card rounded-lg border bg-white text-gray-900 shadow-sm overflow-hidden relative hover:shadow-md transition-shadow duration-300">
        <!-- Card Header -->
        <div class="flex flex-col space-y-1.5 p-6">
          <div class="text-xl font-semibold leading-none tracking-tight text-gray-900">
            ${event.title}
          </div>
          <div class="text-sm text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            ${event.going || 0} attending
          </div>
        </div>
        
        <!-- Card Content -->
        <div class="p-6 pt-0">
          <div class="text-sm text-gray-600 truncate-3-lines">
            ${cleanDescription}
          </div>
        </div>
        
        <!-- Card Footer -->
        <div class="flex items-center justify-between p-6 pt-0">
          <div class="flex flex-col space-y-1">
            <div class="flex items-center text-xs text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              ${formatDate(event.dateTime)}
            </div>
            <div class="flex items-center text-xs text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              ${locationDisplay}
            </div>
          </div>
          <a href="${event.eventUrl}" target="_blank" 
            class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-indigo-600 text-white hover:bg-indigo-700 h-9 px-4 py-2">
            View Event
          </a>
        </div>
      </div>
    `;
  };

  /**
   * Create HTML for a single event table row
   * @param {Object} event - Event data
   * @returns {string} - HTML string for the event table row
   */
  const createEventTableRow = (event) => {
    const description = event.description
      ? truncateText(event.description.replace(/<[^>]*>/g, ""), 100)
      : "No description provided";

    const locationDisplay = event.isOnline
      ? "Online"
      : event.venue || "Location not specified";

    return `
      <tr>
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="text-sm font-medium text-gray-900">${event.title}</div>
        </td>
        <td class="px-6 py-4">
          <div class="text-sm text-gray-500">${description}</div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="text-sm text-gray-500">${formatDate(event.dateTime)}</div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="text-sm text-gray-500">${locationDisplay}</div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
            ${event.going || 0} people
          </span>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <a href="${
            event.eventUrl
          }" target="_blank" class="text-indigo-600 hover:text-indigo-900">View</a>
        </td>
      </tr>
    `;
  };

  /**
   * Display error message to user
   * @param {string} message - Error message to display
   */
  const showError = (message) => {
    errorMessage.textContent = message;
    errorMessage.classList.remove("hidden");
    loadingIndicator.classList.add("hidden");
    resultsContainer.classList.add("hidden");

    // Auto-hide after 5 seconds
    setTimeout(() => {
      errorMessage.classList.add("hidden");
    }, 5000);
  };

  /**
   * Fetch events from the API
   * @param {FormData} formData - Form data with search parameters
   * @returns {Promise<Array>} - Array of events
   */
  const fetchEvents = async (formData) => {
    const query = formData.get("query") || "party";
    const lat = formData.get("latitude") || "43.8";
    const lon = formData.get("longitude") || "-79.4";
    const radius = formData.get("radius") || "100";

    try {
      const response = await fetch(
        `/api/events?query=${encodeURIComponent(
          query
        )}&lat=${lat}&lon=${lon}&radius=${radius}`
      );
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to fetch events");
      }

      return data.events || [];
    } catch (error) {
      showError(`Error fetching events: ${error.message}`);
      return [];
    }
  };

  /**
   * Switch to table view
   */
  const showTableView = () => {
    eventsGrid.classList.add("hidden");
    eventsTableContainer.classList.remove("hidden");
    viewTableBtn.classList.remove("bg-gray-200", "text-gray-800");
    viewTableBtn.classList.add("bg-indigo-600", "text-white");
    viewCardsBtn.classList.remove("bg-indigo-600", "text-white");
    viewCardsBtn.classList.add("bg-gray-200", "text-gray-800");
  };

  /**
   * Switch to card view
   */
  const showCardView = () => {
    eventsTableContainer.classList.add("hidden");
    eventsGrid.classList.remove("hidden");
    viewCardsBtn.classList.remove("bg-gray-200", "text-gray-800");
    viewCardsBtn.classList.add("bg-indigo-600", "text-white");
    viewTableBtn.classList.remove("bg-indigo-600", "text-white");
    viewTableBtn.classList.add("bg-gray-200", "text-gray-800");
  };

  /**
   * Extract meeting link from description if available
   * @param {Object} event - Event data
   * @returns {string} - Meeting link or empty string
   */
  const extractMeetingLink = (event) => {
    if (!event.description) return "";

    // Look for URLs in the description
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const matches = event.description.match(urlRegex);

    if (matches && matches.length > 0) {
      // Filter for likely meeting URLs
      const meetingDomains = [
        "zoom.us",
        "meet.google",
        "teams.microsoft",
        "webex",
        "gotomeeting",
      ];
      const meetingUrls = matches.filter((url) =>
        meetingDomains.some((domain) => url.includes(domain))
      );

      return meetingUrls.length > 0 ? meetingUrls[0] : "";
    }

    return "";
  };

  /**
   * Convert events data to CSV and download it
   */
  const exportToCsv = () => {
    if (eventsData.length === 0) {
      showError("No events to export");
      return;
    }

    // Define CSV headers matching the template
    const headers = [
      "name",
      "description",
      "eventDate",
      "location",
      "isVirtual",
      "meetingLink",
      "hobbyId",
      "groupId",
      "organizerId",
    ];

    // Prepare event data rows
    const rows = eventsData.map((event) => {
      const description = event.description
        ? event.description.replace(/<[^>]*>/g, "").replace(/"/g, '""') // Escape double quotes
        : "";

      // Determine location
      const location = event.isOnline ? "Online" : event.venue || "";

      // Extract meeting link for online events
      const meetingLink = event.isOnline ? extractMeetingLink(event) : "";

      return [
        `"${event.title.replace(/"/g, '""')}"`, // name
        `"${description}"`, // description
        formatISODate(event.dateTime), // eventDate
        `"${location}"`, // location
        event.isOnline.toString(), // isVirtual
        `"${meetingLink}"`, // meetingLink
        "", // hobbyId - leave blank as this is specific to the template
        event.groupId ? `"${event.groupId}"` : "", // groupId
        event.organizerId ? `"${event.organizerId}"` : "", // organizerId
      ];
    });

    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    // Create a download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    // Set up download link
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `meetup-events-${new Date().toISOString().slice(0, 10)}.csv`
    );
    link.style.display = "none";

    // Add to document, trigger click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /**
   * Handle form submission
   * @param {Event} e - Form submit event
   */
  const handleFormSubmit = async (e) => {
    if (e) {
      e.preventDefault();
    }

    // Show loading indicator
    loadingIndicator.classList.remove("hidden");
    resultsContainer.classList.add("hidden");
    errorMessage.classList.add("hidden");

    const formData = new FormData(searchForm);
    const events = await fetchEvents(formData);

    // Store events for export
    eventsData = events;

    // Hide loading indicator
    loadingIndicator.classList.add("hidden");

    // Update UI
    if (events.length > 0) {
      // Update the card view
      eventsGrid.innerHTML = events
        .map((event) => createEventCard(event))
        .join("");

      // Update the table view
      eventsTableBody.innerHTML = events
        .map((event) => createEventTableRow(event))
        .join("");

      eventCount.textContent = events.length;
      resultsContainer.classList.remove("hidden");
      noResults.classList.add("hidden");
    } else {
      resultsContainer.classList.remove("hidden");
      noResults.classList.remove("hidden");
      eventsGrid.innerHTML = "";
      eventsTableBody.innerHTML = "";
      eventCount.textContent = "0";
    }
  };

  // Add event listeners
  searchForm.addEventListener("submit", handleFormSubmit);
  viewTableBtn.addEventListener("click", showTableView);
  viewCardsBtn.addEventListener("click", showCardView);
  exportCsvBtn.addEventListener("click", exportToCsv);

  // Get user's location if available
  if (navigator.geolocation) {
    document.querySelector(".container").insertAdjacentHTML(
      "afterbegin",
      `<div class="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-blue-700">
              <button id="use-location" class="font-medium underline">Use my current location</button>
            </p>
          </div>
        </div>
      </div>`
    );

    document.getElementById("use-location").addEventListener("click", () => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          document.getElementById("latitude").value =
            position.coords.latitude.toFixed(4);
          document.getElementById("longitude").value =
            position.coords.longitude.toFixed(4);
        },
        (error) => {
          showError(`Location error: ${error.message}`);
        }
      );
    });
  }

  // Trigger a search with default values on page load
  handleFormSubmit(new Event("submit"));
});
