/// to populate the gallery, add the below line to the document with the filepath of the .txt containing the config file
/// document.addEventListener('DOMContentLoaded', gallery(filepath));


function gallery(filepath) {

console.log("DOM loaded, looking for elements...")
console.log("forwardsButton element:", document.getElementById("forwardsButton"))

    let backButton = document.getElementById("backButton")
    let forwardsButton = document.getElementById("forwardsButton")
    console.log("forwardsButton:", forwardsButton)

    let imageDisplay = document.getElementById("imageDisplay")
    let imageTitle = document.getElementById("imageTitle")
    let imageDesc = document.getElementById("imageDesc")
    let imageAbt = document.getElementById("aboutText")
    let nsfwButton = document.getElementById('hideNSFW')
    let currentImage = 0
    let userConsentsToNSFW = false
        if (document.cookie.includes("nsfwshown=true")) {userConsentsToNSFW = true}
    let IMAGES = {}
    let maxImages = {}
    let currentImageCounter = document.getElementById('currentImageCounter')
    let maxImageCounter = document.getElementById('maxImageCounter')

    function handleNSFW() {
        const isNSFW = Object.values(IMAGES)[currentImage].nsfw;

        // Always reset button so old click handlers don't stack
        nsfwButton.replaceWith(nsfwButton.cloneNode(true));
        nsfwButton = document.getElementById('hideNSFW');

        if (!isNSFW) {
            updateNSFWButton('none');
            unblurImage();
            return;
        }

        if (userConsentsToNSFW) {
            unblurImage();
            updateNSFWButton('inline', 'Hide NSFW?');
            nsfwButton.addEventListener('click', () => {
                blurImage();
                updateUserConsent(false);
                updateNSFWButton('inline', 'Show NSFW?');
            });
        } else {
            blurImage();
            updateNSFWButton('inline', 'Show NSFW?');
            nsfwButton.addEventListener('click', () => {
                unblurImage();
                updateUserConsent(true);
                updateNSFWButton('inline', 'Hide NSFW?');
            });
        }
    }

    function updateNSFWButton(display, hide) {
        nsfwButton.style.display = display
        nsfwButton.innerHTML = hide

        if (hide == 'Show NSFW?') {
            nsfwButton.addEventListener('click', () => {
                unblurImage();
                updateUserConsent(true);
                updateNSFWButton('inline', 'Hide NSFW?');
            });
        }

        else {
            nsfwButton.addEventListener('click', () => {
                blurImage();
                updateUserConsent(false);
                updateNSFWButton('inline', 'Show NSFW?');

        });

    }}


    function updateUserConsent(tf) {
        setCookie("nsfwshown",tf,30)
        userConsentsToNSFW = tf;
    }
    
    function setCookie(cname, cvalue, exdays) {
        const d = new Date();
        d.setTime(d.getTime() + (exdays*24*60*60*1000));
        let expires = "expires="+ d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    }

    function blurImage() {
        imageDisplay.style.transition = 'filter 0s ease-out'
        imageDisplay.style.filter = 'blur(10px) brightness(35%)'

        imageDisplay.classList.add('blurred')
    }

    function unblurImage() {
        imageDisplay.style.transition = 'filter 1s ease-out'
        imageDisplay.style.filter = 'blur(0px) brightness(100%)'
        imageDisplay.classList.remove('blurred')
    }

    function hideNavButtons() {
    backButton.innerHTML = '←';
    forwardsButton.innerHTML = '→';
    backButton.style.cursor = 'pointer'
    forwardsButton.style.cursor = 'pointer'

    if (currentImage == 0) {
        backButton.innerHTML = '';
        backButton.style.cursor = 'default'
 
    }
    
    if (currentImage == maxImages - 1) {
        forwardsButton.innerHTML = '';
        forwardsButton.style.cursor = 'default'

    }}

    function updateImageCounters() {

        currentImageCounter.innerHTML = currentImage + 1
        maxImageCounter.innerHTML = maxImages 
    }


    function onLoad() {
        console.log('onload called')

        // populating content
        imageDisplay.innerHTML = `<a target="_blank" href="${Object.values(IMAGES)[0].link}"><img src="${Object.values(IMAGES)[0].thumbnail}"></a>`
        imageTitle.innerHTML = `${Object.values(IMAGES)[0].title}`
        imageDesc.innerHTML = `${Object.values(IMAGES)[0].desc}`
        if (Object.values(IMAGES)[0].about) {imageAbt.innerHTML = `${Object.values(IMAGES)[0].about}`}

        console.log('populated content on load')
        
        handleNSFW()
        updateImageCounters()
    }


    function transitionImage(moveNumber) {

        currentImage = currentImage + moveNumber;
        
        if (currentImage >= maxImages) {currentImage = maxImages}
        if (currentImage < 0) {currentImage = 0}
        hideNavButtons()

        // Find existing  and link elements instead of replacing innerHTML
        const existingLink = imageDisplay.querySelector('a');
        const existingImg = imageDisplay.querySelector('img');
        
        if (existingLink && existingImg) {
            // Update existing elements
            existingLink.href = Object.values(IMAGES)[currentImage].link;  
            existingImg.src = Object.values(IMAGES)[currentImage].thumbnail;
        } else {
            // Fallback to innerHTML replacement if elements don't exist
            imageDisplay.innerHTML = `<a target="_blank" href="${Object.values(IMAGES)[currentImage].link}"><img src="${Object.values(IMAGES)[currentImage].thumbnail}"></a>`;
        }

        imageTitle.innerHTML = `${Object.values(IMAGES)[currentImage].title}`
        imageDesc.innerHTML = `${Object.values(IMAGES)[currentImage].desc}`
        
        if (Object.values(IMAGES)[currentImage].about)  {
            imageAbt.innerHTML = `${Object.values(IMAGES)[currentImage].about}`
        }
        else {
            imageAbt.innerHTML = "no info available"
        }

        imageDisplay.style.height = imageDisplay.querySelector('img').scrollHeight


        updateImageCounters()
    }

    fetch(filepath) 
    
    .then (response => response.json())
        

    .then (data => {
        IMAGES = data
        maxImages = Object.keys(IMAGES).length
        forwardsButton.addEventListener("click", function() {transitionImage(1)})
        backButton.addEventListener("click", function() {transitionImage(-1)})
        onLoad()
        handleNSFW()
        

        })

    .then(
        setTimeout(function() {updateImageCounters()}, 150))

}

