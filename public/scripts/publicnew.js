var button = document.querySelectorAll("button");
var a = document.querySelectorAll("a");
var div = document.getElementById("customdiv");
var length = div.getElementsByTagName("div").length;
var temp = length;
var action = [];
for (var i = 0; i < length; i++) {
    action.push("text");
}
button[0].setAttribute("value", action)
a[15].addEventListener("click", function() {
    insertion("text")
});
a[16].addEventListener("click", function() {
    insertion("date")
});
a[17].addEventListener("click", function() {
    insertion("email")
});
a[18].addEventListener("click", function() {
    insertion("number")
});
a[19].addEventListener("click", function() {
    insertion("url")
});
// button[1].addEventListener("click", insertion);
button[2].addEventListener("click", deletion);


function insertion(para) {
    length++;
    var div = document.createElement("div");
    var input = document.createElement("input");
    var label = document.createElement("label");
    var labeltext = document.createTextNode(length + ": Question" + " Type: " + para.toUpperCase());
    setAttributes(label, { "for": "question" });
    setAttributes(div, { "class": "input-field animated fadeIn" });
    setAttributes(input, { "type": "text", "name": "question", "class": "validate", "id": "question", "required": "" });
    label.appendChild(labeltext);
    div.appendChild(label);
    div.appendChild(input);
    document.getElementById("customdiv").appendChild(div);
    action.push(para)
    button[0].setAttribute("value", action)
    console.log(length)

}

function deletion() {
    var remove = document.getElementById("customdiv");
    if (length != temp) {
        length--;
        remove.removeChild(remove.lastChild)
    }
}

function setAttributes(el, attrs) {
    for (var key in attrs) {
        el.setAttribute(key, attrs[key]);
    }
}
