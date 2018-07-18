const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const Knex = require('knex');
var session = require('express-session');
const KnexSessionStore = require('connect-session-knex')(session);
const { check, validationResult } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');


// connect to postgres db
const knex = Knex({
    client: 'pg',
    connection: {
        host: '127.0.0.1',
        user: 'postgres',
        password: '',
        database: 'course-planner'
    }
});

const store = new KnexSessionStore({
    knex: knex,
});


const app = express();

// middleware
app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    name: 'user_id',
    secret: 'changethisbeforedeploy',
    store: store,
    resave: false,
    saveUninitialized: false,
    unset: 'destroy'
}));


// route for handling 404 requests(unavailable routes)
app.use(function (req, res, next) {
  res.status(404).send("404 Page Not Found")
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> {
  console.log('Server running on port ' + PORT);
})
