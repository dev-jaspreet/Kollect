var mongoose = require("mongoose");

var questionSchema = mongoose.Schema({
    name: String,
    created: {
        type: Date,
        default: Date.now
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    question: [],
    answer: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Answer"
    }],
    uniqueid: String,
    complete: Boolean
})

module.exports = mongoose.model("Question", questionSchema);
