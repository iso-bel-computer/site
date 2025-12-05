/// to call this in a page specify the .txt file 
///  and the div it's being inserted into 

/// eg:-
///     <script src="/scripts/fetchtxt.js"></script>
///     <script>
///         fetchTxt('/misc_resources/updates.txt', 'updates-content');
///     </script>

/// function fetchTxt(filePath, elementId) {
/// fetch(filePath)
/// .then(response => response.text())
/// .then(data => {
/// document.getElementById(elementId).innerHTML = data;
/// })
/// .then(code => {
/// eval(code)}); 
/// }

function fetchTxt(filePath, elementId) {
  fetch(filePath)
    .then(response => response.text())
    .then(data => {
      const container = document.getElementById(elementId);
      container.innerHTML = data;

      // Manually execute any <script> tags
      const scripts = container.querySelectorAll('script');
      scripts.forEach(script => {
        const newScript = document.createElement('script');
        if (script.src) {
          newScript.src = script.src; // Copy external src if any
        } else {
          newScript.text = script.textContent;
        }
        document.body.appendChild(newScript); // or use container if needed
      });
    })
    .catch(error => {
      console.error('Error loading content:', error);
      document.getElementById(elementId).innerHTML = 'Content unavailable';
    });
}


