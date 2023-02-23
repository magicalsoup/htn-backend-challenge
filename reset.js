// resets the data base
const sqlite3 = require('sqlite3').verbose()
const DBSOURCE = "db.sqlite"

let db = new sqlite3.Database(DBSOURCE, (err) => {
    if(err) {
        console.log("Could not reset database ", err.message);
    }
    else {
        db.run("DROP TABLE user");
        db.run("DROP TABLE skill");
        console.log("Database reset");
    }
});