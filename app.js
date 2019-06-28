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
    Question = require("./models/questionbank"),
    Answer = require("./models/answerbank"),
    User = require("./models/user"),
    session = require("express-session");

mongoose.connect("mongodb://localhost/Questionnaire", { useNewUrlParser: true, useFindAndModify: false, useCreateIndex: true });

// passport.use(new LocalStrategy(
//     function(username, password, done) {
//         User.findOne({ username: username }, function(err, user) {
//             if (err) { return done(err); }
//             if (!user) {
//                 return done(null, false, { message: 'Incorrect username.' });
//             }
//             if (!user.validPassword(password)) {
//                 return done(null, false, { message: 'Incorrect password.' });
//             }
//             return done(null, user);
//         });
//     }
// ));

// MIDDLEWARE
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

function checkType(req, res, next) {
    if (req.user.type == "faculty") {
        return next();
    }
    res.redirect("/");
}

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


app.get("/", function(req, res) {
    res.redirect("/index");
})
// HOMEPAGE
app.get("/index", function(req, res) {
    Question.find({}, function(err, qns) {
        if (err) {
            console.log(err);
        }
        else {
            res.render("index", { qns: qns, pageTitle: "Homepage" })
        }
    })
})
// SECRET
app.get("/secret", isLoggedIn, function(req, res) {
    res.render("secret");
})
// REGISTER
app.get("/register", function(req, res) {
    res.render("register", { pageTitle: "Complete Your Registration" })
});

app.post("/register", function(req, res) {
    User.register(new User({
            username: req.body.username,
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            gender: req.body.gender,
            type: req.body.type,
            registrationno: req.body.registrationno
        }),
        req.body.password,
        function(err, newUser) {
            if (err) {
                console.log("here")
                console.log(err);
                res.redirect("/register");
            }
            else {
                console.log(newUser);

                // passport.authenticate("local")(req, res, function() {
                //     res.redirect("/login");
                // })
                res.redirect("/login");
            }
        })
});
// LOGIN
app.get("/login", function(req, res) {
    res.render("login", { pageTitle: "Login Page" });
});

app.post('/login',
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login'
    }),
    function(req, res) {}
);
// LOGOUT
app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

// NEW QUESTION
var count = false;
app.get("/new", isLoggedIn, function(req, res) {
    res.render("new", { count: count, pageTitle: "Creation Page" });
})

app.post("/count", function(req, res) {
    count = req.body.count;
    res.render("new", { count: count, pageTitle: "Creation Page" })
})

app.post("/new", function(req, res) {
    // req.body.Question.body = req.sanitize(req.body.Question.body);
    Question.create(req.body, function(err, submitqn) {
        if (err) {
            console.log(err)
        }
        else {
            submitqn.userid.id = req.user._id;
            submitqn.userid.name = req.user.name;
            submitqn.save();
            count = false;
            res.redirect("/");
        }
    })
})

app.get("/student/:id",function(req, res) {
    Question.find({},function(err, foundqn) {
        if(err){
            console.log(err)
        }else{
            res.render("user",{foundqn:foundqn,pageTitle:req.user.username+"@"+req.user.registrationno})
        }
    })
})
app.post("/display/:id/feedback", function(req, res) {
    Answer.create(req.body, function(err, submitan) {
        if (err) {
            console.log(err);
        }
        else {
            Question.findById(req.params.id, function(err, submitqn) {
                if (err) {
                    console.log(err)
                }
                else {
                    submitan.questionid.id = submitqn._id;
                    submitan.registrationno = req.user.registrationno;
                    submitan.save();
                    submitqn.answer.push(submitan);
                    console.log(submitan)
                    submitqn.save(function(err, save) {
                        if (err) {
                            console.log(err);
                        }
                        else {
                            console.log(save);
                            console.log("////////////")
                            console.log(submitan)
                            res.redirect("/")
                        }
                    })
                    
                }
            })
        }
    })
})

app.get("/display/:id", function(req, res) {
        Question.findById(req.params.id).populate("answer").exec(function(err, foundset) {
            if (err) {
                console.log(err)
            }
            else {
                res.render("display", { foundset: foundset, pageTitle: foundset.name })
            }
        })
    }

);

app.get("/display/:id/edit", isLoggedIn, checkType, function(req, res) {
    Question.findById(req.params.id, function(err, foundset) {
        if (err) {
            console.log(err);
        }
        else {
            res.render("edit", { foundset: foundset, pageTitle: "Edit " + foundset.name })
        }
    })
})
// UPDATE
app.put("/display/:id", function(req, res) {
    req.body.Question.body = req.sanitize(req.body.Question.body);
    Question.findByIdAndUpdate(req.params.id, req.body.Question, function(err, foundset) {
        if (err) {
            console.log(err);
        }
        else {
            res.redirect("/display/" + req.params.id)
        }
    })
})
// DESTROY
app.delete("/display/:id", function(req, res) {
    console.log(req.params.id)
    Question.findByIdAndRemove(req.params.id, function(err) {
        if (err) {
            console.log(err);
        }
        else {
            res.redirect("/")
        }
    })
})


// ANSWER

app.get("/display/:id/feedback", function(req, res) {
    Question.findById(req.params.id, function(err, foundset) {
        if (err) {
            console.log(err)
        }
        else {
            res.render("feedback", { foundset: foundset, pageTitle: "FEED" })
        }
    })
})


// LISTEN
app.listen(process.env.PORT, process.env.IP, function() {
    console.log("Questionnaire Portal Started");
})
