var express = require("express"),
    router = express.Router(),
    User = require("../models/user"),
    Question = require("../models/questionbank"),
    passport = require('passport'),
    multer = require('multer'),
    cloudinary = require("cloudinary"),
    cloudinaryStorage = require("multer-storage-cloudinary"),
    middleware = require("../middleware/functions");

cloudinary.config({
    cloud_name: 'dq1nhsxii',
    api_key: '398993397148792',
    api_secret: 'kWUG7-H3SRCO3kSkgbK7BS-ForU'
});

const storage = cloudinaryStorage({ cloudinary: cloudinary, folder: "Questionnaire_profile", allowedFormats: ["jpg", "png"], transformation: [{ width: 500, height: 500, crop: "limit" }] });
const parser = multer({ storage: storage });

router.get("/", function(req, res) {
    res.render("cover", { pageTitle: "Kollect" });
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
                                for (var i = 0; i < foundset.length; i++) {
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

router.get("/search", function(req, res) {
    var code = JSON.stringify(req.query);
    code = code.replace(/[^a-zA-Z0-9]/g, "");
    code = code.substr(6)
    Question.find({ uniqueid: { $regex: code, $options: 'i' } }).populate("creator").exec(function(err, sorted) {
        if (err) {
            console.log(err)
        }
        else {
            if (sorted.length) {
                res.render("index", { qns: sorted, pageTitle: "Homepage" })
            }
            else {
                req.flash("toast","Query String Did Not Match")
                res.redirect("/index")
            }
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
router.post("/facultyregister", parser.single("image"), function(req, res) {
    var username = (req.body.fname + "@" + req.body.registrationno).toUpperCase();
    username = username.replace(/[^a-zA-Z0-9@]/g, "");
    if (req.body.password === req.body.passwordconfirm) {
        User.register(new User({
                username: username,
                name: req.body.fname + " " + req.body.mname + " " + req.body.lname,
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
                    if (req.file) {
                        newUser.image.imageurl = req.file.secure_url;
                        newUser.image.imageid = req.file.public_id;
                    }
                    else {
                        newUser.image.imageurl = "https://banner2.kisspng.com/20180521/ocp/kisspng-computer-icons-user-profile-avatar-french-people-5b0365e4f1ce65.9760504415269493489905.jpg";
                        newUser.image.imageid = "##";
                    }
                    newUser.save();
                    middleware.mail(newUser)
                    req.flash("toast", "Registration Complete.")
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
router.post("/studentregister", parser.single("image"), function(req, res) {
    var username = (req.body.fname + "@" + req.body.registrationno).toUpperCase();
    username = username.replace(/[^a-zA-Z0-9@]/g, "");
    console.log(username);
    if (req.body.password === req.body.passwordconfirm) {
        User.register(new User({
                username: username,
                name: req.body.fname + " " + req.body.mname + " " + req.body.lname,
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
                    if (req.file) {
                        newUser.image.imageurl = req.file.secure_url;
                        newUser.image.imageid = req.file.public_id;
                    }
                    else {
                        newUser.image.imageurl = "https://banner2.kisspng.com/20180521/ocp/kisspng-computer-icons-user-profile-avatar-french-people-5b0365e4f1ce65.9760504415269493489905.jpg";
                        newUser.image.imageid = "##";
                    }
                    newUser.save();
                    console.log(newUser)
                    middleware.mail(newUser)
                    req.flash("toast", "Registration Complete.")
                    res.redirect("/login");
                }
            })
    }
    else {
        req.flash("toast", "Check Your Password");
        res.redirect("/studentregister")
    }
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
    req.flash("toast", "Logged You Out.")
    res.redirect('/');
});

module.exports = router;
