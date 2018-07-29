const User = require('../models/User');
const validator = require('validator');

const handleRegister = (bcrypt) => async (req, res) => {
    console.log('handle register');
    const { username, password, passwordConfirm } = req.body;

    // validation and sanitization
    if (!username || !password || !passwordConfirm) {
        console.log('invalid form data');
        req.session.notification = {
            type: 'error',
            message: 'Error in submitted user credentials. Something was missing.'
        };
        res.redirect('/');
    }
    if (!validator.isAlphanumeric(username)) {
        console.log('non alphanumeric username');
        req.session.notification = {
            type: 'error',
            message: 'Error registering user. Username must be alphanumeric characters only.'
        }
        res.redirect('/');
    }
    if (!validator.equals(password, passwordConfirm)) {
        console.log('password & password confirmation don\'t match');
        req.session.notification = {
            type: 'error',
            message: 'Error registering user. Password confirmation must match password.'
        }
        res.redirect('/');
    }

    const hash = bcrypt.hashSync(password);
    db.transaction(trx => {
        trx.insert({
            hash: hash,
            email: email
        })
        .into('login')
        .returning('email')
        .then(loginEmail => {
            return trx('users')
            .returning('*')
            .insert({
                email: loginEmail[0],
                name: name,
                joined: new Date()
            })
            .then(user => {
                res.json(user[0]);
            })
        })
        .then(trx.commit)
        .catch(trx.rollback)
    })
    .catch(err => res.status(400).json('unable to register'))
}

module.exports = {
    handleRegister: handleRegister
};
