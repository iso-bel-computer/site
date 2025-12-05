document.addEventListener('DOMContentLoaded', function() {


    let backButton = document.getElementById("backButton")
    let forwardsButton = document.getElementById("forwardsButton")
    let printDisplay = document.getElementById("printDisplay")
    let printTitle = document.getElementById("printTitle")
    let printDesc = document.getElementById("printDesc")
    let nsfwButton = document.getElementById('hideNSFW')
    let currentPrint = 0
    let userConsentsToNSFW = false
        if (document.cookie.includes("nsfwshown=true")) {userConsentsToNSFW = true}

    // config list of prints
    const PRINTS = {
        ohsevenfoursix: {
            title: '0746',
            thumbnail: '/art/prints/0746.png',
            link: '/art/prints/0746.png',
            desc: 'sep 25 - composed at blackfriars. frozen for freshness.',
            nsfw: false,
        },

        magpie: {
            title: 'good morning ms magpie',
            thumbnail: '/art/prints/onceforsorrow_bw_thumb_no-explicit.jpg',
            link: '/art/prints/onceforsorrow_bw_no-explicit.png',
            desc: 'aug 25 - three for a girl, four for a boy... <br>(watch out btw, this has my naked ass in! are u sure you want to see that?? ofc u are. *al pachino voice* ITS A GREAT ASS!)',
            nsfw: true,
            nsfw_warning: 'watch out!!! this ones got my naked ass in it!! are you sure you want to see that?? *al pachino voice* ITS A GREAT ASS',
        },

        quickMarchTemp: {
            title: 'quick march (first panel)',
            thumbnail: '/art/prints/qm_temp_thumb.jpg',
            link: '/art/prints/qm_temp.png',
            desc: 'aug 25 - first of a series. more to come!',
            nsfw: false,
        },


        quickMarch: {
            title: 'quick march (draft)',
            thumbnail: '/art/prints/quickmarch_thumbnail.jpg',
            link: '/art/prints/quickmarch_website.png',
            desc: 'aug 25 - and you think your commute is bad...',
            nsfw: false,
        },

        forIShallNot: {
            title: 'let me do it now',
            thumbnail: '/art/prints/thumb_forishallnot.jpg',
            link: '/art/prints/forishallnot.png',
            desc: 'june 25 - made with love from the scottish highlands',
            nsfw: false,
        },

        ohKapitan: {
            title: 'oh kapitan',
            thumbnail: '/art/prints/thumb_ohkapitan.jpg',
            link: '/art/prints/ohkapitan.png',
            desc: 'june 25 - there is a policeman inside all our heads. he must be destroyed',
            nsfw: false,
        },

        payload: {
            title: 'payload',
            thumbnail: '/art/prints/thumb_payload.jpg',
            link: '/art/prints/payload.png',
            desc: 'may 25 - with thanks to jon bois',
            nsfw: false,
        },

        monsterCulture: {
            title: 'Monster Culture (Seven Theses)',
            thumbnail: '/art/prints/thumb_monsterculture.jpg',
            link: '/art/prints/monsterculture.png',
            desc: 'may 25 - based on the wonderful &nbsp<a href="https://files.commons.gc.cuny.edu/wp-content/blogs.dir/20578/files/2022/05/FYW-Sample-Reading-B.pdf">jeffrey jerome cohen essay</a>.',
            nsfw: false,
        },

        autoHaruSpex: {
            title: 'in my remains I read my fortune',
            thumbnail: '/art/prints/ahspx.png',
            link: '/art/prints/ahspx.png',
            desc: 'may 25 - still need to work on this and make it a tote.',
            nsfw: false,
        },


    }

    let maxPrints = Object.keys(PRINTS).length
/*
    function handleNSFW() {
        if (document.cookie.includes("nsfwshown=true")) {NSFWButton('block')}
        else {
            
            // we redisplay the image without the link - to stop conflict with the alert
            printDisplay.innerHTML = `<img src="${Object.values(PRINTS)[0].thumbnail}">`
            
            // we blur the image and add the blurred class
            printDisplay.style.filter = 'blur(13px) brightness(35%)'
            printDisplay.classList.add('blurred')
            
            // we add a confirmation box to unblur
            NSFWButton('block')    
        }
    }

    function NSFWButton(display) {
        hideNSFW.style.display = display 
        if (display !== 'none') {

            if (document.cookie.includes("nsfwshown=true")) {
                hideNSFW.innerHTML = 'show NSFW?'
                hideNSFW.addEventListener('click', function() {
                    setCookie("nsfwshown",false,30)
                    printDisplay.style.filter = 'blur(10px) brightness(35%)'
                    printDisplay.classList.add('blurred')
                }) 
            }

            else {
                hideNSFW.innerHTML = 'hide NSFW?'
                hideNSFW.addEventListener("click", function() {
                if (confirm("watch out!!! this ones got my naked ass in it!! are you sure you want to see that?? *al pachino voice* ITS A GREAT ASS") == true) {
                    printDisplay.style.filter = 'none'
                    setCookie("nsfwshown",true,30)
                    this.removeEventListener()
                    NSFWButton('block')

                }})
            }
        }
    }
        */

/*
    function handleNSFW() {
        
        console.log(userConsentsToNSFW, 'handle nsfw called')

        if (Object.values(PRINTS)[currentPrint].nsfw && userConsentsToNSFW == true){
            updateNSFWButton('block', 'Hide NSFW?')
            nsfwButton.addEventListener('click', function() {
                blurImage()
                updateUserConsent(false)
                updateNSFWButton('block', 'Show NSFW?')
            })
        }

        if (Object.values(PRINTS)[currentPrint].nsfw && !userConsentsToNSFW){
            updateNSFWButton('block', 'Show NSFW?')
            blurImage()
            nsfwButton.addEventListener('click', function() {
                unblurImage()
                updateUserConsent(true)
                updateNSFWButton('block', 'Hide NSFW?')

            })
        }
        
        else {
            updateNSFWButton('none')
        }
    }
*/

    function handleNSFW() {
        const isNSFW = Object.values(PRINTS)[currentPrint].nsfw;

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
            updateNSFWButton('inline', 'hide nudity?');
            nsfwButton.addEventListener('click', () => {
                blurImage();
                updateUserConsent(false);
                updateNSFWButton('inline', 'show nudity?');
            });
        } else {
            blurImage();
            updateNSFWButton('inline', 'show nudity?');
            nsfwButton.addEventListener('click', () => {
                unblurImage();
                updateUserConsent(true);
                updateNSFWButton('inline', 'hide nudity?');
            });
        }
    }

    function updateNSFWButton(display, hide) {
        nsfwButton.style.display = display
        nsfwButton.innerHTML = hide

        if (hide == 'show nudity?') {
            nsfwButton.addEventListener('click', () => {
                unblurImage();
                updateUserConsent(true);
                updateNSFWButton('inline', 'hide nudity?');
            });
        }

        else {
            nsfwButton.addEventListener('click', () => {
                blurImage();
                updateUserConsent(false);
                updateNSFWButton('inline', 'show nudity?');

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
        printDisplay.style.transition = 'filter 0s ease-out'
        printDisplay.style.filter = 'blur(10px) brightness(20%)'

        printDisplay.classList.add('blurred')
    }

    function unblurImage() {
        printDisplay.style.transition = 'filter 1s ease-out'
        printDisplay.style.filter = 'blur(0px) brightness(100%)'
        printDisplay.classList.remove('blurred')
    }


    function onLoad() {

        // populating content
        printDisplay.innerHTML = `<a target="_blank" href="${Object.values(PRINTS)[0].link}"><img src="${Object.values(PRINTS)[0].thumbnail}"></a>`
        printTitle.innerHTML = `${Object.values(PRINTS)[0].title}`
        printDesc.innerHTML = `${Object.values(PRINTS)[0].desc}`
        
        handleNSFW()
        
    }

    function transitionPrint(moveNumber) {

        currentPrint = currentPrint + moveNumber;
        
        if (currentPrint >= maxPrints) {currentPrint = 0}
        if (currentPrint < 0) {currentPrint = (maxPrints - 1)}

        // Find existing image and link elements instead of replacing innerHTML
        const existingLink = printDisplay.querySelector('a');
        const existingImg = printDisplay.querySelector('img');
        
        if (existingLink && existingImg) {
            // Update existing elements
            existingLink.href = Object.values(PRINTS)[currentPrint].link;  
            existingImg.src = Object.values(PRINTS)[currentPrint].thumbnail;
            
            existingImg.onload = function() {handleNSFW();}// Replace with your function name

        } else {
            // Fallback to innerHTML replacement if elements don't exist
            printDisplay.innerHTML = `<a target="_blank" href="${Object.values(PRINTS)[currentPrint].link}"><img src="${Object.values(PRINTS)[currentPrint].thumbnail}"></a>`;
        }

        printTitle.innerHTML = `${Object.values(PRINTS)[currentPrint].title}`
        printDesc.innerHTML = `${Object.values(PRINTS)[currentPrint].desc}`

    }



    forwardsButton.addEventListener("click", function() {

        transitionPrint(1)
    })

    backButton.addEventListener("click", function() {
        transitionPrint(-1)
    })

    onLoad()

});