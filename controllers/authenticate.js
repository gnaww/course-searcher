const auth = (req, res, next) => {
    console.log(req.session.user);
    if (req.session) {
        return next();
    } else {
        return res.status(401).send('Must be logged in to access this page');
    }
};

module.exports = {
    auth: auth
}