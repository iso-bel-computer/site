/// TODO -
///     1. block sendTrain() from firing at all when the user is in transit. this shouldn't be a massive issue but it will come up 
///     2. make a more sophisticated system for detecting station, which will let me slot in stations modularly. this will involve API fuckery. 

const oysterCard = document.getElementById('oyster');
const cardReader = document.getElementById('cardreader');
const beepSound = document.getElementById('beep-sound');
const beepDeclined = document.getElementById('beep-declined');
const mindthegap = document.getElementById('mindthegap');
const tubeTrain = document.getElementById('tubeTrain');
const trainPlatform = document.getElementById('trainplatform');
const leaveBrixtonSound = document.getElementById('leaveplatformsound');
const arriveVictoriaSound = document.getElementById('victoriaarrive');
const noticeboard = document.getElementById('noticeboard');
const noticeboardcontainer = document.getElementById('noticeboardcontainer');
const noticeboardandplatform = document.getElementById('noticeboardandplatform');
const cardreadercontainer = document.getElementById('cardreadercontainer');
const ISODEBUG = document.getElementById('ISODEBUG');
const DEBUGCONTENT = document.getElementById('debugcontent');
const nextTrainButton = document.getElementById('nextTrainButton');


const CONFIG = {
    /// timings for the card reader. i think these are fine as is
    cardReaderAcceptedTime: 1000,
    cardReaderDeclinedTime: 1000,

    /// logic for train behaviour

    timeInTransit: 23000, 
        // time before 'stationTransition() is called, where the screen remains black. 
        // this must be longer than the combiend train arrive / stay / depart time, or the train wont arrive at the next station 
    trainArriveSpeed: 5000, 
    platformStayTime: 13000,
    trainDepartSpeed: 4000, 
        // these three control the train animations
    minimumTimeBetweenTrains: 24000, 
        /// calculate this as trainArriveSpeed + platformStayTime + trainDepartSpeed + whatever you want

    /// train apperance css 
    trainHoverApperanceAccepted: 'brightness(1.2) opacity(0.8)',
    trainHoverApperanceRejected: 'sepia(1) hue-rotate(320deg) saturate(1) brightness(0.8)',

    /// logic for journeys
    stationFadeoutTime: "3s", // time for the station to fade to black 
    stationFadeInTime: "3s", // time for the station to fade back in

    /// departure board
    dueThreshold: 30000, // how soon a train needs to be to be 'due'

    /// misc / other
    apiRefreshTime: 60000, // 60000 (60 seconds) seems to work fine - much quicker and you get trains continually respawning
    debugUpdateInterval: 1, // update time for debug display
    debugMode: false,
    oysterSelectedMobileTime: 10000, // time that oyster card remains selected on mobile
}

const STATIONS = {
    brixton: {
        name: 'Brixton',
        apiId: '940GZZLUBXN',
        platformImage: '/traingame/brixtonplatform.png',
        arriveSound: 'brixtonarrive',
        leaveSound: 'leaveplatformsound',

    },
        
    stockwell: {
        name: 'Stockwell', 
        apiId: '940GZZLUSKW',
        platformImage: '/traingame/stockwellplatform.png',
        arriveSound: 'stockwellarrive',
        leaveSound: 'stockwellleave',
        connections: ['brixton', 'vauxhall'],
    },
}

const STATES = {
    NOT_TOUCHED_IN: 0,
    READY_TO_BOARD: 1,
    IN_TRANSIT: 2,
}

let readyToTravel = STATES.NOT_TOUCHED_IN; /* this tracks if someone's touched in, and lets them board the train. 0 = not touched in, 1 = ready to board, 2 = in transit */
let oysterSelectedMobile = 0 /// this tracks if the oyster card is currently selected on mobile
let currentStation = 'brixton' /*current station is where you are right now. nextstation is where you're trying to go. ALWAYS ALL LOWERCASE*/
let timeUntilNextTrain = 5000000 /// just a big number to stop them appearing right away before api loads 
let trainTimeout;
let trainOnPlatform = false;
let nextTrainID = null; // these two prevent the same train from arriving multiple times 
let previousTrainIDs = [];
let trainCountdown;

/// api functionality 

setInterval(refreshAPI, CONFIG.apiRefreshTime)

