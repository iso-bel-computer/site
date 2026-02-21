
// if stackoverflow have fucked me over here i will kill them
function isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }

if (isTouchDevice()) {
    alert("Hello! This website isn't designed for mobile. Parts of it will work, but a lot of it will look / be kinda broken. Sorry! I would try to fix it but I am just one woman, and very tired :(")
}
