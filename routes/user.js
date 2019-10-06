var express = require("express"),
    router = express.Router(),
    multer = require('multer'),
    cloudinary = require("cloudinary"),
    cloudinaryStorage = require("multer-storage-cloudinary"),
    User = require("../models/user"),
    middleware = require("../middleware/functions");

cloudinary.config({
    cloud_name: 'dq1nhsxii',
    api_key: '398993397148792',
    api_secret: 'kWUG7-H3SRCO3kSkgbK7BS-ForU'
});

const storage = cloudinaryStorage({ cloudinary: cloudinary, folder: "Questionnaire_profile", allowedFormats: ["jpg", "png"], aspect_ratio: "1:1", transformation: ["media_lib_thumb"], width: 500, height: 500, crop: "scale" });
const parser = multer({ storage: storage });

router.get("/student/:id", middleware.isLoggedIn, function(req, res) {
    User.findById(req.params.id).populate("questionresponse").populate("answer").populate("questionpending").exec(function(err, founduser) {
        if (err) {
            console.log(err)
        }
        else {
            if (founduser._id.equals(req.user.id)) {
                founduser.save()
                res.render("student", { founduser: founduser, pageTitle: req.user.username })
            }
            else {
                res.redirect("/")
            }
        }
    })
})
router.get("/faculty/:id", middleware.isLoggedIn, middleware.checkType, function(req, res) {
    User.findById(req.params.id).populate("questioncreator").exec(function(err, founduser) {
        if (err) {
            console.log(err)
        }
        else {
            if (founduser._id.equals(req.user.id)) {
                res.render("faculty", { founduser: founduser, pageTitle: req.user.name + "@" + req.user.registrationno })
            }
            else {
                res.redirect("/")
            }
        }
    })
})
router.get("/facultyedit/:id", middleware.isLoggedIn, middleware.checkType, function(req, res) {
    User.findById(req.params.id, function(err, founduser) {
        if (err) {
            console.log(err)
        }
        else {
            if (founduser._id.equals(req.user.id)) {
                res.render("facultyedit", { founduser: founduser, pageTitle: "Edit Profile" })
            }
            else {
                res.redirect("/")
            }
        }
    })
})
router.put("/facultyedit/:id", parser.single("image"), middleware.isLoggedIn, function(req, res) {
    User.findByIdAndUpdate(req.params.id, req.body.User, function(err, founduser) {
        if (err) {
            console.log(err)
        }
        else {
            if (req.file) {
                cloudinary.v2.api.delete_resources(founduser.image.imageid,
                    function(error, result) { console.log(result); });
                founduser.image.imageurl = req.file.secure_url;
                founduser.image.imageid = req.file.public_id;
                founduser.save();
            }
            req.flash("toast", "Profile Changed")
            res.redirect("/faculty/" + req.params.id)
        }
    })
})
router.get("/studentedit/:id", middleware.isLoggedIn, function(req, res) {
    User.findById(req.params.id, function(err, founduser) {
        if (err) {
            console.log(err)
        }
        else {
            if (founduser._id.equals(req.user.id)) {
                res.render("studentedit", { founduser: founduser, pageTitle: "Edit Profile" })
            }
            else {
                res.redirect("/")
            }
        }
    })
})
router.put("/studentedit/:id", parser.single("image"), middleware.isLoggedIn, function(req, res) {
    User.findByIdAndUpdate(req.params.id, req.body.User, function(err, founduser) {
        if (err) {
            console.log(err)
        }
        else {
            if (req.file) {
                cloudinary.v2.api.delete_resources(founduser.image.imageid,
                    function(error, result) { console.log(result); });
                founduser.image.imageurl = req.file.secure_url;
                founduser.image.imageid = req.file.public_id;
            }
            founduser.uniqueid = req.body.department + req.body.section + req.body.year;
            founduser.save()
            req.flash("toast", "Profile Changed")
            res.redirect("/student/" + req.params.id)
        }
    })
})

router.get("/searchstudent", middleware.isLoggedIn, function(req, res) {
    var code = JSON.stringify(req.query);
    code = code.replace(/[^a-zA-Z0-9]/g, "");
    code = code.substr(6)
    User.find({ type: "student", $text: { $search: code } }, function(err, foundusers) {
        if (err) {
            console.log(err)
        }
        else {
            if (foundusers.length) {
                res.render("searchresults", { pageTitle: "Search Results", foundusers: foundusers })
            }
            else {
                res.redirect("/faculty/" + req.user.id)
            }
        }
    })
})

router.get("/exportclass", middleware.isLoggedIn, function(req, res) {
    var code = JSON.stringify(req.query);
    code = code.replace(/[^a-zA-Z0-9]/g, "");
    code = code.substr(6)
    console.log(code)
    User.find({ type: "student", $text: { $search: code } }, function(err, foundusers) {
        if (err) {
            console.log(err)
        }
        else {
            if (foundusers.length) {
                console.log(foundusers)
                middleware.exportclass(foundusers, code)
                res.download("csvs/" + (code.toUpperCase() + "_" + "CLASSLIST" + ".xlsx"))
            }
            else {
                req.flash("toast", "Invalid Query Entered")
                res.redirect("/faculty/" + req.user.id)
            }
        }
    })
})

module.exports = router;
