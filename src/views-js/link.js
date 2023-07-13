let linkState = false;

function getLinkState(){
    return linkState;
}

function setLinkState(value){
    linkState = value;
}

function showLinkState(value){
    const span = document.querySelector(".link_state");
    value ? span.innerHTML = "Vinculado" : span.innerHTML = "(No vinculada)";
}

document.querySelector(".button__link").addEventListener("click", () => {
    console.log("Se dio click en button__link");
    getLinkState() ? setLinkState(false) : setLinkState(true);
    showLinkState(getLinkState());
    console.log(getLinkState());
})