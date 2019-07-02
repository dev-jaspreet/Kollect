var mongoose = require("mongoose");

var answerSchema = mongoose.Schema({
    created: {
        type: Date,
        default: Date.now
    },
    questionid:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Question"
    },
    registrationno: Number,
    answer: []
})

module.exports = mongoose.model("Answer", answerSchema);