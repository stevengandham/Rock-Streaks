const axios = require("axios");
const { token, secret } = require("./config");

// Function to make an API request using HTTP basic auth
async function makeApiRequest(apiUrl, token, secret) {
  const authHeader = {
    Authorization: `Basic ${Buffer.from(`${token}:${secret}`).toString(
      "base64"
    )}`,
  };

  try {
    const response = await axios.get(apiUrl, { headers: authHeader });
    return response.data;
  } catch (error) {
    console.error("API Request Error:", error.message);
    throw new Error("API request failed");
  }
}

// Function to retrieve person information using person ID
async function getPersonInfo(personId, token, secret) {
  // API endpoint URL for person information
  const apiUrl = `https://api.planningcenteronline.com/people/v2/people/${personId}`;

  try {
    // Make the API request for person information
    const personInfo = await makeApiRequest(apiUrl, token, secret);

    // Return the person information
    const {
      data: {
        attributes: { avatar, first_name, last_name },
      },
    } = personInfo;

    // Return the desired person information
    return {
      avatar,
      first_name,
      last_name,
    };
  } catch (error) {
    // Handle any errors
    console.error("Person Info Error:", error);
    throw new Error("Failed to retrieve person information");
  }
}

const countPersonStreaks = (personIdsByEventPeriod, orderedEventPeriodIds) => {
  let orderedEvents = orderedEventPeriodIds;
  let mostRecentEventPeriod = orderedEvents[0];
  let inTheRunning = {};
  for (let id of personIdsByEventPeriod[mostRecentEventPeriod].keys()) {
    inTheRunning[id] = 1;
  }
  for (let e = 1; e < orderedEvents.length; e++) {
    let eventPeriodId = orderedEvents[e];
    let personIds = personIdsByEventPeriod[eventPeriodId];
    for (let p of Object.keys(inTheRunning)) {
      let streakCount = inTheRunning[p];
      let attendance = personIds.has(p);
      if (streakCount > 0 && attendance && e == streakCount) {
        inTheRunning[p] += 1;
      } else {
        /* don't count that person
         * because the streak has been broken,
         * in the sense the person did not attend the most recent event
         */
      }
    }
  }
  return inTheRunning;
};

const countPersonAttendance = (personIdsByEventPeriod, eventPeriodIds) => {
  let events = eventPeriodIds;
  let attendance = {};
  for (let e = 0; e < events.length; e++) {
    let eventPeriodId = events[e];
    let personIds = personIdsByEventPeriod[eventPeriodId];
    for (let p of personIds) {
      attendance[p] = !attendance[p] ? 1 : attendance[p] + 1;
    }
  }
  return attendance;
};

const getEventPeriods = async (eventId) => {
  // get all event periods for singular eventID
  let perPage = 100;
  let offset = 0;
  let apiUrl = `https://api.planningcenteronline.com/check-ins/v2/events/${eventId}/event_periods?per_page=${perPage}&offset=${offset}&order=starts_at`;
  try {
    // Make the API request for person information
    let eventPeriods = await makeApiRequest(apiUrl, token, secret);
    let totalCount = eventPeriods.meta.total_count;
    let currentCount = eventPeriods.meta.count;
    eventPeriods = eventPeriods.data;
    while (currentCount < totalCount) {
      offset += currentCount;
      apiUrl = `https://api.planningcenteronline.com/check-ins/v2/events/${eventId}/event_periods?per_page=${perPage}&offset=${offset}&order=starts_at`;
      let res = await makeApiRequest(apiUrl, token, secret);
      eventPeriods.concat(res.data);
      currentCount += res.meta.count;
    }
    const eventPeriodIds = eventPeriods.filter(
      (eventPeriod) => eventPeriod.attributes.volunteer_count > 0
    );
    // console.log(eventPeriodIds);
    return eventPeriodIds;
  } catch (error) {
    // Handle any errors
    console.error("Event Period Error:", error);
    throw new Error("Failed to retrieve pevent periods");
  }
};

// Retrieve person IDs from the API endpoint by eventId and eventPeriods
const getPersonIds = async (eventId, eventPeriods) => {
  // const apiUrl = `https://api.planningcenteronline.com/check-ins/v2/events/${eventId}/event_periods/${eventPeriod}/check_ins?filter=regular&per_page=100`;
  // const apiUrl = 'https://api.planningcenteronline.com/check-ins/v2/events/102608/event_periods/24455439/check_ins?filter=regular&per_page=100';

  // Extract person IDs from the check-ins data
  const mapPersonIds = (checkInsData) => {
    // console.log("checkInsData: " + JSON.stringify(checkInsData));
    return checkInsData.map(
      (attendee) => attendee.relationships.person.data.id
    );
  };
  try {
    let personIdsByEventPeriod = {};
    for (let i = 0; i < eventPeriods.length; i++) {
      let apiUrl = `https://api.planningcenteronline.com/check-ins/v2/events/${eventId}/event_periods/${eventPeriods[i]}/check_ins?filter=regular&per_page=100`;
      let res = await makeApiRequest(apiUrl, token, secret);
      personIdsByEventPeriod[eventPeriods[i]] = new Set(mapPersonIds(res.data));
    }
    // console.log(personIdsByEventPeriod);

    // Return the array of person IDs
    return personIdsByEventPeriod;
  } catch (error) {
    // Handle any errors
    console.error("Person IDs Error:", error);
    throw new Error("Failed to retrieve person IDs");
  }
};

// Call the function to retrieve person IDs
// getPersonIds()
//   .then(async (personIds) => {
//     console.log('Person IDs:', personIds);

//     // Retrieve person information for each person ID
//     const personInfoArray = [];
//     for (const personId of personIds) {
//       try {
//         const personInfo = await getPersonInfo(personId, token, secret);
//         personInfoArray.push(personInfo);
//       } catch (error) {
//         // Handle any errors
//         console.error('Person Info Error:', error);
//       }
//     }

//     console.log('Person Information:', personInfoArray);

//   })
//   .catch((error) => {
//     console.error('Error:', error);
//     // Handle error scenarios
//   });

module.exports = {
  makeApiRequest,
  getPersonIds,
  getPersonInfo,
  getEventPeriods,
  countPersonStreaks,
  countPersonAttendance,
};
