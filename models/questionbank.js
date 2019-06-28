var mongoose = require("mongoose");

var questionSchema = mongoose.Schema({
    name: String,
    created: { type: Date, default: Date.now },
    userid: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        name: String
    },
    question: [],
    answer: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Answer"
        }
        ]
})

module.exports = mongoose.model("Question", questionSchema);
