var functionObject = {};


functionObject.isLoggedIn = function(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
};

functionObject.checkType = function(req, res, next) {
    if (req.user.type == "faculty") {
        return next();
    }
    res.redirect("/");
}


module.exports = functionObject;