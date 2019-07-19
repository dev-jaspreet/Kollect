var express = require("express"),
    router = express.Router(),
    fs = require("fs"),
    User = require("../models/user"),
    Question = require("../models/questionbank"),
    Answer = require("../models/answerbank"),
    middleware = require("../middleware/functions");

var qnid;
// NEW QUESTION
router.get("/new", middleware.isLoggedIn, middleware.checkType, function(req, res) {
    res.render("new", { count: false, filter: false, pageTitle: "Selection: Creation Page" });
});

router.post("/filter", function(req, res) {
    qnid = req.body.department + req.body.section + req.body.year;
    res.render("new", { count: false, filter: true, pageTitle: "Count: Creation Page" });
});

router.post("/count", middleware.isLoggedIn, function(req, res) {
    res.render("new", { count: req.body.count, filter: true, pageTitle: "Questions: Creation Page" });
});

router.post("/new", function(req, res) {
    // req.body.Question.body = req.sanitize(req.body.Question.body);
    Question.create(req.body, function(err, submitqn) {
        if (err) {
            console.log(err);
        }
        else {
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
                    req.flash("toast", "Question Set: " + submitqn.name + " Has Been Created.")
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
                        middleware.pending(foundusers, foundset)
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
            path = "csvs/" + foundqn.name + " " + foundqn.uniqueid + " PENDING" + ".xlsx"
            fs.unlinkSync(path)
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


















































// DESTROY
// router.delete("/display/:id", function(req, res) {
//     var code;
// // Question.findById(req.params.id, function(err, foundqn) {
// //     if (err) {
// //         console.log(err);
// //     }
// //     else {
//                 User.find({ type: "student", uniqueid: foundqn.uniqueid }, function(err, foundusers) {
//                 if (err) {
//                     console.log(err);
//                 }
//                 else {
//                     Answer.find({ questionid: req.params.id }, function(err, foundans) {
//                     if (err) {
//                         console.log(err)
//                     }
//                     else {
//                         console.log(foundans[0].id)
//                         console.log(foundans)
//                         if (foundans[0].questionid == req.params.id) {
//                             console.log("match")
//                             console.log(typeof(req.params.id))
//                             console.log(typeof(foundans[0].id))
//                             code = foundans[0].id;
//                             console.log(code)
//                             // foundusers[i].answer.remove(foundans[0].id);
//                         }
//                     }
//                 })
//                     // console.log(foundusers)
//                     for (var i = 0; i < foundusers.length; i++) {
//                         // for (var j = 0; j < foundusers[i].answer.length; j++) {

//                         // }
//                         console.log("$$$$$$$$")
//                         console.log(code)
//                         // foundusers[i].questionpending.remove(req.params.id);
//                         // foundusers[i].questionresponse.remove(req.params.id);

//                         // foundusers[i].save();
//                     }
//                 }
//             });

//         })
//     // })

//     // User.findById(req.user.id, function(err, founduser) {
//     //     if (err) {
//     //         console.log(err)
//     //     }
//     //     else {
//     //         founduser.questioncreator.remove(req.params.id);
//     //         founduser.save();
//     //     }
//     // })
//     // Question.findByIdAndRemove(req.params.id, function(err) {
//     //     if (err) {
//     //         console.log(err)
//     //     }
//     //     else {
//     req.flash("error", "Deleted Succesfully.")
//     res.redirect("/index");
//     //     }
//     // })

//     //     }
//     // });

// });
