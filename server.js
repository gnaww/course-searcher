const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const Knex = require('knex');
const knexConfig = require('./knexfile');
const session = require('express-session');
const KnexSessionStore = require('connect-session-knex')(session);
const { Model } = require('objection');
const morgan = require('morgan');
const pdfjsLib = require('pdfjs-dist');
const fileUpload = require('express-fileupload');
const favicon = require('serve-favicon')
const path = require('path')
const cron = require("node-cron");
const fs = require("fs");
const fetch = require('node-fetch');

// cron resources
const update = require('./cron/db_update');

// controllers for routes
const login = require('./controllers/login');
const register = require('./controllers/register');
const authenticate = require('./controllers/authenticate');
const account = require('./controllers/account');
const course = require('./controllers/course');
const index = require('./controllers/index');
const misc = require('./controllers/misc');

// Initialize knex.
// const environment = process.env.NODE_ENV || 'development';
// const knex = Knex(knexConfig[environment]);
const knex = Knex(knexConfig);

Model.knex(knex);

// used to store user sessions
const store = new KnexSessionStore({
    knex: knex,
});

const app = express();

// run update of courses immediately
console.log('running update:', new Date().toUTCString());
update.updateAllCoursesData();

// updates the openStatus in course table every 1-2 minutes
let updateCourses = cron.schedule('*/2 * * * *', () => {
    console.log('running update:', new Date().toUTCString());
    update.updateAllCoursesData();
});

updateCourses.start();

// EJS templating engine setup
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// middleware
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))
app.use(cors());
app.use(fileUpload());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('combined'));

// user sessions middleware
const COOKIE_SECRET = process.env.COOKIE_SECRET || 'changethisbeforedeploy';
app.use(session({
    name: 'user_sid',
    secret: COOKIE_SECRET,
    store: store,
    resave: false,
    saveUninitialized: false,
    unset: 'destroy',
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
}));

// routes
app.route('/')
    .get(index.displayHomepage(knex));

app.route('/course')
    .get(course.handleCourseGet)
    .post(course.handleCoursePost);

app.route('/account')
    .all(authenticate.auth)
    .get(account.displayAccount(knex, null))
    .post(account.handleAccount(knex, pdfjsLib));

app.route('/register')
    .get(register.displayRegister(null))
    .post(register.handleRegister(knex, bcrypt));

app.route('/news')
    .get(misc.displayNews(knex))
    .post(misc.handleNews(knex));

app.route('/suggestions')
    .get(misc.displaySuggestions(knex))
    .post(misc.handleSuggestions(knex));

app.post('/login', login.handleLogIn(bcrypt));

app.get('/logout', authenticate.auth, login.handleLogOut);

// route for handling 404 requests (unavailable routes)
app.use((req, res) => {
    if (req.session.user) {
        res.render('pages/error', { error: 404, user: req.session.user });
    } else {
        res.render('pages/error', { error: 404, user: null });
    }
});

// route for handling everything else that can go wrong
app.use((err, req, res) => {
    console.log('something really broke :(');
    console.error(err.stack);
    if (req.session.user) {
        res.render('pages/error', { error: 500, user: req.session.user });
    } else {
        res.render('pages/error', { error: 500, user: null });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> {
  console.log('Server running on port ' + PORT);
})
