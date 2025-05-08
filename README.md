# Meetup Event Finder

A web application that allows users to search for Meetup events based on keywords, location, and radius.

## Features

- Search for events by keywords
- Filter events by location and radius
- View event details including title, description, date/time, and attendance
- Responsive design using Tailwind CSS

## Prerequisites

- Node.js (v14+)
- npm or yarn
- Meetup API OAuth token

## Installation

1. Clone the repository
2. Navigate to the project directory
3. Install dependencies:
   ```
   npm install
   ```
4. Create a `.env` file in the root directory with your Meetup OAuth token:
   ```
   MEETUP_TOKEN=your_oauth_token_here
   ```

## Usage

1. Start the development server:
   ```
   npm run dev
   ```
2. Open your browser and navigate to `http://localhost:3000`
3. Use the search form to find events based on your interests and location

## Getting a Meetup OAuth Token

1. Register a new OAuth Consumer at [Meetup OAuth Consumers](https://secure.meetup.com/meetup_api/oauth_consumers/)
2. Create an OAuth application and note your consumer key and secret
3. Use the OAuth 2.0 flow to obtain an access token
4. Add this token to your `.env` file

## API

The application uses Meetup's GraphQL API to search for events. The main endpoint is:

```
https://api.meetup.com/gql
```

## Technologies Used

- Express.js - Backend server
- Axios - HTTP client
- Tailwind CSS - Styling
- Dotenv - Environment variables

## License

MIT
# meetup_scraper
