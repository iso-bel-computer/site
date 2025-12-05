

function displayRandom(filepath, targetdiv) {
fetch(filepath)
.then(response => response.text())
.then(data => {
  const alllines = data.trim().split('\n');
  const randomline = alllines[Math.floor(Math.random() * alllines.length)];
  document.getElementById(targetdiv).innerHTML = randomline;
})
.catch(error => {
  document.getElementById(targetdiv).innerHTML = 'sites borked. did you know that the word borked comes from supreme court justice and noted cunt, robert bork?';
});
}