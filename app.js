const convertdbObjToResObj = (eachPlayer) => {
  return {
    playerId: eachPlayer.player_id,
    playerName: eachPlayer.player_name,
  };
};

const convertMatchObjToRes = (eachMatch) => {
  return {
    matchId: eachMatch.match_id,
    match: eachMatch.match,
    year: eachMatch.year,
  };
};

const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketMatchDetails.db");
let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error:${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

//API 1
app.get("/players/", async (request, response) => {
  const getPlayerDetails = `
    SELECT *
    FROM 
    player_details;`;
  const playerDetails = await db.all(getPlayerDetails);
  response.send(
    playerDetails.map((eachPlayer) => convertdbObjToResObj(eachPlayer))
  );
});
//API 2
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerDetails = `
    SELECT 
    *
    FROM 
    player_details 
    WHERE 
    player_id=${playerId};`;
  const playerDetails = await db.get(getPlayerDetails);
  response.send(convertdbObjToResObj(playerDetails));
});
//API 3
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName } = playerDetails;
  const updatePlayerDetails = `
    UPDATE 
    player_details
     SET 
      player_name='${playerName}'
      WHERE 
      player_id=${playerId};`;
  await db.run(updatePlayerDetails);
  response.send("Player Details Updated");
});
//API 4
app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const getMatchDetails = `
    SELECT * 
    FROM 
    match_details 
    WHERE 
    match_id=${matchId};`;
  const matchDetails = await db.get(getMatchDetails);
  console.log(matchDetails);
  response.send(convertMatchObjToRes(matchDetails));
});
//API 5
app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerRes = `
    SELECT *
    FROM 
    player_match_score 
    NATURAL JOIN  match_details
    WHERE
    player_id=${playerId};`;
  const playerMatches = await db.all(getPlayerRes);
  response.send(
    playerMatches.map((eachMatch) => convertMatchObjToRes(eachMatch))
  );
});
//API 6
app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const getPlayerDetails = `
    SELECT *
    FROM 
     player_match_score 
    NATURAL JOIN player_details
    WHERE 
    match_id=${matchId};`;
  const playerDetails = await db.all(getPlayerDetails);
  response.send(
    playerDetails.map((eachPlayer) => convertdbObjToResObj(eachPlayer))
  );
});
//API 7
app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerScores = `
   SELECT 
    player_id ,
    player_name,
    SUM(score),
    SUM(fours),
    SUM(sixes)
    FROM player_match_score 
    NATURAL JOIN player_details
    WHERE 
    player_id=${playerId};`;
  const totalScores = await db.get(getPlayerScores);
  response.send({
    playerId: totalScores.player_id,
    playerName: totalScores.player_name,
    totalScore: totalScores["SUM(score)"],
    totalFours: totalScores["SUM(fours)"],
    totalSixes: totalScores["SUM(sixes)"],
  });
});
module.exports = app;
