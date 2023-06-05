const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
const path = require("path");
const dbpath = path.join(__dirname, "moviesData.db");
let db = null;
const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieName: dbObject.movie_name,
  };
};
const convertDbObjectToResponseObject1 = (dbresponse) => {
  return {
    movieId: dbresponse.movie_id,
    directorId: dbresponse.director_id,
    movieName: dbresponse.movie_name,
    leadActor: dbresponse.lead_actor,
  };
};
const initializeServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3002, () => {
      console.log("The server is running at port 4000");
    });
  } catch (e) {
    console.log(`DB Error:${e.message}`);
    process.exit(1);
  }
};
initializeServer();
app.get("/movies/", async (request, response) => {
  const movieQuery = `SELECT movie_name AS movieName FROM movie `;
  const dbresponse = await db.all(movieQuery);
  //   let list = [];
  //   for (let i of dbresponse) {
  //     let ii = convertDbObjectToResponseObject(i);
  //     list.push(ii);
  //   }
  response.send(dbresponse);
});
app.post("/movies/", async (request, response) => {
  const moviesDetails = request.body;
  const { directorId, movieName, leadActor } = moviesDetails;
  const AddMovieQuery = `INSERT INTO movie (director_id,movie_name,lead_actor) VALUES (${directorId},'${movieName}','${leadActor}')`;
  await db.run(AddMovieQuery);
  response.send("Movie Successfully Added");
});
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `SELECT * FROM movie WHERE movie_id=${movieId}`;
  const dbresponse = await db.get(getMovieQuery);
  const answer = convertDbObjectToResponseObject1(dbresponse);
  response.send(answer);
});
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const moviesDetails = request.body;
  const { directorId, movieName, leadActor } = moviesDetails;
  const UpdateMovieQuery = `UPDATE 
                                movie 
                               SET 
                                director_id =${directorId},
                                movie_name='${movieName}',
                                lead_actor='${leadActor}'
                               WHERE 
                                   movie_id=${movieId}`;
  const dbresponse = await db.run(UpdateMovieQuery);
  response.send("Movie Details Updated");
});
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteQuery = `DELETE FROM movie WHERE movie_id=${movieId}`;
  const dbresponse = await db.run(deleteQuery);
  response.send("Movie Removed");
});
app.get("/directors/", async (request, response) => {
  const GetDirectorsQuery = `SELECT 
                                    director_Id AS directorId,director_name AS directorName 
                               FROM 
                                   director
                                ORDER BY 
                                    director_Id `;
  const dbresponse = await db.all(GetDirectorsQuery);
  response.send(dbresponse);
});
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const GetmovieNameQuery = ` SELECT 
                                    movie_name AS movieName
                                FROM
                                    movie
                                WHERE director_id=${directorId}`;
  const dbresponse = await db.all(GetmovieNameQuery);
  response.send(dbresponse);
});
module.exports = app;
