document.addEventListener("DOMContentLoaded", async () => {
  await loadLeaderboard();
  document.getElementsByClassName("user-info")[0].innerText =
    "Welcome, " + localStorage.getItem("username");
});

function showSchedule() {
  location.replace("./schedule");
}

function showTodayMatch() {
  location.replace("./today");
}

function showLeaderboard() {
  return;
}

async function loadLeaderboard() {
  try {
    const response = await axios.get("/leaderboard");
    const leaderboardData = await response.data;

    const leaderboardBody = document.getElementById("leaderboardBody");
    leaderboardBody.innerHTML = "";

    leaderboardData.forEach((user, index) => {
      let row = document.createElement("tr");
      row.innerHTML = `
      <td>${index + 1}</td>
                <td>${user.username}</td>
                <td>${user.points}</td>
                <td>${user.accuracy.toFixed(2)}%
            `;
      leaderboardBody.appendChild(row);
      row.id = `row${index}`;
      if (index === 0) {
        row.style.background =
          "linear-gradient(to bottom right,#888800,#ffff22,#777700)";
        row.style.border = "2px solid red";
      } else if (index === 1) {
        row.style.background =
          "linear-gradient(to bottom right,#666666,#dddddd,#555555)";
        row.style.border = "2px solid #555555";
      } else if (index === 2) {
        row.style.background =
          "linear-gradient(to bottom right,#9a5011,#ef9955,#8a4022)";
        row.style.border = "2px solid #896020";
      } else row.style.border = "2px solid #3366aa";
      if (user.username === localStorage.getItem("username")) {
        row.style.fontWeight = "800";
        row.style.borderWidth = "4px";
        if (index > 2)
          row.style.background =
            "linear-gradient(to bottom right,#339999,skyblue,#448888)";
      }
    });
  } catch (error) {
    console.error("Leaderboard error:", error);
    Swal.fire("Error", "Failed to load leaderboard", "error");
  }
}
