const auth = (req, res, next) => {
    if (req.session.user) {
        return next();
    } else {
        req.session.notification = { 
            type: 'error',
            message: 'Error authenticating. Must be logged in.'
        };
        res.redirect('/');
    }
};

module.exports = {
    auth: auth
}