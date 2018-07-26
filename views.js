const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan')

const app = express();

// middleware
app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'))

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


// route for handling 404 requests(unavailable routes)
app.use(function (req, res, next) {
    res.status(404).send('404 Page Not Found');
});

app.use(function (err, req, res) {
    console.error(err.stack)
    res.status(500).send('Something broke!')
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, ()=> {
  console.log('Views server running on port ' + PORT);
})
