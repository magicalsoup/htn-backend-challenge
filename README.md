# Hack The North Back-end Challenge

This REST API has the basic requirements and maybe more (time permitting)

Built using node and express.js, with sqlite3 as the database.


## Getting Started
After cloning the repo, you would need to run: 

```
npm install express
npm install sqlite3
npm install
```


## Scripts
Note that there are multiple script files:
- `database.js` - sets up the database
- `reset.js` - resets the database
- `init.js` - inserts the fake user data into the database
- `server.js` - handles API calls/the server

To start get the server working run the commands **IN THE EXACT ORDER BELOW**:

```
node database
node init.js
node server.js
```

Note that the command `node init.js` may take some time to run, wait for it to finish. 

Also, at any point, you can always run `node reset.js` to reset the database.

## Schema

The data is split into two tables (normalization). The chosen id specifier for users was simply an unique integer, or simply their index in the array.

user table:
```sql
CREATE TABLE user (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL, 
            email TEXT UNIQUE, 
            phone TEXT NOT NULL,
            company TEXT NOT NULL
```

skill table:
```sql
CREATE TABLE skill (
            user_id INTEGER NOT NULL, 
            skill_name TEXT NOT NULL,
            rating INTEGER NOT NULL,
            FOREIGN KEY(user_id) REFERENCES user(id)
```

TUser Data type:

```JSON
{
  "name": <string>,
  "company": <string>,
  "email": <string>,
  "phone": <string>,
  "skills": [
    {
      "skill": <string>,
      "rating": <int>
    }
  ]
}
```

TSkill Data type:
```JSON
{
    "name": <string>,
    "frequency": <int>
}
```

## API Endpoints

Below are the specifications for each of the endpoints.

### Users endpoints

To get all user data, the endpoint is at:

```
localhost:8000/api/users/
```

OR, make a request:

```
GET localhost:8000/api/users/
```


Which would return an array of `TUser`, matching the same format as in the fake user data file (user_data.json()).


To get a specific user, the endpoint is at

```
localhost:8000/api/users/?id=<user_id>
```

OR, make a request:

```
GET localhost:8000/api/users/?id=<user_id>
```

Where `<user_id>` is to be replaced by the id of the user (an integer).

This request will return a `TUser`.

### Updating User Data endpoint

To update a user, make a request:

```
PATCH localhost:8000/api/users/?id=<user_id>
```

With the following JSON body format:

```JSON
{
    "<key>": "<value>",
    ...
}
```

Where `<user_id>` is to be replaced with a valid integer representing the user id, and `<key>` and `<value>` are valid values as specified in the user format. E.g, `<key>` should be one of `["name", "company", "email", "phone", "skills"]`;

### Skills Endpoint

Making a request:

```
GET localhost:8000/api/skills/?min_frequency=<a>&max_frequency=<b>
```

Where `<a>` and `<b>` are to be replaced with integers specifiying the frequency range.

This request will retrieve and return an array of `TSkill` with all the skills with frequency (number of users with this skill) in the range `[<a>, <b>] (inclusive)`

Note that they are optional, i.e you can make a request without the min_frequency and max_frequency, and you will get an array of `TSkill` representing all the skills.

## Remarks

That is it for now, was a really fun project, and I learned a lot, especially from the debugging sessions.
There are comments in the code with details about improvements, possible modifications, and of course documentation.

I hate a new-found love-hate relationship with sqlite now.






