
function beautifulrangeforaymeric(){
    const value = document.getElementById("value");
    const input = document.getElementById("player_range");
    value.textContent = input.value;
    input.addEventListener("input", (event) => {
        value.textContent = event.target.value;
    });
}