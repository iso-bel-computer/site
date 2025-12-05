document.addEventListener('DOMContentLoaded', function() {


    let backButton = document.getElementById("backButton")
    let forwardsButton = document.getElementById("forwardsButton")
    let drawingDisplay = document.getElementById("drawingDisplay")
    let drawingTitle = document.getElementById("drawingTitle")
    let drawingDesc = document.getElementById("drawingDesc")
    let nsfwButton = document.getElementById('hideNSFW')
    let currentDrawing = 0
    let userConsentsToNSFW = false
        if (document.cookie.includes("nsfwshown=true")) {userConsentsToNSFW = true}

    // config list of drawings
    const DRAWINGS = {

        twenty: {
            title: 'dulwich art group - sandra',
            thumbnail: '/art/drawings/sandradulwich2107.jpeg',
            link: '/art/drawings/sandradulwich2107.jpeg',
            desc: '21.8.25 - head too big!!!',
            nsfw: false,
        },

        nineteen: {
            title: 'london drawing',
            thumbnail: '/art/drawings/ld3.6.25_1.jpeg',
            link: '/art/drawings/ld3.6.25_1.jpeg',
            desc: '3.8.25',
            nsfw: false,
        },

        eighteen: {
            title: 'london drawing',
            thumbnail: '/art/drawings/ld3.6.25_2.jpeg',
            link: '/art/drawings/ld3.6.25_2.jpeg',
            desc: '3.8.25 - torso too tall!!',
            nsfw: false,
        },

        seventeen: {
            title: 'adrian dutton',
            thumbnail: '/art/drawings/dutton18jul.jpeg',
            link: '/art/drawings/dutton18jul.jpeg',
            desc: '18.7.25 - pleased with this one (tho it does look a liiiiiil bit like a nazi poster - oops)',
            nsfw: false,
        },

        sixteen: {
            title: 'set social - felan',
            thumbnail: '/art/drawings/set16jul.jpeg',
            link: '/art/drawings/set16jul.jpeg',
            desc: '16.7.25',
            nsfw: false,
        },

        fifteen: { 
            title: 'set social - theo',
            thumbnail: '/art/drawings/set16jul2.jpeg',
            link: '/art/drawings/set16jul2.jpeg',
            desc: '16.7.25',
            nsfw: false,
        },

        fourteen: {
            title: 'set social - naiomi',
            thumbnail: '/art/drawings/set16jul3.jpeg',
            link: '/art/drawings/set16jul3.jpeg',
            desc: '16.7.25',
            nsfw: false,
        },

        thirteen: {
            title: 'dulwich art group',
            thumbnail: '/art/drawings/14juldulwich.jpg',
            link: '/art/drawings/14juldulwich.jpg',
            desc: '14.7.25 - happy with the shading but sorry to the model, who ive made look like a witch!',
            nsfw: false,
        },

        twelve: {
            title: 'dulwich art group - intro to tonal (1)',
            thumbnail: '/art/drawings/7.7.4.jpeg',
            link: '/art/drawings/7.7.4.jpeg',
            desc: '7.7.25',
            nsfw: false,
        },

        eleven: {
            title: 'dulwich art group - intro to tonal (2)',
            thumbnail: '/art/drawings/7.7.3.jpeg',
            link: '/art/drawings/7.7.3.jpeg',
            desc: '7.7.25',
            nsfw: false,
        },

        ten: {
            title: 'dulwich art group - ariana (1)',
            thumbnail: '/art/drawings/IMG_2131.jpg',
            link: '/art/drawings/IMG_2131.jpg',
            desc: '31.6.25',
            nsfw: false,
        },

        nine: {
            title: 'dulwich art group - ariana (2)',
            thumbnail: '/art/drawings/IMG_2132.jpg',
            link: '/art/drawings/IMG_2132.jpg',
            desc: '31.6.25',
            nsfw: false,
        },

        eight: {
            title: 'set social portrait club',
            thumbnail: '/art/drawings/setsocial_drawing.jpeg',
            link: '/art/drawings/setsocial_drawing.jpeg',
            desc: '18.6.25',
            nsfw: false,
        },

        seven: {
            title: 'london drawing - mike',
            thumbnail: '/art/drawings/IMG_0891.jpg',
            link: '/art/drawings/IMG_0891.jpg',
            desc: '3.5.25',
            nsfw: false,
        },

        six: {
            title: 'east london strippers collective - kleo',
            thumbnail: '/art/drawings/IMG_0595-2.jpg',
            link: '/art/drawings/IMG_0595-2.jpg',
            desc: '7.4.25',
            nsfw: false,
        },

        five: {
            title: 'east london strippers collective - skye',
            thumbnail: '/art/drawings/skye_elsc.jpg',
            link: '/art/drawings/skye_elsc.jpg',
            desc: '17.3.25',
            nsfw: false,
        },

        four: {
            title: 'the regent arms',
            thumbnail: '/art/drawings/regentarms.jpeg',
            link: '/art/drawings/regentarms.jpeg',
            desc: '12.3.25',
            nsfw: false,
        },

        three: {
            title: 'anomaly life drawing - leah edwardes',
            thumbnail: '/art/drawings/july24.jpg',
            link: '/art/drawings/july24.jpg',
            desc: '9.7.24',
            nsfw: false,
        },

        two: {
            title: 'anomaly life drawing',
            thumbnail: '/art/drawings/purple.jpg',
            link: '/art/drawings/purple.jpg',
            desc: '7.5.24',
            nsfw: false,
        },

        one: {
            title: 'anomaly life drawing',
            thumbnail: '/art/drawings/floristryshop.jpeg',
            link: '/art/drawings/floristryshop.jpeg',
            desc: '7.5.24',
            nsfw: false,
        },

    }

    let maxDrawings = Object.keys(DRAWINGS).length

    function handleNSFW() {
        const isNSFW = Object.values(DRAWINGS)[currentDrawing].nsfw;

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
        drawingDisplay.style.transition = 'filter 0s ease-out'
        drawingDisplay.style.filter = 'blur(10px) brightness(35%)'

        drawingDisplay.classList.add('blurred')
    }

    function unblurImage() {
        drawingDisplay.style.transition = 'filter 1s ease-out'
        drawingDisplay.style.filter = 'blur(0px) brightness(100%)'
        drawingDisplay.classList.remove('blurred')
    }


    function onLoad() {
        console.log('onload called')

        // populating content
        drawingDisplay.innerHTML = `<a target="_blank" href="${Object.values(DRAWINGS)[0].link}"><img src="${Object.values(DRAWINGS)[0].thumbnail}"></a>`
        drawingTitle.innerHTML = `${Object.values(DRAWINGS)[0].title}`
        drawingDesc.innerHTML = `${Object.values(DRAWINGS)[0].desc}`
        console.log('populated content on load')
        
        handleNSFW()
        
    }

    function transitionDrawing(moveNumber) {

        currentDrawing = currentDrawing + moveNumber;
        
        if (currentDrawing >= maxDrawings) {currentDrawing = 0}
        if (currentDrawing < 0) {currentDrawing = (maxDrawings - 1)}

        // Find existing image and link elements instead of replacing innerHTML
        const existingLink = drawingDisplay.querySelector('a');
        const existingImg = drawingDisplay.querySelector('img');
        
        if (existingLink && existingImg) {
            // Update existing elements
            existingLink.href = Object.values(DRAWINGS)[currentDrawing].link;  

            existingImg.src = Object.values(DRAWINGS)[currentDrawing].thumbnail;
        } else {
            // Fallback to innerHTML replacement if elements don't exist
            drawingDisplay.innerHTML = `<a target="_blank" href="${Object.values(DRAWINGS)[currentDrawing].link}"><img src="${Object.values(DRAWINGS)[currentDrawing].thumbnail}"></a>`;
        }

        drawingTitle.innerHTML = `${Object.values(DRAWINGS)[currentDrawing].title}`
        drawingDesc.innerHTML = `${Object.values(DRAWINGS)[currentDrawing].desc}`

        handleNSFW()
    }



    forwardsButton.addEventListener("click", function() {

        transitionDrawing(1)
    })

    backButton.addEventListener("click", function() {
        transitionDrawing(-1)
    })

    onLoad()

});