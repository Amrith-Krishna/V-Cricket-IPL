document.addEventListener("DOMContentLoaded", async () => {
  await loadMatches("today");
  await loadTodayPredictions();
  document.getElementsByClassName("user-info")[0].innerText =
    "Welcome, " + localStorage.getItem("username");
});

let matches = [];

function showSchedule() {
  location.replace("./schedule");
}

function showTodayMatch() {
  return;
}

function showLeaderboard() {
  location.replace("./board");
}

async function loadMatches(initialFilter = "") {
  try {
    const response = await axios.get("/matches", { withCredentials: true });
    matches = response.data;

    let matchesToDisplay = matches;

    if (initialFilter === "today") {
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setUTCDate(today.getUTCDate() + 1);
      matchesToDisplay = matches.filter((match) => {
        const matchDate = new Date(match.date);
        const utcMatchDate = new Date(
          matchDate.getUTCFullYear(),
          matchDate.getUTCMonth(),
          matchDate.getUTCDate(),
          matchDate.getUTCHours(),
          matchDate.getUTCMinutes(),
          matchDate.getUTCSeconds()
        );
        return utcMatchDate >= today && utcMatchDate < tomorrow;
      });
    }
    displayMatches(matchesToDisplay);
  } catch (error) {
    console.error("Load matches error:", error);
    Swal.fire("Error", "Failed to load matches", "error");
  }
}

async function loadTodayPredictions() {
  try {
    const predictionsList = document.getElementById("todayPredictionsList");
    predictionsList.innerHTML = "";
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setUTCDate(today.getUTCDate() + 1);

    const todayMatches = matches.filter((match) => {
      const matchDate = new Date(match.date);
      const utcMatchDate = new Date(
        matchDate.getUTCFullYear(),
        matchDate.getUTCMonth(),
        matchDate.getUTCDate(),
        matchDate.getUTCHours(),
        matchDate.getUTCMinutes(),
        matchDate.getUTCSeconds()
      );
      return utcMatchDate >= today && utcMatchDate < tomorrow;
    });

    const getTodayPredictions = async () => {
      let predictions = [];
      await Promise.all(
        todayMatches.map(async (match) => {
          await axios
            .get(`/today-predictions/${match._id}`, { withCredentials: true })
            .then(async (response) => {
              predictions = predictions.concat(response.data);
            });
        })
      );

      return predictions;
    };

    await getTodayPredictions().then((predictions) => {
      const predictionsForToday = predictions.filter((prediction) => {
        return todayMatches.some((match) => {
          return (
            match.team1 === prediction.team1 && match.team2 === prediction.team2
          );
        });
      });

      if (predictionsForToday.length === 0) {
        predictionsList.innerHTML =
          "<p>No predictions for today's matches.</p>";
        document.getElementById("todayPredictionsContainer").style.display =
          "block";
        return;
      }

      const predictionsByMatch = {};

      predictionsForToday.forEach((prediction) => {
        const matchKey = `${prediction.team1} vs ${prediction.team2}`;
        if (!predictionsByMatch[matchKey]) {
          predictionsByMatch[matchKey] = [];
        }
        predictionsByMatch[matchKey].push(prediction);
      });

      for (const matchKey in predictionsByMatch) {
        const matchPredictions = predictionsByMatch[matchKey];
        const matchDiv = document.createElement("div");
        matchDiv.innerHTML = `
                <p><strong>${matchKey}</strong></p>
                <div>
                    ${matchPredictions
                      .map(
                        (p) =>
                          `<p>${p.username} predicted: ${p.predictedTeam}</p>`
                      )
                      .join("")}
                </div>
            `;
        predictionsList.appendChild(matchDiv);
      }

      document.getElementById("todayPredictionsContainer").style.display =
        "block";
    });
  } catch (error) {
    console.error("Today predictions error:", error);
    Swal.fire(
      "Error",
      "Failed to load today's predictions. Please make sure you have predicted today and try again.",
      "error"
    );
  }
}

