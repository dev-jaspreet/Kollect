var express = require("express"),
    router = express.Router(),
    Question = require("../models/questionbank"),
    User = require("../models/user"),
    Answer = require("../models/answerbank"),
    middleware = require("../middleware/functions");

router.get("/display/:id/feedback", middleware.isLoggedIn, function(req, res) {
    Question.findById(req.params.id).populate("creator").exec(function(err, foundset) {
        if (err) {
            console.log(err)
        }
        else {
            if (foundset.complete == false) {
                res.render("feedback", { foundset: foundset, pageTitle: "FEED" })
            }
            else {
                req.flash("toast", foundset.name + " Has Been Locked.")
                res.redirect("/student/" + req.user.id)
            }
        }
    })
});


router.post("/display/:id/feedback", middleware.isLoggedIn, function(req, res) {
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
                    User.findById(req.user.id, function(err, founduser) {
                        if (err) {
                            console.log(err)
                        }
                        else {
                            founduser.answer.push(submitan);
                            founduser.questionresponse.push(submitqn);
                            founduser.questionpending.remove(submitqn.id)
                            founduser.save()
                        }
                    })
                    submitan.questionid = submitqn._id;
                    submitan.registrationno = req.user.registrationno;
                    submitan.save();
                    submitqn.answer.push(submitan);
                    submitqn.save(function(err, save) {
                        if (err) {
                            console.log(err);
                        }
                        else {
                            req.flash("toast", "Feedback Submitted.")
                            res.redirect("/student/" + req.user.id)
                        }
                    })

                }
            })
        }
    })
})
router.get("/feedbackedit/:id", middleware.isLoggedIn, function(req, res) {
    Question.findById(req.params.id).populate("answer").populate("creator").exec(function(err, foundqn) {
        if (err) {
            console.log(err)
        }
        else {
            if (foundqn.complete == false) {
                Answer.find({ registrationno: req.user.registrationno, questionid: foundqn._id }, function(err, foundans) {
                    if (err) {
                        console.log(err)
                    }
                    else {
                        res.render("feedbackedit", { foundqn: foundqn, foundans: foundans, pageTitle: "Edit Response" })
                    }
                })
            }
            else {
                req.flash("toast", foundqn.name + " Has Been Locked.")
                res.redirect("/student/" + req.user.id)
            }
        }
    })
})

router.put("/feedbackedit/:id", middleware.isLoggedIn, function(req, res) {
    req.body.Answer.body = req.sanitize(req.body.Answer.body);
    // console.log(req.body)
    Answer.findByIdAndUpdate(req.params.id, req.body.Answer, function(err, foundset) {
        if (err) {
            console.log(err);
        }
        else {
            req.flash("toast", "Feedback Changed.")
            res.redirect("/student/" + req.user.id)
        }
    })
})

module.exports = router;
