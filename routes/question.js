var express = require("express"),
    router = express.Router(),
    fs = require("fs"),
    User = require("../models/user"),
    Question = require("../models/questionbank"),
    Answer = require("../models/answerbank"),
    middleware = require("../middleware/functions");

var qnid;
// NEW QUESTION
router.get("/new/private", middleware.isLoggedIn, middleware.checkType, function(req, res) {
    res.render("new", { count: -1, filter: false, pageTitle: "Selection: Creation Page" });
});

router.post("/new/private/filter", middleware.isLoggedIn, middleware.checkType, function(req, res) {
    qnid = req.body.department + req.body.section + req.body.year;
    res.render("new", { count: -1, filter: true, pageTitle: "Count: Creation Page", qnid: qnid });
});

router.post("/new/private/count", middleware.isLoggedIn, middleware.checkType, function(req, res) {
    var count = 0;
    if (req.body.count) {
        count = req.body.count
    }
    res.render("new", { count: count, filter: true, pageTitle: "Questions: Creation Page" });
});

router.post("/new/private", middleware.isLoggedIn, middleware.checkType, function(req, res) {
    // req.body.Question.body = req.sanitize(req.body.Question.body);
    var key = (req.body.action).split(",");
    Question.create(req.body, function(err, submitqn) {
        if (err) {
            console.log(err);
        }
        else {
            submitqn.key = key;
            submitqn.complete = false;
            submitqn.creator = req.user._id;
            submitqn.uniqueid = qnid;
            submitqn.save();
            User.find({ type: "student", uniqueid: submitqn.uniqueid }, function(err, foundstudent) {
                if (err) {
                    console.log(err);
                }
                else {
                    var emailarray = [];
                    for (var i = 0; i < foundstudent.length; i++) {
                        foundstudent[i].questionpending.push(submitqn);
                        foundstudent[i].save();
                        emailarray.push(foundstudent[i].email)
                    }
                    middleware.bulkmail(submitqn, emailarray)
                }
            });
            User.findById(req.user.id, function(err, founduser) {
                if (err) {
                    console.log(err);
                }
                else {
                    founduser.questioncreator.push(submitqn);
                    founduser.save();
                    req.flash("toast", "[PRIVATE] Question Set: " + submitqn.name + " Has Been Created.")
                    res.redirect("/index");
                }
            });
        }
    });
});

//PUBLIC FORM
router.get("/new/public", middleware.isLoggedIn, middleware.checkType, function(req, res) {
    res.render("publicform", { count: -1, pageTitle: "Questions: Creation Page" })
})

router.post("/new/public/publiccount", middleware.isLoggedIn, middleware.checkType, function(req, res) {
    var count = 0;
    if (req.body.count) {
        count = req.body.count
    }
    res.render("publicform", { count: count, pageTitle: "Questions: Creation Page" });
});

