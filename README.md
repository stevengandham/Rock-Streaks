# Rock Streaks

## _The Check-In Incentivizer_

How invigorating it is to climb to the mountaintop, but how tragic a fall it would be. This isn't your typical Mount Everest. Introducing "The Check-Incentivizer". Climb to the top of the leaderboard and track your consistency with a 🔥 flaming hot streak 🔥 and your all time record attendance 📈

## Features

- Display a leaderboard of the top N People participants from a given X event_id.
- Uploaded Avatars followed by participant's name is shown on the leaderboard.
- Gold, Silver, and Bronze placings determined by hottest streaks denoted by 🔥.
- Displays total attendance count per individual denoted by 📈.

## Pre-Configuration

Set token/secret values in the config.js file according to your Personal Access Token details provided by Planning Center API.

## Installation

Install localtunnel globally, so it can be run in any terminal. [**will need to do this just once**]

```
npm install -g localtunnel
```

### Open 2 Terminals

#### In Terminal 1:

Will need to install dependencies and start the server.

```
npm i
npm run start
```

**_should start running server on localhost:3000_**

#### In Terminal 2:

Generate a localtunnel endpoint hosting your server code.

```
lt --port 3000
```

### In Browser:

Navigate to Terminal 2's localtunnel endpoint.
Vwala. The pinnacle of your streak dreams.

## For Future Development

- Navigate to Webhook section of Planning Center, and paste the generated url from Terminal 2.
- append '/webhook' to the end of the pasted url.
- select "Check-Ins" events to be notified about (For Future API Development if supported)
- Press Enter.
- Upon a webhook being triggered, the data will be routed to the localhost program.
- Implement webhook refresh/append logic to running data.
