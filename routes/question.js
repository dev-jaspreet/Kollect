var express = require("express"),
    router = express.Router(),
    User = require("../models/user"),
    Question = require("../models/questionbank"),
    Answer = require("../models/answerbank"),
    middleware = require("../middleware/functions");
var qnid;


// NEW QUESTION
router.get("/new", middleware.isLoggedIn, function(req, res) {
    res.render("new", { count: false, filter: false, pageTitle: "Selection: Creation Page" });
});

router.post("/filter", function(req, res) {
    qnid = req.body.department + req.body.section + req.body.year;
    res.render("new", { count: false, filter: true, pageTitle: "Count: Creation Page" });
});

router.post("/count", function(req, res) {
    res.render("new", { count: req.body.count, filter: true, pageTitle: "Questions: Creation Page" });
});

router.post("/new", function(req, res) {
    // req.body.Question.body = req.sanitize(req.body.Question.body);
    Question.create(req.body, function(err, submitqn) {
        if (err) {
            console.log(err);
        }
        else {
            submitqn.creator = req.user._id;
            submitqn.uniqueid = qnid;
            submitqn.save();
            User.find({ type: "student", uniqueid: submitqn.uniqueid }, function(err, foundstudent) {
                if (err) {
                    console.log(err);
                }
                else {
                    for (var i = 0; i < foundstudent.length; i++) {
                        foundstudent[i].questionpending.push(submitqn);
                        foundstudent[i].save();
                    }
                }
            });
            User.findById(req.user.id, function(err, founduser) {
                if (err) {
                    console.log(err);
                }
                else {
                    founduser.questioncreator.push(submitqn);
                    founduser.save();
                    req.flash("success", "Question Set: " + submitqn.name + "Has Been Created.")
                    res.redirect("/index");
                }
            });
        }
    });
});

router.get("/display/:id/edit", middleware.isLoggedIn, middleware.checkType, function(req, res) {
    Question.findById(req.params.id, function(err, foundset) {
        if (err) {
            console.log(err);
        }
        else {
            res.render("edit", { foundset: foundset, pageTitle: "Edit " + foundset.name });
        }
    });
});

// UPDATE
router.put("/display/:id", function(req, res) {
    req.body.Question.body = req.sanitize(req.body.Question.body);
    Question.findByIdAndUpdate(req.params.id, req.body.Question, function(err, foundset) {
        if (err) {
            console.log(err);
        }
        else {
            res.redirect("/display/" + req.params.id);
        }
    });
});

// DESTROY
router.delete("/display/:id", function(req, res) {
    Question.findByIdAndRemove(req.params.id, function(err) {
        if (err) {
            console.log(err);
        }
        else {
            User.find({ type: "student" }, function(err, foundusers) {
                if (err) {
                    console.log(err);
                }
                else {
                    for (var i = 0; i < foundusers.length; i++) {
                        foundusers[i].questionpending.remove(req.params.id);
                        foundusers[i].questionresponse.remove(req.params.id);
                        foundusers[i].save();
                    }
                }
            });
            User.findById(req.user.id, function(err, founduser) {
                if (err) {
                    console.log(err)
                }
                else {
                    founduser.questioncreator.remove(req.params.id);
                    founduser.save();
                }
            })
            req.flash("success", "Deleted")
            res.redirect("/index");
        }
    });

});
//DISPLAY
router.get("/display/:id", middleware.isLoggedIn, function(req, res) {
    Question.findById(req.params.id).populate("answer").populate("creator").exec(function(err, foundset) {
        if (err) {
            console.log(err);
        }
        else {
            User.find({ uniqueid: foundset.uniqueid }, function(err, foundusers) {
                if (err) {
                    console.log(err);
                }
                else {
                    res.render("display", { foundusers: foundusers, foundset: foundset, pageTitle: foundset.name });
                }
            });
        }
    });
});

module.exports = router;