function refreshAPI() {
    fetch(`https://api.tfl.gov.uk/StopPoint/${STATIONS.brixton.apiId}/Arrivals`)
        .then(response => response.json())
        .then(data => {
            console.log(data);
        
        /// there's definitely a better way of handling all this. I think a bit of it is probably redundant?
        /// and the scheduling next train stuff is a nightmare - a million edge cases where it breeaks
        /// ho hum

        const sortedArrivals = data.sort((a, b) => a.timeToStation - b.timeToStation);
        const nextThreeTrains = sortedArrivals.slice(0, 3);

        const train1 = nextThreeTrains[0];
        const train2 = nextThreeTrains[1];
        const train3 = nextThreeTrains[2];

        const train1mins = Math.round(train1.timeToStation / 60)
        const train2mins = Math.round(train2.timeToStation / 60)
        const train3mins = Math.round(train3.timeToStation / 60);

        scheduleNextTrain(train1);        

        /// placing train times on board
        if (timeUntilNextTrain < CONFIG.dueThreshold) {document.getElementById('train1').innerText = `Due`; nextTrainButton.innerHTML = 'next train arriving!'} 
            else {document.getElementById('train1').innerText = `${train1mins} mins`; nextTrainButton.innerHTML = `next train in ${train1mins} mins`}
        document.getElementById('train2').innerText = `${train2mins} mins`;
        document.getElementById('train3').innerText = `${train3mins} mins`;
        ;
    })
    .catch(error => {
        debugLog('Error fetching arrivals:');
    });

    updateLineStatus();
}

/// this creates the timer which calls the train once it's due. 
function scheduleNextTrain(train) {
    if (trainCountdown) {
        clearInterval(trainCountdown);
    }
    timeUntilNextTrain = train.timeToStation * 1000; 
    trainCountdown = setInterval(() => {timeUntilNextTrain-= 1000;
    if (timeUntilNextTrain <= 0) {
        clearInterval(trainCountdown);
        sendTrain();
    }}, 1000);
    nextTrainID = train.id;
    debugLog(`train scheduled. next train ID: ${train.id}`)
}

/// this function is only called by refreshAPI(), and updates the 'good service / bad service' description
function updateLineStatus() {
    fetch('https://api.tfl.gov.uk/Line/victoria/Status')
        .then(response => response.json())
        .then(data => {
        const status = data[0].lineStatuses[0].statusSeverityDescription;
            if(status === 'Severe Delays')
                {    document.getElementById('victoria-status').innerText =  `The Victoria Line is currently operating with Severe Delays`;}
            if(status === 'Minor Delays')
                {    document.getElementById('victoria-status').innerText =  `The Victoria Line is currently operating with Minor Delays`;}
            if(status === 'Good Service')
                {    document.getElementById('victoria-status').innerText =  `There is Good Service on the Victoria Line`;}
        })
        .catch(error => {
            debugLog('Error fetching Victoria Line status');
            document.getElementById('victoria-status').innerText = '*** STAND BACK TRAIN APPROACHING ***.';
        });
}

/* this sends the train */
/// to force the train to come, call sendTrain(true)
function sendTrain (forceTrain) {
    /// we only call if there's no train on the platform or if we're choosing to force it (eg if the platform is transitioning), and if we're not already travelling
    if ((trainOnPlatform === false  && !previousTrainIDs.includes(nextTrainID) && readyToTravel === STATES.READY_TO_BOARD || forceTrain === true)) {
        debugLog(`Train Sent! previous trains: ${previousTrainIDs}`);
        animateTrain();        
        trainOnPlatform = true; 
        setTimeout(function() {trainOnPlatform = false}, CONFIG.minimumTimeBetweenTrains); 
        previousTrainIDs.push(nextTrainID)
    }
    else {debugLog('train conflict avoided')}
}

function animateTrain() {
    /// reset animation and make the train pull up 
    tubeTrain.style.animation = ``;  
    setTimeout(function() {tubeTrain.style.animation = `trainArrive ${CONFIG.trainArriveSpeed}ms ease-in-out 1`}, 1);  

    /// makes the train wait at the platform, and keeps it steady 
    setTimeout(function() {tubeTrain.style.transform = "translateX(-50%) scale(1.2)"; tubeTrain.style.animation = ''; 
        /// makes the train leave
        setTimeout(function() {tubeTrain.style.animation = `trainDepart ${CONFIG.trainDepartSpeed}ms ease-in-out 1`; 
            /// resets the train
            setTimeout(function() {tubeTrain.style.transform = "translateX(-350%) scale(1.2)"; tubeTrain.style.animation = '', 
            debugLog('train reset'), 
            refreshAPI()}, 
                /// WELCOME TO CALLBACK HELL HAHAHAHAHAHAHAHAHHA
            CONFIG.trainDepartSpeed);}, 
        CONFIG.platformStayTime);}, 
    CONFIG.trainArriveSpeed); 
    }


                            
