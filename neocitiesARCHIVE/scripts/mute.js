/// should be called with the google api

//  <script src="https://ajax.googleapis.com/ajax/libs/jquery/2.0.2/jquery.min.js"></script>
//  <script src="/scripts/mute.js"></script>

// ^ like



    $(document).ready(function(){

    let muted = false;
    let trainGameOpen = false;

    /*** Mute all ***/
    $('#muteButton').on('click',function(){
        if (muted === false) {
            muteAll();
            document.getElementById('muteButton').innerHTML = '<s>Audio</s>'
        }
        else {
            unMuteAll();
            document.getElementById('muteButton').innerText = 'Audio'
        }
    });

    $('#traingamebutton').on('click',function(){
        if (trainGameOpen === true) {
            muteAll()
            trainGameOpen = false
        }

        else { 
            unMuteAll()
            trainGameOpen = true
        }

    });

function muteAll() {
    $('body video, body audio').each(function(){
    $(this).prop('muted', true);
    });
    muted = true;
}

function unMuteAll() {
    $('body video, body audio').each(function(){
    $(this).prop('muted', false);
    })
    muted = false;
}


})


                        