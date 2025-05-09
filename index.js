require("dotenv").config();
const express = require("express");
const axios = require("axios");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

/**
 * Fetches events from Meetup API based on search parameters
 * @param {string} query - Search keyword
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {number} radius - Search radius in miles
 * @returns {Promise<Array>} - Array of events
 */
async function fetchMeetupEvents(query, lat, lon, radius) {
  try {
    const graphqlQuery = {
      query: `
        query($filter: SearchConnectionFilter!) {
          keywordSearch(filter: $filter) {
            count
            edges {
              cursor
              node {
                id
                result {
                  ... on Event {
                    title
                    eventUrl
                    description
                    dateTime
                    going
                    venue {
                      name
                      address
                      city
                      state
                      country
                      lat
                      lng
                    }
                    eventType
                    isOnline
                    group {
                      id
                      name
                      urlname
                    }
                    host {
                      id
                      name
                    }
                  }
                }
              }
            }
          }
        }`,
      variables: {
        filter: {
          query: query || "party",
          lat: parseFloat(lat) || 43.8,
          lon: parseFloat(lon) || -79.4,
          radius: parseInt(radius) || 100,
          source: "EVENTS",
        },
      },
    };

    const response = await axios({
      method: "post",
      url: `https://api.meetup.com/gql`,
      headers: {
        Authorization: `Bearer ${process.env.MEETUP_TOKEN}`,
      },
      data: graphqlQuery,
    });

    if (
      response.data &&
      response.data.data &&
      response.data.data.keywordSearch
    ) {
      return response.data.data.keywordSearch.edges.map((edge) => {
        const event = edge.node.result;
        const venue = event.venue || {};
        const group = event.group || {};
        const host = event.host || {};

        let formattedVenue = "";
        if (venue.name) {
          formattedVenue = venue.name;
          if (venue.address) {
            formattedVenue += `, ${venue.address}`;
          }
          if (venue.city) {
            formattedVenue += `, ${venue.city}`;
          }
          if (venue.state) {
            formattedVenue += `, ${venue.state}`;
          }
        }

        return {
          id: edge.node.id,
          title: event.title,
          eventUrl: event.eventUrl,
          description: event.description,
          dateTime: event.dateTime,
          going: event.going,
          isOnline: event.isOnline || false,
          eventType: event.eventType || "",
          venue: formattedVenue || "Location not specified",
          venueDetails: venue,
          groupId: group.id || "",
          groupName: group.name || "",
          organizerId: host.id || "",
          organizerName: host.name || "",
        };
      });
    }
    return [];
  } catch (error) {
    console.error("Error fetching Meetup events:", error.message);
    return [];
  }
}

// API endpoint to fetch events
app.get("/api/events", async (req, res) => {
  try {
    const { query, lat, lon, radius } = req.query;
    const events = await fetchMeetupEvents(query, lat, lon, radius);
    res.json({ success: true, events });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Serve the main HTML page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
