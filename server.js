const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const saltRounds = 10;
const cors = require('cors');
const Knex = require('knex');
const knexConfig = require('./knexfile');
const session = require('express-session');
const KnexSessionStore = require('connect-session-knex')(session);
const { check, validationResult } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');
const { Model } = require('objection')
const morgan = require('morgan')


// Initialize knex.
const knex = Knex(knexConfig);

Model.knex(knex);

// used to store user sessions
const store = new KnexSessionStore({
    knex: knex,
});

const app = express();

// middleware
app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'))

// user sessions middleware
app.use(session({
    name: 'user_id',
    secret: 'changethisbeforedeploy',
    store: store,
    resave: false,
    saveUninitialized: false,
    unset: 'destroy'
}));

// serve HTML pages to client
app.use('/index.html', function (req, res) {
    res.redirect('/');
});
app.use('/course.html', function (req, res) {
    res.redirect('/course');
});
app.use('/account.html', function (req, res) {
    res.redirect('/account');
});
app.use(express.static('public'));
app.use('/', express.static('public/index.html'));
app.use('/course', express.static('public/course.html'));
app.use('/account', express.static('public/account.html'));

// API routes
app.get('/courses', function (req, res, next) {
    res.send('Courses API');
});
app.get('/accounts', function (req, res, next) {
    res.send('Accounts API');
});
app.post('/comments', function (req, res, next) {
    console.log(req.body);
    res.redirect('/course');
})
// route for handling 404 requests(unavailable routes)
app.use(function (req, res, next) {
    res.status(404).send('404 Page Not Found');
});

app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.status(500).send('Something broke!')
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> {
  console.log('Server running on port ' + PORT);
})
