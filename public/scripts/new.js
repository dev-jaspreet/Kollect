var button = document.querySelectorAll("button");
// var a = document.querySelectorAll("a");
var div = document.getElementById("customdiv");
var length = div.getElementsByTagName("div").length;
var temp = length
// a[11].addEventListener("click", function() {
//     insertion("text")
// });
// a[12].addEventListener("click", function() {
//     insertion("date")
// });
// a[13].addEventListener("click", function() {
//     insertion("email")
// });
// a[14].addEventListener("click", function() {
//     insertion("number")
// });
// a[15].addEventListener("click", function() {
//     insertion("url")
// });
button[1].addEventListener("click", insertion);
button[2].addEventListener("click", deletion);
button[3].addEventListener("click", insertion);
button[4].addEventListener("click", deletion);

function insertion() {
    length++;
    var div = document.createElement("div");
    var input = document.createElement("input");
    var label = document.createElement("label");
    var labeltext = document.createTextNode(length + ": Question");
    setAttributes(label, { "for": "question" });
    setAttributes(div, { "class": "input-field" });
    setAttributes(input, { "type": "text", "name": "question", "class": "validate", "id": "question", "required": "" });
    label.appendChild(labeltext);
    div.appendChild(label);
    div.appendChild(input);
    document.getElementById("customdiv").appendChild(div);
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
