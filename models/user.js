var mongoose = require("mongoose"),
    passportlocalmongoose = require("passport-local-mongoose");

var userSchema = mongoose.Schema({
    username: String,
    name: String,
    type: String,
    registrationno: Number,
    gender: String,
    email: String,
    phone: Number,
    password: String,
    uniqueid: String,
    answer: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Answer"
    }],
    questioncreator: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question"
    }],
    questionresponse: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question"
    }],
    questionpending: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question"
    }],
    image: {
        imageurl: String,
        imageid: String
    }
})

userSchema.index({ name: "text", uniqueid: "text" })
userSchema.plugin(passportlocalmongoose);
module.exports = mongoose.model("User", userSchema);
