const User = require('../models/User');

const handleLogIn = bcrypt => async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        console.log('invalid form data');
        req.session.notification = {
            type: 'error',
            message: 'Error in submitting user credentials. Username and/or password was missing.'
        };
        res.redirect('back');
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
                res.redirect('back');
            }
            bcrypt.compare(password, result[0].password, function(err, valid) {
                if (err) {
                    console.log('error comparing password hashes: ', err);
                    req.session.notification = {
                        type: 'error',
                        message: 'Error logging in. Something went wrong on our end :('
                    };
                    res.redirect('back');
                }

                // valid === true if hash matches
                if (valid) {
                    req.session.user = result[0].username;
                    req.session.notification = {
                        type: 'success',
                        message: 'Successfully logged in!'
                    };
                    res.redirect('back');
                } else {
                    req.session.notification = {
                        type: 'error',
                        message: 'Error logging in. Incorrect username and/or password.'
                    };
                    res.redirect('back');
                }
            });
        })
        .catch(err => {
            req.session.notification = {
                type: 'error',
                message: 'Error logging in. Incorrect username and/or password.'
            };
            res.redirect('back');
        });
}

const handleLogOut = (req, res) => {
    req.session.destroy(function (err) {
        if (err) {
            console.log('error logging out: ', err);
            req.session.notification = {
                type: 'error',
                message: 'Error logging out. Something went wrong on our end :('
            };
            res.redirect('back');
        } else {
            const backURL = req.header('Referer') || '/';
            if (backURL.includes('account')) {
                res.redirect('/');
            } else {
                res.redirect('back');
            }
        }
    });
}

module.exports = {
    handleLogIn: handleLogIn,
    handleLogOut: handleLogOut
}