/// this handles the oyster card scanning
/// it's a long if / and for phones and computers
/// idk man me neither 

function isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }
    if (isTouchDevice())        /// touch tap 
            {                                
            oysterCard.addEventListener('touchstart', function(event) {
                event.preventDefault(); 
                oysterSelectedMobile = 1;
                event.target.style.brightness = '2';
                event.target.style.animation = 'phoneFlash 1.5s ease-in-out infinite';
                setTimeout(function() {
                    event.target.style.animation = ''; 
                    oysterSelectedMobile = 0
                }, CONFIG.oysterSelectedMobileTime)

            });
            cardReader.addEventListener('touchstart', function(event) {
                event.preventDefault(); 
                if (oysterSelectedMobile === 1) {tapOyster()}
                else {tapDeclined()}
            });
            }
        else  {                     /// desktop drag                
            oysterCard.addEventListener('dragstart', function(event) {
            event.dataTransfer.setData('text/plain', 'oyster-card');
            event.target.style.opacity = '0.5';
            });
            oysterCard.addEventListener('dragend', function(event) {
                oysterCard.style.opacity = '1';

            });
            cardReader.addEventListener('dragover', function(event) {
                event.preventDefault();
            });
            cardReader.addEventListener('drop', function(event) {
                event.preventDefault();
                const draggedItem = event.dataTransfer.getData('text/plain');
                if (draggedItem === 'oyster-card') 
                    {tapOyster()}
                else 
                    {tapDeclined()}
            cardReader.addEventListener('click', function(event) {
                tapDeclined()
            });

        });}

/// functions for tapping the oyster and tapping anything else

function tapOyster() {
    beepSound.play();
    cardReader.src = '/traingame/readeraccepted.png';
    oysterCard.style.opacity = '1';
    setTimeout(function() {
        cardReader.src = '/traingame/readerneutral.png';
        }, CONFIG.cardReaderAcceptedTime);
    slideContent();
    if (readyToTravel === STATES.READY_TO_BOARD)
            {readyToTravel = STATES.NOT_TOUCHED_IN}
        else if (readyToTravel === STATES.NOT_TOUCHED_IN)
            {readyToTravel = STATES.READY_TO_BOARD}

    oysterSelectedMobile = 0;     

}
function tapDeclined() {
        beepDeclined.play();
        cardReader.src = '/traingame/readerdeclined.png';
        setTimeout(function() {
            cardReader.src = '/traingame/readerneutral.png';
            }, 1000);
        oysterSelectedMobile = 0
        oysterCard.style.animation = `grow 3s 1`; 
        oysterCard.addEventListener('animationend', function() {oysterCard.style.animation = ''}, { once: true }); 

}
function slideContent() {
    if (readyToTravel === STATES.NOT_TOUCHED_IN) {
        noticeboardandplatform.style.transform = 'translateY(0%)';
        cardreadercontainer.style.transform = 'translateY(0%)';
    }
    if (readyToTravel === STATES.READY_TO_BOARD) {
        noticeboardandplatform.style.transform = 'translateY(-300%)';
        cardreadercontainer.style.transform = 'translateY(-300%)';
    }
}

/*this highlights the train based on whether someones touched in*/

tubeTrain.addEventListener("mouseover", function(event) {
    if (readyToTravel === STATES.NOT_TOUCHED_IN) {
        event.target.style.filter = CONFIG.trainHoverApperanceRejected;
    }

    if (readyToTravel === STATES.READY_TO_BOARD) {
        event.target.style.filter = CONFIG.trainHoverApperanceAccepted;
    }

    else {}
    });

tubeTrain.addEventListener("mouseout", function(event) {
    event.target.style.filter = 'brightness(1)';
    event.target.style.opacity = '1';
    });

