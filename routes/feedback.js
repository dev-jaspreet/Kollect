var express = require("express"),
    router = express.Router(),
    Question = require("../models/questionbank"),
    User = require("../models/user"),
    Answer = require("../models/answerbank"),
    middleware = require("../middleware/functions"),
    multer = require('multer'),
    mime = require('mime-types');
var filenameupload;
var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads')
    },
    filename: function(req, file, cb) {
        filenameupload = file.fieldname + '-' + Date.now() + "." + mime.extension(file.mimetype);
        cb(null, file.fieldname + '-' + Date.now() + "." + mime.extension(file.mimetype))
    }
})
var upload = multer({ storage: storage })
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
router.get("/display/:id/publicfeedback", function(req, res) {
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
                res.redirect("/");
            }
        }
    })
});
//PUBLIC FEEDBACK ROUTE
router.post("/display/:id/publicfeedback", upload.array("fileupload"), function(req, res) {
    Question.findById(req.params.id, function(err, foundqn) {
        if (err) {
            console.log(err)
        }
        else {
            if (!foundqn.complete) {
                Answer.find({ questionid: req.params.id }, function(err, foundans) {
                    if (err) {
                        console.log(err)
                    }
                    else {
                        var j = 0;
                        var k = 0;
                        var temparray = [];
                        for (var i = 0; i < foundqn.key.length; i++) {
                            if (foundqn.key[i] == "file") {
                                temparray.push(filenameupload)
                            }
                            else if (foundqn.key[i] == "checkbox") {
                                temparray.push(req.body["answer" + k.toString()])
                                k++;
                            }
                            else if (typeof(req.body.answer) == "string" && foundqn.key.length == 1) {
                                temparray.push(req.body.answer)
                            }
                            else{
                                temparray.push(req.body.answer[j])
                                j++;
                            }
                        }
                        foundans[0].answer.push(temparray)
                        foundans[0].save();
                        req.flash("toast", "Thank You, You Have Submitted Your Response.")
                        res.redirect("/")
                    }
                })
            }
            else {
                req.flash("toast", "Sorry, No Longer Accepting Responses.");
                res.redirect("/")
            }
        }

    })
})
//PRIVATE FEEDBACK ROUTE
router.post("/display/:id/feedback", upload.array("fileupload"), middleware.isLoggedIn, function(req, res) {
    Question.findById(req.params.id, function(err, foundqn) {
        if (err) {
            console.log(err)
        }
        else {
            if (!foundqn.complete) {
                Answer.create(req.body, function(err, submitans) {
                    submitans.answer = []
                    if (err) {
                        console.log(err)
                    }
                    else {
                        var j = 0;
                        var k = 0;
                        var temparray = [];
                        // for (var i = 0; i < foundqn.key.length; i++) {
                        //     if (foundqn.key[i] == "file") {
                        //         submitans.answer.push(filenameupload)
                        //     }
                        //     else {
                        //         submitans.answer.push(req.body.answer[j])
                        //         j++;
                        //     }
                        // }
                        for (var i = 0; i < foundqn.key.length; i++) {
                            if (foundqn.key[i] == "file") {
                                temparray.push(filenameupload)
                            }
                            else if (foundqn.key[i] == "checkbox") {
                                temparray.push(req.body["answer" + k.toString()])
                                k++;
                            }
                            else if (typeof(req.body.answer) == "string" && foundqn.key.length == 1) {
                                temparray.push(req.body.answer)
                            }
                            else{
                                temparray.push(req.body.answer[j])
                                j++;
                            }
                        }
                        submitans.answer = temparray
                        User.findById(req.user.id, function(err, founduser) {
                            if (err) {
                                console.log(err)
                            }
                            else {
                                founduser.answer.push(submitans);
                                founduser.questionresponse.push(foundqn);
                                founduser.questionpending.remove(foundqn.id);
                                founduser.save()
                            }
                        })
                    }
                    submitans.questionid = foundqn._id;
                    submitans.registrationno = req.user.registrationno;
                    submitans.save();
                    foundqn.answer.push(submitans);
                    foundqn.save(function(err, save) {
                        if (err) {
                            console.log(err);
                        }
                        else {
                            req.flash("toast", "Feedback Submitted.")
                            res.redirect("/student/" + req.user.id)
                        }
                    })
                })
            }
            else {
                req.flash("toast", "Not Accepting Feedback");
                res.redirect("/student/" + req.user.id)
            }
        }
    })
})
//FEEDBACK EDIT ROUTE GET
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
//FEEDBACK UPDATE POST
router.put("/feedbackedit/:id", middleware.isLoggedIn, function(req, res) {
    req.body.Answer.body = req.sanitize(req.body.Answer.body);
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
