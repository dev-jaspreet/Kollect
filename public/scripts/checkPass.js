var input = document.querySelectorAll("input");
var a = document.querySelectorAll("a");

input[5].addEventListener("change", checkPass)
input[6].addEventListener("change", checkPass)

function checkPass() {
    if (input[5].value === input[6].value) {
        a[4].classList.add("disabled")
    }
}
