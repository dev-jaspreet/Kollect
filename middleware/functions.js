var nodemailer = require("nodemailer"),
    XLSX = require('xlsx');

var functionObject = {};

var auth = {
    type: 'oauth2',
    user: 'developer.jaspreet.master7@gmail.com',
    clientId: '636615500676-egv0iql8bc3fd02ig2q1mketn90jf4j8.apps.googleusercontent.com',
    clientSecret: 'tfck2KKT3g67aP2LfZNmP5EV',
    refreshToken: '1/7qm0OK4_MCUqoRolUt7-JB8wt-yV-NytLSk5C8DTjwU',
};

functionObject.isLoggedIn = function(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
};

functionObject.checkType = function(req, res, next) {
    if (req.user.type == "faculty") {
        return next();
    }
    res.redirect("/student/" + req.user.id);
}

functionObject.mail = function(mail) {
    var mailOptions = {
        from: "questionnaire-app-619.herokuapp.com",
        to: mail.email,
        subject: "Questionnaire-" + mail.username,
        // text: "Congratulations, You have succesfully signed up on questionnaire-app-619.herokuapp.com",
        html: 'Username: ' + mail.username + '<br></br> Name: ' + mail.name + '<br></br> Email: ' + mail.email + '<br></br> Registration No: ' + mail.registrationno + "<br></br> Mobile Number: " + mail.phone + "<br></br> Click on the link to Login In: https://kollect-app-619.herokuapp.com/login",
    };
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: auth,
    });
    transporter.sendMail(mailOptions, (err, res) => {
        if (err) {
            return console.log(err);
        }
        else {
            console.log(JSON.stringify(res));
        }
    });
}

functionObject.bulkmail = function(body, emails) {
    var mailOptions = {
        from: "questionnaire-app-619.herokuapp.com",
        to: emails,
        subject: "Question Set: " + body.name + " For " + body.uniqueid,
        // text: "Congratulations, You have succesfully signed up on questionnaire-app-619.herokuapp.com",
        html: "Hello, <br></br> Your Feedback is Required For Question Set: " + body.name + "<br></br>Created On: " + body.created + "<br></br>Please Visit https://kollect-app-619.herokuapp.com For More Info." + "<br></br>Thank You.",
    };
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: auth,
    });
    transporter.sendMail(mailOptions, (err, res) => {
        if (err) {
            return console.log(err);
        }
        else {
            console.log(JSON.stringify(res));
        }
    });
}

functionObject.submitted = function(foundset) {
    var wb = XLSX.utils.book_new();
    var sheet = "SheetJS";
    var ws_data = [];
    var header = [];
    var data = [];
    var name = "csvs/" + foundset.name + " " + foundset.uniqueid + " SUBMITTED" + ".xlsx"
    for (var i = 0; i < foundset.question.length; i++) {
        header.push(foundset.question[i])
    }
    header.push("Registration No")
    ws_data.push(header)
    for (var i = 0; i < foundset.answer.length; i++) {
        for (var j = 0; j < foundset.answer[i].answer.length; j++) {
            data.push(foundset.answer[i].answer[j])
        }
        data.push(foundset.answer[i].registrationno)
        ws_data.push(data)
        data = [];
    }
    var ws = XLSX.utils.aoa_to_sheet(ws_data);
    XLSX.utils.book_append_sheet(wb, ws, sheet)
    XLSX.writeFile(wb, name);
}

functionObject.pending = function(foundusers, foundset) {
    var wb = XLSX.utils.book_new();
    var sheet = "SheetJS";
    var ws_data = [];
    var header = ["Name", "Registration No"];
    var data = [];
    var name = "csvs/" + foundset.name + " " + foundset.uniqueid + " PENDING" + ".xlsx"
    ws_data.push(header)
    for (var i = 0; i < foundusers.length; i++) {
        if (foundusers[i].questionpending.length) {
            for (var j = 0; j < foundusers[i].questionpending.length; j++) {
                if (foundset._id.equals(foundusers[i].questionpending[j]._id)) {
                    data.push(foundusers[i].name)
                    data.push(foundusers[i].registrationno)
                    ws_data.push(data)
                    data = [];
                }
            }
        }
    }
    var ws = XLSX.utils.aoa_to_sheet(ws_data);
    XLSX.utils.book_append_sheet(wb, ws, sheet)
    XLSX.writeFile(wb, name);
}

module.exports = functionObject;
