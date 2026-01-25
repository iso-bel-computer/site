export class Window {

    constructor(headerText) {
        this.element = this.createWindow(headerText)

        this.element.addEventListener('click', e => {this.focus()})
    }

    createWindow(headerText) {
        const element = document.createElement('div')
        element.classList.add('xpwindow')

        this.header = document.createElement('div')
        this.header.classList.add('xpwindowheader')
        this.header.innerHTML = headerText
        element.appendChild(this.header)

        this.content = document.createElement('div')
        this.content.classList.add('xpwindowcontent')
        element.appendChild(this.content)


        return element
    }

    enableDrag() {
        this.header.addEventListener('mousedown', e => {this.drag(e)}) // Changed to mousedown
    }

    drag(e) {
        var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        e.preventDefault();
        this.element.style.opacity = 0.9
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;

        // Store reference to this for use in nested functions
        const element = this.element;

        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;

        function elementDrag(e) {


            e = e || window.event;
            e.preventDefault();
            // calculate the new cursor position:
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;

            const elCoords = element.getBoundingClientRect()
            console.log(elCoords)

            // set the element's new position:
            if (elCoords.top >= 0 && elCoords.bottom <= window.innerHeight) {
                element.style.top = (element.offsetTop - pos2) + "px";
            }
            if (elCoords.left >= 0 && elCoords.right <= (window.innerWidth)) {
                element.style.left = (element.offsetLeft - pos1) + "px";
            }

            const newCoords = element.getBoundingClientRect()

            if (newCoords.left < 0) {
                element.style.left = 0
            }
            if (newCoords.right > window.innerWidth) {
                element.style.right = window.innerWidth
            }
            if (newCoords.top < 0) {
                element.style.top = 0
            }
            if (newCoords.bottom > window.innerHeight) {
                element.style.bottom = window.innerHeight
            }

        }
        function closeDragElement() {
            document.onmouseup = null;
            document.onmousemove = null;
            element.style.opacity = 1;
        }

    }

    focus() {
        const windows = document.querySelectorAll('.xpwindow')
        let largestZIndex = 2
        windows.forEach(el => {
            if(Number(el.style.zIndex) > largestZIndex) {
                largestZIndex = Number(el.style.zIndex)
            }
        })
        this.element.style.zIndex = largestZIndex + 1
    }

    headerText(text) {
        this.header.innerText = text
    }

    position(x, y) {
        this.element.style.top = x
        this.element.style.left = y
    }

    addContent(stuffToBeAdded) {
        this.content.appendChild(stuffToBeAdded)
    }

    clear() {
        this.content.innerHTML = ''
    }
}