/*this transitions stations when someone clicks on the train. */
tubeTrain.addEventListener("click", function(event) {
    if (readyToTravel === STATES.READY_TO_BOARD) {
        tubeTrain.style.opacity = '1';
        readyToTravel = STATES.IN_TRANSIT;
        stationFadeout();
        playLeaveStationAudio();
    }

    if (readyToTravel === STATES.NOT_TOUCHED_IN) {
        tapDeclined();
        setTimeout(function() {oysterCard.style.animation = ''}, 1000)
        setTimeout(function() {
            cardReader.src = '/traingame/readerneutral.png';
            }, 1000);
    }

    else {
    }
    });                                    
        
// functions for station transitions
function stationFadeout() {                            
        trainPlatform.style.filter = 'brightness(0)';
        trainPlatform.style.transition = `filter ${CONFIG.stationFadeoutTime} ease`;
        setTimeout(function() {readyToTravel = STATES.READY_TO_BOARD}, CONFIG.timeInTransit + CONFIG.trainArriveSpeed) // this should make it so that you can only click on the train once it arrives at the new platform
        setTimeout(stationTransition, CONFIG.timeInTransit);
    }

function playLeaveStationAudio() {
    leaveBrixtonSound.play();
    setInterval(function(){
        fadeOut(leaveBrixtonSound)
    }, CONFIG.timeInTransit)
    
}

function stationTransition()  {
    /*this is TEMPORARY - will need to sort out how to properly switch this*/
    if (currentStation === 'victoria') {currentStation = 'brixton'} else {currentStation = 'victoria'}

    /* this sets the platform to whatever the current station is. this lets me slot new ones in without rewriting loads of stuff*/
    trainPlatform.style.backgroundImage = `url('/traingame/${currentStation}platform.png')`;
    trainPlatform.style.transition = `filter ${CONFIG.stationFadeInTime} ease`;
    trainPlatform.style.filter = 'brightness(1)';
    sendTrain(true);  /// this forces a train to arrive at the station
    document.getElementById(`${currentStation}arrive`).play(); /// plays the arrival sound for the current station
}

/// this fades audio out - used to accommodate shorter transition times
function fadeOut(audioElement)  {
    const fadeInterval = setInterval(function() {
        audioElement.volume = audioElement.volume - 0.025;
        
        if (audioElement.volume <= 0) {
            audioElement.volume = 0;
            clearInterval(fadeInterval); 
        }
    }, 50); // Run every 50 milliseconds
}

/// debug bits

    // this controls the isopod
    const debugSendTrain = document.getElementById('debugSendTrain');
    debugSendTrain.addEventListener('click', sendTrain);

    const debugRefreshAPI = document.getElementById('debugRefreshAPI');
    debugRefreshAPI.addEventListener('click', refreshAPI);


   // this displays all the variables going on
    setInterval(function() {document.getElementById('debugtrainOnPlatform').innerText = trainOnPlatform}, CONFIG.debugUpdateInterval)
    setInterval(function() {document.getElementById('debugreadyToTravel').innerText = readyToTravel}, CONFIG.debugUpdateInterval)
    setInterval(function() {document.getElementById('debugcurrentStation').innerText = currentStation}, CONFIG.debugUpdateInterval)
    setInterval(function() {document.getElementById('debugtimeUntilNextTrain').innerText = `${(timeUntilNextTrain / 1000)}s`}, CONFIG.debugUpdateInterval)

   // this opens the debug menu
    ISODEBUG.addEventListener('dragstart', function(event) {
    event.dataTransfer.setData('text/plain', 'ISODEBUG');
        });
    ISODEBUG.addEventListener('dragend', function(event) {
        });
    cardReader.addEventListener('dragover', function(event) {
        event.preventDefault();
        });
    cardReader.addEventListener('drop', function(event) {
        event.preventDefault();
        const draggedItem = event.dataTransfer.getData('text/plain');
        if (draggedItem === 'ISODEBUG') 
            {DEBUGCONTENT.style.display = 'block'};
    })

    /// debug mode 
    if (CONFIG.debugMode === true) {
        setTimeout(function() {tapOyster()}, 1)  
        DEBUGCONTENT.style.display = 'block'
        }

    function debugLog(message) {
        console.log(message);
        document.getElementById('debugConsole').innerHTML += message + '<br>';
        }
