const User = require('../models/User');
const validator = require('validator');

const displayRegister = data => async (req, res) => {
    if (!data) {
        data = {
            notification: null,
            user: null
        };
    }

    res.render('pages/register', data);
}

const handleRegister = (knex, bcrypt) => async (req, res) => {
    let { username, password, passwordConfirm } = req.body;

    // validation and sanitization
    if (validator.isEmpty(username) || validator.isEmpty(password) || validator.isEmpty(passwordConfirm)) {
        console.log('invalid form data');
        displayRegister({
            notification: {
                type: 'error',
                message: 'Error in registering user credentials. Username and/or password was missing.'
            },
            user: null
        })(req, res);
    }
    else if (!validator.isAlphanumeric(username)) {
        console.log('non alphanumeric username');
        displayRegister({
            notification: {
                type: 'error',
                message: 'Error registering user. Username must be alphanumeric characters only.'
            },
            user: null
        })(req, res);
    }
    else if (!validator.equals(password, passwordConfirm)) {
        console.log('password & password confirmation don\'t match');
        displayRegister({
            notification: {
                type: 'error',
                message: 'Error registering user. Password confirmation must match password.'
            },
            user: null
        })(req, res);
    }

    username = validator.trim(username);

    // check if username is unique
    const existingUser = await User
        .query()
        .where({
            username: username
        });
    if (existingUser.length !== 0) {
        console.log('user with same username already exists');
        displayRegister({
            notification: {
                type: 'error',
                message: 'Error registering user. Username already taken.'
            },
            user: null
        })(req, res);
    } else {
        console.log('ready to register');
        bcrypt.genSalt(10, function(err, salt) {
            if (err) {
                console.log('error generating salt: ', err);
                displayRegister({
                    notification: {
                        type: 'error',
                        message: 'Error registering user. Something went wrong on our end :('
                    },
                    user: null
                })(req, res);
            } else {
                bcrypt.hash(password, salt, function(err, hash) {
                    if (err) {
                        console.log('error hashing password: ', err);
                        displayRegister({
                            notification: {
                                type: 'error',
                                message: 'Error registering user. Something went wrong on our end :('
                            },
                            user: null
                        })(req, res);
                    } else {
                        console.log('inserting user');
                        knex('users').insert({ username: username, password: hash })
                            .then(newUser => {
                                console.log(newUser);
                                req.session.user = username;
                                req.session.notification = {
                                    type: 'success',
                                    message: 'Thanks for registering! Upload your transcript to filter search results by completed prerequisites!'
                                };
                                res.redirect('/account');
                            })
                            .catch(err => {
                                console.log('error inserting user into db: ', err);
                                displayRegister({
                                    notification: {
                                        type: 'error',
                                        message: 'Error registering user. Something went wrong on our end :('
                                    },
                                    user: null
                                })(req, res);
                            });
                    }
                });
            }
        });
    }
}

module.exports = {
    handleRegister: handleRegister,
    displayRegister: displayRegister
};
