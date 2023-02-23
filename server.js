// Create express app
const express = require("express")
const app = express()
app.use(express.json()) // so it can get body from requests
const db = require("./database.js");

// Server port
const HTTP_PORT = 8000 
// Start server
app.listen(HTTP_PORT, () => {
    console.log("Server running on port %PORT%".replace("%PORT%", HTTP_PORT))
});
// Root endpoint
app.get("/", (req, res, next) => {
    res.json({"message":"Ok"})
});

// Insert here other API endpoints
// users endpoint
app.get("/api/users/", (req, res) => {

    const id = req.query.id;
    
    if(id) { // if an id is given

        if(isNaN(id)) { // check if its a valid id
            res.status(400).json({"message": 'invalid id'});
            return;
        }
        // /api/users/?id=<user_id> - the endpoint
        // notes: ?1 is parameter binding - indicating the first value in the param array below
        const sql = `SELECT * 
                    FROM user
                    LEFT JOIN skill ON skill.user_id = ?1
                    WHERE user.id = ?1`;
        const params = [id];      
        // note: I do recongize that .all gets the entire rows stored in memory (might be inefficient)
        //  but for a single user its ok because there isn't that many rows (depending on # of skills)  
        // solution is probably .each, but not sure if it will work with current design (sync issues)    
        db.all(sql, params, (err, rows) => {

            if(err) { // bad request
                res.status(400).json({"error": err.message});
                return;
            }
            
            // looks ugly, not sure if there's a clean sql way to do it 
            let resultData;
            
            rows.forEach((row) => {
                if(!resultData) { 
                    resultData = {
                        id: row.id,
                        name: row.name,
                        company: row.company,
                        email: row.email,
                        phone: row.phone,
                        skills: [
                            {
                                name: row.skill_name,
                                rating: row.rating
                            }
                        ] 
                    };
                }
                else {
                    resultData.skills.push({
                        name: row.skill_name,
                        rating: row.rating
                    });
                }
            })

            res.status(200).json({
                "message": "success",
                ...resultData
            });
        })
        return;
    }

    // for getting all the users, if no id is specified
    const sql = `SELECT * 
                    FROM user
                    LEFT JOIN skill ON skill.user_id = user.id`;
    // note: recongized the memory overhead with using .all, maybe refactor with .each but that would
    //  run into sync issues
    db.all(sql, [], (err, rows) => {
        if(err) {
            res.status(400).json({"error": err.message});
            return;
        }

        if(rows.length === 0) { // No Content request
            res.status(204).json({"message": "No matching user with this id"});
            return;
        }

        // looks ugly, not sure if there's a clean sql only way to do it
        let resultData = [];
        rows.forEach((row, index) => {
            if(row.id < resultData.length) {
                resultData[row.id].skills.push({
                    name: row.skill_name,
                    rating: row.rating,
                });
            }
            else {
                resultData.push({
                    id: row.id,
                    name: row.name,
                    company: row.company,
                    email: row.email,
                    phone: row.phone,
                    skills: [
                        {
                            name: row.skill_name,
                            rating: row.rating
                        }
                    ]
                });
            }
        });

        res.status(200).json({
            "message": "success",
            ...resultData
        });
    });
});

// updating a user
app.patch("/api/users/", (req, res) => {

    const data = req.body;
    if(req.query.id !== undefined && data !== undefined) {

        if(isNaN(req.query.id)) { // if the id is not a number
            res.status(400).json({"message": 'invalid id'});
            return;
        }

        const id = parseInt(req.query.id);
        
        // order of the db queries matters for this part
        db.serialize(() => {
            for(let d in data) {
                // d is the property, and data[d] is the value
                if(d == "skills") {
                    data[d].forEach((skill) => {
                        if(isNaN(skill.rating)) { // if the rating is invalid
                            res.status(400).json({"message": "invalid rating"});
                            return;
                        }

                        db.serialize(() => {
                            const delete_qry = `DELETE  
                                                FROM skill 
                                                WHERE skill.user_id = ? AND skill.skill_name = ?`;
                            const delete_params = [id, skill.name];

                            const insert_qry =  'INSERT INTO skill (user_id, skill_name, rating) VALUES (?,?,?)';
                            const insert_params = [id, skill.name, parseInt(skill.rating)];

                            db.run(delete_qry, delete_params).run(insert_qry, insert_params);
                        });
                    });            
                } else {
                    // maybe becareful of sql injections - but should be fine since escaped using string literals?
                    const sql = `UPDATE user
                                SET "${d}" = "${data[d]}" 
                                WHERE user.id = ${id}`;
                    
                    db.run(sql, [], (err) => {
                        if(err) {
                            res.status(400).json({"error": err.message});
                            return;
                        }
                    });
                }
            }
            
            // after updating the user, we return the user info with the updated info
            // note: maybe we can reuse/call our user api
            //  also the ?1 are replaced by the params array
            const sql = `SELECT * 
                    FROM user
                    LEFT JOIN skill ON skill.user_id = ?1
                    WHERE user.id = ?1`;
            const params = [id];
            db.all(sql, params, (err, rows) => {
                if(err) {
                    res.status(400).json({"error": err.message});
                    return;
                }

                // code is copied from the user api
                let resultData;
                rows.forEach((row) => {
                    if(!resultData) {
                        resultData = {
                            id: row.id,
                            name: row.name,
                            company: row.company,
                            email: row.email,
                            phone: row.phone,
                            skills: [
                                {
                                    name: row.skill_name,
                                    rating: row.rating
                                }
                            ] 
                        };
                    }
                    else {
                        resultData.skills.push({
                            name: row.skill_name,
                            rating: row.rating
                        });
                    }
                })
                res.status(200).send({
                    "message": "success",
                    ...resultData
                });
            });
        })
       
    } else {
        res.status(400).json({"error": "Invalid id or data"});
        return;
    }
});

// skills endpoint
app.get("/api/skills/", (req, res) => {
    const min_frequency = req.query.min_frequency;
    const max_frequency = req.query.max_frequency;

    // usage /api/skills/?min_frequency=<a>&max_frequency=<b> - api endpoint
    if(min_frequency !== undefined && max_frequency !== undefined) {

        if(isNaN(min_frequency) || isNaN(max_frequency)) {
            res.status(400).json({"message": 'invalid min_frequency/max_frequency value'});
            return;
        }
        // ? are replaced by the values in the params array
        const sql = `SELECT *
                     FROM (
                        SELECT skill_name as "skill", 
                        COUNT( DISTINCT user_id ) as "frequency" 
                        FROM skill 
                        GROUP By skill_name ) t
                    WHERE t.frequency >= ? AND t.frequency <= ?`;
        
        const params = [parseInt(min_frequency), parseInt(max_frequency)];
        db.all(sql, params, (err, rows) => {
            if(err) {
                res.status(400).json({"error": err.message});
                return;
            }
            res.status(200).json({
                "message": "success",
                ...rows
            });
        });
    }
    else {
        // if no frequency values were given
        const sql = `SELECT skill_name, COUNT( DISTINCT user_id ) as "frequency" 
                    FROM skill GROUP By skill_name`;
        db.all(sql, [], (err, rows) => {
            if(err) {
                res.status(400).json({"error": err.message});
                return;
            }
            res.status(200).json({
                "message": "success",
                ...rows
            });
        });
    }
});