function displayMatches(matchesToDisplay) {
  const matchesList = document.getElementById("matchesList");
  matchesList.innerHTML = "";

  axios
    .get(`/user-predictions`, { withCredentials: true })
    .then((userPredictionsRes) => {
      const userPredictions = userPredictionsRes.data.reduce((acc, pred) => {
        acc[pred.matchId] = pred;
        return acc;
      }, {});

      matchesToDisplay.forEach(async (match) => {
        const matchDiv = document.createElement("div");
        matchDiv.classList.add("match-item");

        // Check if the match has started and has no winner
        const hasStarted = isMatchStarted(match.date);
        const isOngoing = hasStarted && !match.winner;

        if (isOngoing) {
          const ongoingMessage = document.createElement("div");
          ongoingMessage.classList.add("match-ongoing-message");
          ongoingMessage.textContent = "Match Ongoing";
          matchDiv.appendChild(ongoingMessage);
        }

        let predictionDisplay = "";

        if (userPredictions[match._id]) {
          predictionDisplay = `<p class="prediction-result">You predicted: ${
            userPredictions[match._id].predictedTeam
          }</p>`;

          if (match.winner) {
            if (match.winner === userPredictions[match._id].predictedTeam) {
              if (userPredictions[match._id].pointsAwarded) {
                predictionDisplay +=
                  '<p class="prediction-result">Correct! 1 point awarded.</p>';
              } else {
                predictionDisplay +=
                  '<p class="prediction-result">Correct! 1 point awarded.</p>';
              }
            } else {
              predictionDisplay +=
                '<p class="prediction-result">Wrong! You get 0 points.</p>';
            }
            predictionDisplay += `<p class="prediction-result">Winner was: ${match.winner}</p>`;
          }
        } else {
          predictionDisplay =
            '<p class="prediction-result">No prediction yet.</p>';
        }

        matchDiv.innerHTML += `
                    <p style="font-size: 25px"><strong>${
                      match.team1
                    }</strong></p>
                    <p>VS</p> 
                    <p style="font-size: 25px"><strong>${
                      match.team2
                    }</strong></p>
                    <br>
                    <p>${formatDateTime(match.date)} (${match.venue})</p>
                    ${predictionDisplay}
                    <div class="teams-container">
                        <div class="team-logo" onclick="predict('${
                          match._id
                        }', '${match.team1}')">
                            <img src="${getTeamLogo(match.team1)}" alt="${
          match.team1
        }" title="${match.team1}">
                        </div>
                        <div class="team-logo" onclick="predict('${
                          match._id
                        }', '${match.team2}')">
                            <img src="${getTeamLogo(match.team2)}" alt="${
          match.team2
        }" title="${match.team2}">
                        </div>
                    </div>
                `;

        matchesList.appendChild(matchDiv);
      });
    });
}

function isMatchStarted(matchDate) {
  return new Date() > new Date(matchDate);
}

function formatDateTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString("en-IN", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function getTeamLogo(teamName) {
  const logos = {
    "Chennai Super Kings": "./images/Chennai Super Kings.png",
    "Mumbai Indians": "./images/Mumbai Indians.png",
    "Royal Challengers Bengaluru": "./images/Royal Challengers Bangalore.png",
    "Kolkata Knight Riders": "./images/Kolkata Knight Riders.png",
    "Delhi Capitals": "./images/Delhi Capitals.png",
    "Rajasthan Royals": "./images/Rajasthan Royals.png",
    "Punjab Kings": "./images/Punjab Kings.png",
    "Sunrisers Hyderabad": "./images/Sunrisers Hyderabad.png",
    "Lucknow Super Giants": "./images/Lucknow Super Giants.png",
    "Gujarat Titans": "./images/Gujarat Titans.png",
  };

  return (
    logos[teamName] ||
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Crystal_Project_question.svg/240px-Crystal_Project_question.svg.png"
  );
}

async function predict(matchId, team) {
  const match = matches.find((m) => m._id === matchId);
  if (isMatchStarted(match.date)) {
    Swal.fire("Match has already started. Predictions are closed.");
    return;
  }

  Swal.fire({
    title: "Confirm Prediction",
    text: `Predict ${team} to win?`,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Yes",
    cancelButtonText: "No",
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await axios.post(
          "/predict",
          {
            matchId,
            team,
          },
          { withCredentials: true }
        );
        Swal.fire("Success", "Prediction saved!", "success");
      } catch (error) {
        Swal.fire(
          "Error",
          error.response.data.message || "Failed to save prediction",
          "error"
        );
      }
    }
  });
}
