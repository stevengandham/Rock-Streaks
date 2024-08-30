const express = require("express");
const app = express();
let tunnel;
const {
  countPersonStreaks,
  countPersonAttendance,
  getPersonIds,
  getPersonInfo,
  getEventPeriods,
} = require("./api");
const { token, secret } = require("./config");

const localtunnel = require("localtunnel");

// Set up EJS as the view engine
app.set("view engine", "ejs");

// Serve static files from the "public" directory
app.use(express.static("public"));

// middleware to read body, parse it and place results in req.body
app.use(express.json());
// Route for the homepage
app.get("/", async (req, res) => {
  const sundayStudentsEventId = "646254";
  var rockEventId = "649336";

  try {
    // Get all event periods for a given eventId
    const eventPeriods = await getEventPeriods(rockEventId);
    const eventPeriodIds = eventPeriods.map((eventPeriod) => eventPeriod.id);
    const orderedEventPeriodIds = eventPeriodIds.reverse(); // this assumes the eventPeriods were returned in order of [earliest, ... , latest]

    const personIdsByEventPeriod = await getPersonIds(
      rockEventId,
      orderedEventPeriodIds
    );
    // Iterate over orderedEventPeriodIds and count streaks by personId
    let streaks = countPersonStreaks(
      personIdsByEventPeriod,
      orderedEventPeriodIds
    );

    // Iterate over eventPeriodIds and count attendance by personId
    let attendance = countPersonAttendance(
      personIdsByEventPeriod,
      eventPeriodIds
    );
    // Get person information for each person ID synchronously (to not overload the planning center api)

    let allPersonData = [];
    for (const personId of Object.keys(streaks)) {
      let personInfo = await getPersonInfo(personId, token, secret);
      let data = {
        ...personInfo,
        streak: streaks[personId],
        attendance: attendance[personId],
      };
      allPersonData.push(data);
    }
    // Sort in descending order (biggest streak first)
    allPersonData = allPersonData.sort((a, b) => b.streak - a.streak); // descending order
    res.render("index", { allPersonData });
  } catch (error) {
    // Handle any errors
    console.error("Website Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Start the server
app.listen(3000, async () => {
  console.log("Website running on http://localhost:3000");
});

app.post("/webhook", (req, res) => {
  console.log("Webhook Received", req.body);
  res.status(200).send("OK");
});
