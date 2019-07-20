var express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    expressanitizer = require("express-sanitizer"),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    methodoverride = require("method-override"),
    flash = require("connect-flash"),
    compression = require("compression"),
    User = require("./models/user"),
    session = require("express-session");

var authRoutes = require("./routes/auth"),
    questionRoutes = require("./routes/question"),
    feedbackRoutes = require("./routes/feedback"),
    userRoutes = require("./routes/user");



mongoose.connect("mongodb+srv://jaspreet:singh@cluster0-aw4yr.mongodb.net/Kollect?retryWrites=true&w=majority", { useNewUrlParser: true, useFindAndModify: false, useCreateIndex: true, autoIndex: true });

// mongoose.connect("mongodb://localhost/Questionnaire", { useNewUrlParser: true, useFindAndModify: false, useCreateIndex: true });
app.use(flash());
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(methodoverride("_method"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressanitizer());
app.use(session({
    secret: "cats",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(compression())
app.use(function(req, res, next) {
    res.locals.currentuser = req.user;
    res.locals.toast = req.flash("toast");
    next();
})
// 
app.use(authRoutes);
app.use(questionRoutes);
app.use(feedbackRoutes);
app.use(userRoutes);

app.use(express.json());
// app.use(express.urlencoded());
// // app.use(express.multipart());
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// LISTEN
app.listen(process.env.PORT, process.env.IP, function() {
    console.log("Kollect Portal Started");
})

app.get('*', function(req, res) {
    //   res.send('what???', 404);
    // res.sendStatus(404)
    res.redirect("/")
});

app.use(function(req, res, next) {
    if (!req.secure) {
        return res.redirect("https://kollect-app-619.herokuapp.com/" + req.originalUrl);
    }
    next();
});
