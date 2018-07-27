const auth = (req, res, next) => {
//    console.log(req.session);
//    console.log(req.session.user);
//    console.log(req.cookies.user_sid);
    if (req.session.user && req.cookies.user_sid) {
        return next();
    } else {
        return res.status(401).send('Must be logged in to access this page');
    }
};

module.exports = {
    auth: auth
}