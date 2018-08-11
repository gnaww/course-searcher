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

// Initialize knex.
const knex = Knex(knexConfig);

Model.knex(knex);

// used to store user sessions
const store = new KnexSessionStore({
    knex: knex,
});

const app = express();

// runs the database update at the start of the server
update.updateAllCoursesData();

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
app.use(morgan('dev'));

// user sessions middleware
app.use(session({
    name: 'user_sid',
    secret: 'changethisbeforedeploy',
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

// updates the openStatus in course table every 1-2 minutes
cron.schedule('*/2 * * * *', () => {
    console.log('update_db.js every two minutes');
    update.updateAllCoursesData();
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> {
  console.log('Server running on port ' + PORT);
})