router.post("/new/public", middleware.isLoggedIn, middleware.checkType, function(req, res) {
    // req.body.Question.body = req.sanitize(req.body.Question.body);
    var key = (req.body.action).split(",");
    Question.create(req.body, function(err, submitqn) {
        if (err) {
            console.log(err);
        }
        else {
            Answer.create({ questionid: submitqn.id }, function(err, created) {
                if (err) {
                    console.log(err);
                }
                else {
                    console.log("Public Answer File Created");
                    submitqn.key = key;
                    submitqn.complete = true;
                    submitqn.creator = req.user._id;
                    submitqn.uniqueid = "public";
                    submitqn.answer.push(created)
                    submitqn.save();
                }
            });

            User.findById(req.user.id, function(err, founduser) {
                if (err) {
                    console.log(err);
                }
                else {
                    founduser.questioncreator.push(submitqn);
                    founduser.save();
                    req.flash("toast", "[PUBLIC] Question Set: " + submitqn.name + " Has Been Created.")
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
            if (foundset.creator.equals(req.user._id)) {
                res.render("edit", { foundset: foundset, pageTitle: "Edit " + foundset.name });
            }
            else {
                res.redirect("/faculty/" + req.user.id)
            }
        }
    });
});

// UPDATE
router.put("/display/:id", middleware.isLoggedIn, middleware.checkType, function(req, res) {
    req.body.Question.body = req.sanitize(req.body.Question.body);
    Question.findByIdAndUpdate(req.params.id, req.body.Question, function(err, foundset) {
        if (err) {
            console.log(err);
        }
        else {
            req.flash("toast", "Edited " + foundset.name)
            res.redirect("/display/" + req.params.id);
        }
    });
});

//DISPLAY
router.get("/display/:id", middleware.isLoggedIn, middleware.checkType, function(req, res) {
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
                    if (foundset.creator.equals(req.user._id)) {
                        middleware.submitted(foundset);
                        if (foundset.uniqueid != "public") {
                            middleware.pending(foundusers, foundset)
                        }
                    }
                    res.render("display", { foundusers: foundusers, foundset: foundset, pageTitle: foundset.name });
                }
            });
        }
    });
});

//DOWNLOAD FILE
router.get("/download/:name", function(req, res) {
    res.download("csvs/" + req.params.name)
})

//LOCK AND UNLOCK   
router.get("/lockunlock/:id/lock", middleware.isLoggedIn, function(req, res) {
    Question.findById(req.params.id, function(err, foundqn) {
        if (err) {
            console.log(err)
        }
        else {
            if (!foundqn.complete) {
                foundqn.complete = true;
                foundqn.save();
                req.flash("toast", foundqn.name + " :LOCKED")
                res.redirect("/display/" + foundqn.id)
            }
            else {
                req.flash("toast", " Already Locked")
                res.redirect("/display/" + foundqn.id)
            }
        }
    })
})
router.get("/lockunlock/:id/unlock", middleware.isLoggedIn, function(req, res) {
    Question.findById(req.params.id, function(err, foundqn) {
        if (err) {
            console.log(err)
        }
        else {
            if (foundqn.complete) {
                foundqn.complete = false;
                foundqn.save();
                req.flash("toast", foundqn.name + " :UNLOCKED")
                res.redirect("/display/" + foundqn.id)
            }
            else {
                req.flash("toast", " Already Unlocked")
                res.redirect("/display/" + foundqn.id)
            }
        }
    })
})
// NEW DESTROY
router.delete("/display/:id", middleware.isLoggedIn, function(req, res) {
    var path;
    Question.findById(req.params.id, function(err, foundqn) {
        if (err) {
            console.log(err)
        }
        else {
            path = "csvs/" + foundqn.name + " " + foundqn.uniqueid + " SUBMITTED" + ".xlsx"
            fs.unlinkSync(path)
            if (foundqn.uniqueid != "public") {
                path = "csvs/" + foundqn.name + " " + foundqn.uniqueid + " PENDING" + ".xlsx"
                fs.unlinkSync(path)
            }
            User.find({ type: "student", uniqueid: foundqn.uniqueid }, function(err, foundusers) {
                if (err) {
                    console.log(err)
                }
                else {
                    for (var i = 0; i < foundusers.length; i++) {
                        foundusers[i].questionresponse.remove(req.params.id);
                        foundusers[i].questionpending.remove(req.params.id)
                        foundusers[i].save()
                    }

                }
            })
        }
    })
    User.findById(req.user.id, function(err, founduser) {
        if (err) {
            console.log(err)
        }
        else {
            founduser.questioncreator.remove(req.params.id);
            founduser.save();
        }
    })
    Answer.deleteMany({ questionid: req.params.id }, function(err) {
        console.log(err);
    });
    Question.findByIdAndDelete(req.params.id, function(err) {
        console.log(err)
    });
    req.flash("toast", "Deleted")
    res.redirect("/index")
})

module.exports = router;
