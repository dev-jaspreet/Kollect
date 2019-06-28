var mongoose = require("mongoose"),
    passportlocalmongoose = require("passport-local-mongoose");

var userSchema = mongoose.Schema({
    username:String,
    name: String,
    type: String,
    registrationno: Number,
    gender: String,
    email: String,
    phone: Number,
    password: String
})

userSchema.plugin(passportlocalmongoose);
module.exports = mongoose.model("User", userSchema);
