/// insert a <script> link to this code and a div titled sidebarSitemap directly below
document.addEventListener('DOMContentLoaded', function() {

function fetchTxt(filePath, elementId) {
  fetch(filePath)
    .then(response => response.text())
    .then(data => {
      const container = document.getElementById(elementId);
      container.innerHTML = data;
    })
}

fetchTxt('/text/sitemap.txt','sidebarSitemap')

setTimeout(function() {
    let docpath = document.location.pathname 
    console.log('docpath:', docpath)
    let currentPageLink = document.getElementById(`${docpath}`)
    console.log('currentPageLink: ', currentPageLink)
    currentPageLink.style.fontWeight = "bold"

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
    }) 

}, 50)       


})
