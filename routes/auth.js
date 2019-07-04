var express = require("express"),
    router = express.Router(),
    User = require("../models/user"),
    Question = require("../models/questionbank"),
    passport = require('passport'),
    multer = require('multer'),
    fs = require("fs"),
    flash = require("connect-flash"),
    nodemailer = require("nodemailer"),
    upload = multer({ dest: 'uploads/' }),
    middleware = require("../middleware/functions");

// var auth = {
//     type: 'oauth2',
//     user: 'jaspreet.master7@gmail.com',
//     clientId: '712663126293-15pnbgef1227bnr9lg62vponp8np5cj1.apps.googleusercontent.com',
//     clientSecret: 'dWi73rRCVIlqor4wXGFVxxNA',
//     refreshToken: '1/qaWUdsIDYS8DvlToXGNas2t4TynHNtzHiR6mY65XwqPnQbaia1doJb72TcvU7ZmZ',
// };

router.get("/", function(req, res) {
    res.render("cover", { pageTitle: "Questionnaire" });
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
            // req.flash("success","Welcome")
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
    if (req.body.password === req.body.passwordconfirm) {
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
                    req.flash("success", "Registration Complete.")
                    res.redirect("/login");
                }
            })
    }
    else {
        req.flash("error", "Check Your Password");
        res.redirect("/facultyregister")
    }
});

// STUDENT REGISTER
router.post("/studentregister", upload.single('avatar'), function(req, res) {
    if (req.body.password === req.body.passwordconfirm) {

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
                    // var mailOptions = {
                    //     from: req.body.name,
                    //     to: req.body.email,
                    //     subject: "REGISTRATION COMPLETE @ QUESTIONNAIRE",
                    //     // text: req.body.message,
                    //     // html: 'Message from: ' + req.body.name + '<br></br> Email: ' + req.body.email + '<br></br> Message: ' + req.body.message,
                    // };
                    // var transporter = nodemailer.createTransport({
                    //     service: 'gmail',
                    //     auth: auth,
                    // });
                    // transporter.sendMail(mailOptions, (err, res) => {
                    //     if (err) {
                    //         return console.log(err);
                    //     }
                    //     else {
                    //         console.log(JSON.stringify(res));
                    //     }
                    // });
                    req.flash("success", "Registration Complete.")
                    res.redirect("/login");
                }
            })
    }
    else {
        req.flash("error", "Check Your Password");
        res.redirect("/studentregister")
    }
});

// LOGIN
router.get("/login", function(req, res) {
    // req.flash("error", "Back To Login Page.")
    res.render("login", {
        pageTitle: "Login Page"
    });
});

router.post('/login',
    passport.authenticate('local', {
        successRedirect: '/index',
        failureRedirect: '/login',
        failureFlash: true,
        successFlash: true
    }),
    function(req, res) {}
);

// LOGOUT
router.get('/logout', function(req, res) {
    req.logout();
    req.flash("success", "Logged You Out.")
    res.redirect('/');
});

module.exports = router;
