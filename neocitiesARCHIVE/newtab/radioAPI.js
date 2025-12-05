const volumeUpButton = document.getElementById('radioVolumeUp');
const volumeDownButton = document.getElementById('radioVolumeDown');
let radioVolume = 10;

 

volumeUpButton.addEventListener('click', async function(event) {
    try {
    const response = await fetch('http://127.0.0.1:3000/volume?value=1');
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const data = await response.text();
    console.log(json);
        } catch (error) {
            console.error(error.message);
  }
})

volumeDownButton.addEventListener('click', async function(event) {
    try {
    const response = await fetch('http://127.0.0.1:3000/volume?value=1');
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const data = await response.text();
    console.log(json);
        } catch (error) {
            console.error(error.message);
  }
})





