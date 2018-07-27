const User = require('../models/User');

const handleLogIn = (bcrypt) => async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        console.log('invalid form data');
        return res.status(400).json('Invalid form data');
    }
    
    const user = await User
        .query()
        .where({
            username: username
        }).select('username', 'password')
        .then(result => {
            if (result.length > 1) {
                console.log('multiple matching usernames found when logging in');
                return res.status(500).send('Something went wrong on our end :(');
            }
            bcrypt.compare(password, result[0].password, function(err, valid) {
                if (err) {
                    console.log('error comparing password hashes: ', err);
                    return res.status(500).send('Something went wrong on our end :(');
                }
                // valid === true if hash matches
                if (valid) {
                    req.session.user = result[0].username;
                    console.log(req.session);
                    res.send('Successfully logged in');
                } else {
                    res.status(400).send('Incorrect user credentials');
                }
            });
        })
        .catch(err => res.status(400).send('Incorrect user credentials'));
}

module.exports = {
    handleLogIn: handleLogIn
}