app.get("/new-matches", async (req, res) => {
  try {
    readFile("fix.txt", async (err, data) => {
      if (err) throw err;
      const matches = JSON.parse(data.toString());
      console.log(data.toString());
      await matches.forEach((i) => {
        const newMatch = new Match({
          team1: i.team1,
          team2: i.team2,
          venue: i.venue,
          date: new Date(Date.parse(i.date)),
          finished:
            new Date(Date.parse(i.date)).getTime() + 1000 * 60 * 60 * 24 <
            new Date().getTime(),
        });
        console.log(JSON.stringify(newMatch));
        newMatch.save();
      });
    });
    res.json({ success: true });
  } catch (err) {
    console.log(err.message);
  }
});
