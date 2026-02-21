
window.addEventListener("load", () => {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (isTouch) {
        const warning = document.createElement("div");
        warning.innerText = "This site isn't designed for mobile.";
        warning.style.position = "fixed";
        warning.style.top = "0";
        warning.style.left = "0";
        warning.style.width = "100%";
        warning.style.background = "red";
        warning.style.color = "white";
        warning.style.padding = "10px";
        warning.style.textAlign = "center";
        warning.style.zIndex = "9999";

        document.body.appendChild(warning);
       alert("Hello! This website isn't designed for mobile. Parts of it will work, but a lot of it will look / be kinda broken. Sorry! I would try to fix it but I am just one woman, and very tired :(")
    }
});
