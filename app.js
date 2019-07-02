var express = require("express"),
    app = express(),
    nodemailer = require("nodemailer"),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    expressanitizer = require("express-sanitizer"),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    methodoverride = require("method-override"),
    passportlocalmongoose = require("passport-local-mongoose"),
    User = require("./models/user"),
    session = require("express-session");

var authRoutes = require("./routes/auth"),
    questionRoutes = require("./routes/question"),
    feedbackRoutes = require("./routes/feedback"),
    userRoutes = require("./routes/user");

// mongoose.connect("mongodb+srv://jaspreet:singh@cluster0-aw4yr.mongodb.net/Questionnaire?retryWrites=true&w=majority", { useNewUrlParser: true, useFindAndModify: false, useCreateIndex: true });

mongoose.connect("mongodb://localhost/Questionnaire", { useNewUrlParser: true, useFindAndModify: false, useCreateIndex: true });

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
app.use(function(req, res, next) {
    res.locals.currentuser = req.user;
    next();
})
// 
app.use(authRoutes);
app.use(questionRoutes);
app.use(feedbackRoutes);
app.use(userRoutes);
// LISTEN
app.listen(process.env.PORT, process.env.IP, function() {
    console.log("Questionnaire Portal Started");
})
