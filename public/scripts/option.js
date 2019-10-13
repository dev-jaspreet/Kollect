// var chips = document.getElementsByClassName("chips");
var a = document.getElementsByClassName("atag")
var input = document.getElementsByTagName("input");
var button = document.querySelector("button")
var action = [];
var chip;
var close = [];
var temp;

function optionfinal(id) {
    chip = document.getElementsByClassName("myDiv")[id].getElementsByClassName("chip");
    for (var i = 0; i < chip.length; i++) {
        temp = chip[i].innerHTML;
        action.push(temp.substring(0,temp.indexOf("<")))
        close.push(chip[i].getElementsByTagName("i"))
        close[i][0].remove()
    }
    action.push("/")
    button.setAttribute("value", action)
    a[id].style.display = "none";
    input[id].style.display = "none";
    close = []
}