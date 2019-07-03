var express = require("express"),
    router = express.Router(),
    User = require("../models/user"),
    Question = require("../models/questionbank"),
    Answer = require("../models/answerbank"),
    middleware = require("../middleware/functions");;

router.get("/student/:id", middleware.isLoggedIn, function(req, res) {
    User.findById(req.user.id).populate("questionresponse").populate("answer").populate("questionpending").exec(function(err, founduser) {
        if (err) {
            console.log(err)
        }
        else {
            console.log(founduser)
            res.render("student", { founduser: founduser, pageTitle: req.user.name + "@" + req.user.registrationno })
        }
    })

})

router.get("/faculty/:id",middleware.isLoggedIn,function(req,res){
     User.findById(req.user.id).populate("questioncreator").exec(function(err, founduser) {
        if (err) {
            console.log(err)
        }
        else {
            console.log(founduser)
            res.render("faculty", { founduser: founduser, pageTitle: req.user.name + "@" + req.user.registrationno })
        }
    })
})

router.get("/studentedit/:id",middleware.isLoggedIn,function(req,res){
    User.findById(req.params.id,function(err,founduser){
        if(err){
            console.log(err)
        }else{
            res.render("studentedit",{founduser:founduser,pageTitle:"Edit Profile"})
        }
    })
})

module.exports = router;
