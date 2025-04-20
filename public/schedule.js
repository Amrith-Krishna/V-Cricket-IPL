document.addEventListener("DOMContentLoaded", async () => {
  await loadMatches();
  document.getElementsByClassName("user-info")[0].innerText =
    "Welcome, " + localStorage.getItem("username");
});

function showSchedule() {
  return;
}

function showTodayMatch() {
  location.replace("./today");
}

function showLeaderboard() {
  location.replace("./board");
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
                        <div class="team-logo ${
                          match.winner
                            ? match.winner === match.team1
                              ? "winner-logo"
                              : ""
                            : ""
                        }" onclick="predict('${match._id}', '${match.team1}')">
                            <img src="${getTeamLogo(match.team1)}" alt="${
          match.team1
        }" title="${match.team1}">
                        </div>
                        <div class="team-logo ${
                          match.winner
                            ? match.winner === match.team2
                              ? "winner-logo"
                              : ""
                            : ""
                        }" onclick="predict('${match._id}', '${match.team2}')">
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
function applyFilters() {
  const teamFilter = document.getElementById("teamFilter").value;
  const statusFilter = document.getElementById("statusFilter").value;

  let filteredMatches = matches;

  if (teamFilter) {
    filteredMatches = filteredMatches.filter(
      (match) => match.team1 === teamFilter || match.team2 === teamFilter
    );
  }

  if (statusFilter === "completed") {
    filteredMatches = filteredMatches.filter((match) => match.winner);
  } else if (statusFilter === "incomplete") {
    filteredMatches = filteredMatches.filter((match) => !match.winner);
  }

  displayMatches(filteredMatches);
}
async function loadMatches(initialFilter = "") {
  try {
    const response = await axios.get("/matches", { withCredentials: true });
    matches = response.data;

    let matchesToDisplay = matches;

    if (initialFilter === "incomplete") {
      matchesToDisplay = matches.filter((match) => !match.winner);
    } else if (initialFilter === "today") {
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

    const teamFilter = document.getElementById("teamFilter");
    teamFilter.innerHTML = '<option value="">All Teams</option>';
    const uniqueTeams = [
      ...new Set(matches.flatMap((match) => [match.team1, match.team2])),
    ];
    uniqueTeams.forEach((team) => {
      const option = document.createElement("option");
      option.value = team;
      option.textContent = team;
      teamFilter.appendChild(option);
    });

    const statusFilter = document.getElementById("statusFilter");
    statusFilter.innerHTML = '<option value="">All Matches</option>';
    statusFilter.innerHTML +=
      '<option value="completed">Matches Played</option>';
    statusFilter.innerHTML +=
      '<option value="incomplete">Matches Yet To Be Played</option>';

    displayMatches(matchesToDisplay);

    // Attach event listeners ONCE after the elements are created
    teamFilter.addEventListener("change", applyFilters);
    statusFilter.addEventListener("change", applyFilters);
  } catch (error) {
    console.error("Load matches error:", error);
    Swal.fire("Error", "Failed to load matches", "error");
  }
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
        loadMatches();
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
