var sqlite3 = require('sqlite3').verbose()
const DBSOURCE = "db.sqlite"

// create tables
let db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
      // Cannot open database
      console.error("am i dying", err.message)
      throw err
    } else {
        console.log('Connected to the SQLite database.sssss')
        // should have a table for skills, where the column contains the skill name, the user id, the skill name, and the rating
        db.run(`CREATE TABLE user (
            id INTEGER PRIMARY KEY,
            name TEXT, 
            email TEXT, 
            phone TEXT,
            company TEXT
            );`, (err) => {
                if(err) {
                    console.log("help me 1", err.message)
                }
                else {
                    console.log("user tabled successfully created")
                }
            });

        db.run(`CREATE TABLE skill (
            user_id INTEGER, 
            name TEXT,
            rating INTEGER
            );`, (err) => {
                if(err) {
                    // Table already existed
                    console.log("help me 2", err.message)
                }
                else {
                    console.log("skill table successfully created")
                }
            });
    }
});


module.exports = db
