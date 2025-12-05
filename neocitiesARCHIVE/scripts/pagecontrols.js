
/// call this as follows:-

/// id of the narrower and wider buttons
/// the id of the element you're targeting
/// how many px you want it to change each time
/// the width (in px) you're starting at

/// REMEMEBER TO USE QUOTES FOR THE BUTTONS AND ELEMENT

function pageControls(narrowerButtonID, widerButtonID, target, steps, startingWidth) {

const narrowerButton = document.getElementById(narrowerButtonID);
const widerButton = document.getElementById(widerButtonID);
const controlTarget = document.getElementById(target)
const storageKey = `preferredWidth_${target}`; // key specific to this target

let pxsteps = steps;
    let storedWidth = localStorage.getItem(storageKey);
    let elementWidth = storedWidth ? parseInt(storedWidth) : startingWidth;



controlTarget.style.width = `${elementWidth}px`;

narrowerButton.addEventListener('click', function() {
    elementWidth = elementWidth - pxsteps;
    controlTarget.style.maxWidth = `${elementWidth}px`;
    controlTarget.style.width = `${elementWidth}px`;

})

widerButton.addEventListener('click', function() {
    elementWidth = elementWidth + pxsteps;
    controlTarget.style.maxWidth = `${elementWidth}px`;
    controlTarget.style.width = `${elementWidth}px`;
})

}

/// this will enable a button which hides and displays the sidebar 
/// the button must be wrapped in a div with the id hidesidebarbutton
/// if you want to replace the button with something else when the sidebar is shown / hidden 
/// pass this as a string through replaceSidebarContent

function setCookie(cname, cvalue, exdays) {
        const d = new Date();
        d.setTime(d.getTime() + (exdays*24*60*60*1000));
        let expires = "expires="+ d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    }


function blogButton() {
    const blogButton = document.getElementById('/blog/blog')
    const blogPosts = document.getElementById('blogposts')
    
    let blogPostsVisible = false
    if (docpath.includes('/blog'))  {
      blogPosts.style.display = 'flex'
      blogButton.innerHTML = "<div class='blogButton' id='/blog/blog'> blog <mark>▲</mark><br>"
      blogPostsVisible = true 
      console.log('this is a blog post!')

    }

    blogButton.addEventListener('click', function() {
      if (!blogPostsVisible) {
        blogPosts.style.display = 'flex'
        blogPostsVisible = true
        blogButton.innerHTML = "<div class='blogButton' id='/blog/blog'> blog <mark>▲</mark><br>"
      }
      else {
        blogPosts.style.display = 'none'
        blogPostsVisible = false
        blogButton.innerHTML = "<div class='blogButton' id='/blog/blog'> blog <mark>▼</mark><br>"

      }
    })}

function hideSidebar (sidebarHiddenDefault, sidebarOpenButton, sidebarClosedButton) {

const sidebar = document.getElementById('leftSidebar')
const hideSidebarButton = document.getElementById('hidesidebarbutton')

let isSidebarHidden = sidebarHiddenDefault
if (document.cookie.includes("sidebarHidden=true")){
    isSidebarHidden = false
    sidebar.style.display = 'block'
    hideSidebarButton.innerHTML = sidebarOpenButton
}
if (document.cookie.includes("sidebarHidden=false")){
    isSidebarHidden = true
    sidebar.style.display = 'none'
    hideSidebarButton.innerHTML = sidebarClosedButton
}



hideSidebarButton.addEventListener('click', function(event) {
    if (isSidebarHidden === false) {
        sidebar.style.display = 'none'
        isSidebarHidden = true
        if (sidebarOpenButton) {replaceSidebarImage()}
        setCookie("sidebarHidden",false,30)
    }
    else {
        sidebar.style.display = 'block'
        isSidebarHidden = false
        if (sidebarOpenButton) {replaceSidebarImage()}
        blogButton()
        setCookie("sidebarHidden",true,30)

    }
})

function replaceSidebarImage() {
    if (isSidebarHidden !== sidebarHiddenDefault) {hideSidebarButton.innerHTML = sidebarOpenButton}
    else {hideSidebarButton.innerHTML = sidebarClosedButton}
}

}


