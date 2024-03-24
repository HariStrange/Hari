const express = require('express')

const app = express()

const {open} = require('sqlite')

const sqlite3 = require('sqlite3')

const path = require('path')

app.use(express.json())

const dbpath = path.join(__dirname, 'cricketTeam.db')

let db = null

const initializeDBserver = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('server running at http://localhost:3009/')
    })
  } catch (err) {
    console.log(`DB error: ${err.message}`)
    process.exit(1)
  }
}

initializeDBserver()

const convertObjecttoResponsedObject = dbobject => {
  return {
    playerId: dbobject.player_Id,
    playerName: dbobject.player_name,
    jerseyNumber: dbobject.jersey_number,
    role: dbobject.role,
  }
}

// GET METHOD GET ALL PLAYERS

app.get('/players/', async (request, response) => {
  const getplayerQuery = `
    SELECT 
    * 
    FROM 
    cricket_team;
  `

  const playerArray = await db.all(getplayerQuery)
  response.send(
    playerArray.map(eachplayer => convertObjecttoResponsedObject(eachplayer)),
  )
})

// POST METHOD ADD NEW PLAYER IN THE TEAM

app.post('/players/', async (request, response) => {
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails
  const newplayerQuery = `
    INSERT INTO 
    cricket_team (player_name, jersey_number, role)
    VALUES ('${playerName}',${jerseyNumber},'${role}');
  `
  const player = await db.run(newplayerQuery)
  response.send('Player Added to Team')
})

// GET METHOD GET A PLAYER WITH PLAYER ID

app.get('/players/:playerId', async (request, response) => {
  const {playerId} = request.params
  const getPlayerQuery = `
    SELECT *
    FROM cricket_team
    WHERE player_id :${playerId};
  `
  const player = await db.get(getplayerQuery)
  response.send(convertObjecttoResponsedObject(player))
})

// PUT METHOD UPDATE A PLAYER WITH PLAYER ID

app.put('/player/:playerId', async (request, response) => {
  const {playerDetails} = request.body
  const {playerName, jerseyNumber, role} = playerDetails
  const {playerId} = request.params
  const playerUpdateQuery = `
    UPDATE cricket_team
    SET 
    player_name = '${playerName}',
    jersey_number = ${jerseyNumber},
    role = '${role}'
    WHERE 
    player_id = ${playerId};
    `
  await db.run(playerUpdateQuery)
  response.send('Player Details Updated')
})

// DELETE METHOD DELETE A PLAYER WITH PLAYER ID

app.delete('/players/:players/', async (request, response) => {
  const {playerId} = request.params

  const deletePlayerQuery = `
    DELETE FROM cricket_team
    WHERE 
    player_id : ${playerId};
  `

  await db.run(deletePlayerQuery)
  response.send('Player Removed')
})

module.exports = app
