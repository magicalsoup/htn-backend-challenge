// creates the database
const sqlite3 = require('sqlite3').verbose()
const DBSOURCE = "db.sqlite"


// two tables, explained in README
// in a nutshell: should have a table for skills, 
//    where the column contains the skill name, the user id, the skill name, and the rating
// create tables

let db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
      // Cannot open database
      console.error("Cannot open database: ", err.message);
      throw err
    } else {
        console.log('Connected to the SQLite database');
        db.run(`CREATE TABLE user (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL, 
            email TEXT UNIQUE, 
            phone TEXT NOT NULL,
            company TEXT NOT NULL
            );`, (err) => {
                if(err) {
                    console.log("user table error", err.message);
                }
                else {
                    console.log("user tabled successfully created");
                }
            }
        );

        // probably should also have an unique id for every row in skill table
        db.run(`CREATE TABLE skill (
            user_id INTEGER NOT NULL, 
            skill_name TEXT NOT NULL,
            rating INTEGER NOT NULL,
            FOREIGN KEY(user_id) REFERENCES user(id)
            );`, (err) => {
                if(err) {
                    // Table already existed
                    console.log("skill table error", err.message)
                }
                else {
                    console.log("skill table successfully created")
                }
            }
        );
    }
});

module.exports = db;
