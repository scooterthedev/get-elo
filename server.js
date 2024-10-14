const express = require("express");
const fetch = require("node-fetch");

const app = express();
const PORT = process.env.PORT || 3000;
 
// Fetch eloRate, rank, and win-loss record from the API and return it as plain text
app.get("/get-elo/:username", async (req, res) => {
  let { username } = req.params;

  // Check if the username contains a colon and strip it
  username = username.includes(":") ? username.replace(/:/g, "") : username;

  try {
    const response = await fetch(
      `https://mcsrranked.com/api/users/${username}`
    );

    // Log the raw response status and headers for debugging
    console.log(`Response Status: ${response.status}`);
    console.log(`Response Headers: ${JSON.stringify(response.headers.raw())}`);

    // Check if the response is ok (status code 200)
    if (!response.ok) {
      return res
        .status(response.status)
        .send("Failed to fetch data from the API");
    }

    const textData = await response.text(); // Get the response as text first
    console.log(`Raw Response Data: ${textData}`); // Log the raw response data

    try {
      const data = JSON.parse(textData); // Parse the text data as JSON

      // Check if necessary fields exist in the data
      if (
        data &&
        data.data &&
        data.data.eloRate !== undefined &&
        data.data.eloRank !== undefined &&
        data.data.statistics &&
        data.data.statistics.total &&
        data.data.statistics.total.wins &&
        data.data.statistics.total.loses &&
        data.data.statistics.total.forfeits.ranked &&
        data.data.seasonResult.last.phasePoint !== undefined
      ) {
        const eloRate = data.data.eloRate;
        const eloRank = data.data.eloRank;
        const wins = data.data.statistics.total.wins.ranked;
        const losses = data.data.statistics.total.loses.ranked;
        const forfeits = data.data.statistics.total.forfeits.ranked;
        const phasePoint = data.data.seasonResult.last.phasePoint;

        res.send(
          `Stats for ${username} - Elo: ${eloRate} | Rank: ${eloRank} | Record: ${wins} W - ${losses} L | Forfeits: ${forfeits} | Phase Points: ${phasePoint}`
        );
      } else {
        console.log("Parsed data:", data); // Log the parsed data for debugging
        res.status(404).send("Required data not found");
      }
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError);
      res.status(500).send("Error parsing JSON response");
    }
  } catch (error) {
    console.error("Error fetching the ELO data:", error);
    res.status(500).send("Error fetching the ELO data");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
