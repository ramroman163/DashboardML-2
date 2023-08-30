let buttons = document.querySelectorAll(".button__seller");

buttons.forEach(button => {
    button.setAttribute("href", `http://localhost:3000/seller?seller_id=${button.getAttribute("value")}`)
})