var express = require("express"),
    router = express.Router(),
    User = require("../models/user"),
    Question = require("../models/questionbank"),
    middleware = require("../middleware/functions");

// NEW QUESTION
var count = false;
var filter = false;
var qnid;

router.get("/new", middleware.isLoggedIn, function(req, res) {
    res.render("new", { count: count, filter: filter, pageTitle: "Selection: Creation Page" });
})
router.post("/filter", function(req, res) {
    filter = true;
    qnid = req.body.department + req.body.section + req.body.year;
    res.render("new", { count: count, filter: filter, pageTitle: "Count: Creation Page" })
    
})

router.post("/count", function(req, res) {
    count = req.body.count;
    res.render("new", { count: count, filter: filter, pageTitle: "Questions: Creation Page" })
    filter = false;
                    count = false;
})

router.post("/new", function(req, res) {
    // req.body.Question.body = req.sanitize(req.body.Question.body);
    Question.create(req.body, function(err, submitqn) {
        if (err) {
            console.log(err)
        }
        else {
            submitqn.creator = req.user._id;
            submitqn.uniqueid = qnid;
            console.log(qnid)
            submitqn.save();
            User.find({ type: "student", uniqueid: submitqn.uniqueid }, function(err, foundstudent) {
                if (err) {
                    console.log(err)
                }
                else {
                    console.log(foundstudent)
                    for (var i = 0; i < foundstudent.length; i++) {
                        foundstudent[i].questionpending.push(submitqn);
                        foundstudent[i].save();
                    }
                }
            })
            User.findById(req.user.id, function(err, founduser) {
                if (err) {
                    console.log(err);
                }
                else {
                    founduser.questioncreator.push(submitqn);
                    founduser.save();

                    filter = false;
                    count = false;
                    res.redirect("/");
                }
            })
        }
    })

})

router.get("/display/:id/edit", middleware.isLoggedIn, middleware.checkType, function(req, res) {
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
router.put("/display/:id", function(req, res) {
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
router.delete("/display/:id", function(req, res) {
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
//DISPLAY
router.get("/display/:id", function(req, res) {
        Question.findById(req.params.id).populate("answer").populate("creator").exec(function(err, foundset) {
            if (err) {
                console.log(err)
            }
            else {
                // console.log(foundset)
                // console.log(foundset.answer.length)
                // console.log(foundset.answer[2].registrationno)
                User.find({ uniqueid: foundset.uniqueid }, function(err, foundusers) {
                    // console.log(foundusers)
                    // console.log(foundusers.length)
                    // console.log(foundusers[1].questionpending.length)
                    res.render("display", { foundusers: foundusers, foundset: foundset, pageTitle: foundset.name })

                })

            }
        })
    }

);

module.exports = router;
