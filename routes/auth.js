var express = require("express"),
    router = express.Router(),
    User = require("../models/user"),
    Question = require("../models/questionbank"),
    passport = require('passport'),
    multer = require('multer'),
    fs = require("fs"),
    upload = multer({ dest: 'uploads/' }),
    middleware = require("../middleware/functions");


router.get("/", function(req, res) {
    res.render("cover",{pageTitle:"Questionnaire"});
})

// HOMEPAGE
router.get("/index", middleware.isLoggedIn, function(req, res) {
    Question.find({}).populate("creator").exec(function(err, qns) {
        if (err) {
            console.log(err);
        }
        else {
            User.findById(req.user.id, function(err, founduser) {
                if (err) {
                    console.log(err)
                }
                else {
                    if (!founduser.questionresponse.length && !founduser.questionpending.length && founduser.type == "student") {
                        Question.find({ uniqueid: founduser.uniqueid }, function(err, foundset) {
                            if (err) {
                                console.log(err)
                            }
                            else {
                                console.log(foundset)
                                for (var i = 0; i < foundset.length; i++) {
                                    console.log("$$$$")
                                    founduser.questionpending.push(foundset[i])
                                }
                                founduser.save()
                            }
                        })
                    }
                }
            })
            res.render("index", { qns: qns, pageTitle: "Homepage" })
        }
    })
})
// REGISTER
router.get("/studentregister", function(req, res) {
    res.render("studentregister", {
        pageTitle: "Complete Your Registration"
    })
});

router.get("/facultyregister", function(req, res) {
    res.render("facultyregister", {
        pageTitle: "Complete Your Registration"
    })
});

// FACULTY REGISTER
router.post("/facultyregister", function(req, res) {
    User.register(new User({
            username: req.body.username,
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            gender: req.body.gender,
            type: "faculty",
            registrationno: req.body.registrationno,
            uniqueid: undefined
        }),
        req.body.password,
        function(err, newUser) {
            if (err) {
                console.log(err);
                res.redirect("/facultyregister");
            }
            else {
                console.log(newUser);
                res.redirect("/login");
            }
        })
});

// STUDENT REGISTER
router.post("/studentregister", upload.single('avatar'), function(req, res) {
    User.register(new User({
            username: req.body.username,
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            gender: req.body.gender,
            type: "student",
            registrationno: req.body.registrationno,
            uniqueid: req.body.department + req.body.section + req.body.year
        }),
        req.body.password,
        function(err, newUser) {
            if (err) {
                console.log(err);
                res.redirect("/studentregister");
            }
            else {
                res.redirect("/login");
            }
        })
});

// LOGIN
router.get("/login", function(req, res) {
    res.render("login", {
        pageTitle: "Login Page"
    });
});

router.post('/login',
    passport.authenticate('local', {
        successRedirect: '/index',
        failureRedirect: '/login'
    }),
    function(req, res) {}
);

// LOGOUT
router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

module.exports = router;
