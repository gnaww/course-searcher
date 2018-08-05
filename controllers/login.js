const User = require('../models/User');

const handleLogIn = (bcrypt) => async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        console.log('invalid form data');
        req.session.notification = { 
            type: 'error',
            message: 'Error in submitting user credentials.'
        };
        res.redirect('/');
    }
    
    const user = await User
        .query()
        .where({
            username: username
        }).select('username', 'password')
        .then(result => {
            if (result.length > 1) {
                console.log('multiple matching usernames found when logging in');
                req.session.notification = { 
                    type: 'error',
                    message: 'Error logging in. Something went wrong on our end :('
                };
                res.redirect('/');
                //return res.status(500).send('Something went wrong on our end :(');
            }
            bcrypt.compare(password, result[0].password, function(err, valid) {
                if (err) {
                    console.log('error comparing password hashes: ', err);
                    req.session.notification = { 
                        type: 'error',
                        message: 'Error logging in. Something went wrong on our end :('
                    };
                    res.redirect('/');
                    //return res.status(500).send('Something went wrong on our end :(');
                }
                // valid === true if hash matches
                if (valid) {
                    req.session.user = result[0].username;
                    req.session.notification = { 
                        type: 'success',
                        message: 'Successfully logged in!'
                    };
                    res.redirect('/');
                    //res.send('Successfully logged in');
                } else {
                    req.session.notification = { 
                        type: 'error',
                        message: 'Incorrect username and/or password.'
                    };
                    res.redirect('/');
                    //res.status(400).send('Incorrect user credentials');
                }
            });
        })
        .catch(err => {
            req.session.notification = { 
                type: 'error',
                message: 'Incorrect username and/or password.'
            };
            res.redirect('/');
            //res.status(400).send('Incorrect user credentials')
        });
}

module.exports = {
    handleLogIn: handleLogIn
}