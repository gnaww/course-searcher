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

// EJS templating engine setup
app.use(express.static(__dirname + '/public'));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// middleware
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
        maxAge: 3600000 // 1 hour
    }
}));

// routes
app.route('/')
    .get(index.displayHomepage)
    .post(function (req, res) {
        res.send('searching for classes')
    });

app.route('/course')
    .get(function (req, res) {
        console.log(req.query)
        res.render('pages/course', { user: null, notification: null });
    })
    .post(function (req, res) {
        res.send('posting a new comment')
    });

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
app.use(function (req, res) {
    res.status(404).send('404 Page Not Found');
});

// route for handling everything else that can go wrong
app.use(function (err, req, res) {
    console.error(err.stack)
    res.status(500).send('Invalid API route or something broke :(');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> {
  console.log('Server running on port ' + PORT);
})
