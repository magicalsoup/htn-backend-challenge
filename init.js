// initializes the database with the data provided
const fs = require('fs');
const db = require("./database.js");
const ALL_USER_DATA = JSON.parse(fs.readFileSync("./user_data.json"));

// ASSUMES that the database is empty 
//  - will fail if there are existing values in database due to the unique constraint on id
ALL_USER_DATA.forEach((user, id) => { // loop through all the data and set up the db

    // the ? values are replaced by values in the params array
    const insert_user = `INSERT INTO user (id, name, email, phone, company) VALUES (?,?,?,?,?)`;
    const params = [id, user.name, user.email, user.phone, user.company];
    db.run(insert_user, params, (err) => {
        if(err) {
            console.log("user insert failed", err.message);
        }
        else {
            console.log("successfully created user", id); // for sanity purposes - feel free to comment out
        }
    });

    user.skills.forEach((skill) => {
        const insert_skills = `INSERT INTO skill (user_id, skill_name, rating) VALUES (?,?,?)`;
        const params = [id, skill.skill, skill.rating];
        db.run(insert_skills, params, (err) => {
            if(err) {
                console.log("skill insert failed", err.message);
            }
            else {
                console.log("successfully created skill", id);  // for sanity purposes - feel free to comment out
            }
        });
    });
});
