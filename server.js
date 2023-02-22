// Create express app
const express = require("express")
const app = express()
const db = require("./database.js");
const fs = require('fs');

const ALL_USER_DATA = JSON.parse(fs.readFileSync("./user_data.json"));
//console.log(ALL_USER_DATA); works for now

ALL_USER_DATA.forEach((user, id) => { // loop through all the data and set up the db
    const insert_user = `INSERT INTO user (id, name, email, phone, company) VALUES (?,?,?,?,?)`;
    db.run(insert_user, [id, user.name, user.email, user.phone, user.company], (err) => {
        if(err) {
            console.log("oopsie", err.message);
        }
        else {
            console.log("successfully created", id);
        }
    });
    //console.log(user.skill);

    user.skills.forEach((skill) => {
        const insert_skills = `INSERT INTO skill (user_id, name, rating) VALUES (?,?,?);`;
        db.run(insert_skills, [id, skill.skill, skill.rating, (err) => {
            if(err) {
                console.log("oopsie 2", err.message);
            }
            else {
                console.log("successfully created skill", id);
            }
        }]);
    });
});

console.log("finished");

// Server port
const HTTP_PORT = 8000 
// Start server
app.listen(HTTP_PORT, () => {
    console.log("Server running on port %PORT%".replace("%PORT%",HTTP_PORT))
});
// Root endpoint
app.get("/", (req, res, next) => {
    res.json({"message":"Ok"})
});

// Insert here other API endpoints

// USER API
// app.get("/api/users", (req, res) => {
//     const sql = "SELECT * FROM user INNER JOIN skill on skill.id = user.id";
//     db.all(sql, [], (err, rows) => {
//         if(err) {
//             res.status(400).json({"error": err.message});
//             return;
//         }
//         res.json({
//             "message": "success",
//             "data": rows
//         })
//     })
// });


// Default response for any other request
app.use(function(req, res){
    res.status(404);
});
