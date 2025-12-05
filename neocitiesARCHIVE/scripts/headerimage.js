
                    const randomChance = 5

                    let header = document.getElementById('header')
                    let imageBlock = false;
                    let newImageSeen = true;
                    
                    function getRandomArbitrary(min, max) {
                        return Math.random() * (max - min) + min;
                    }

                    function randomImage() { 
                        fetch('/headerimages/headerimages.txt')
                        .then(response => response.text())
                        .then(data => {
                            const headerImages = data.trim().split('\n');

                            const randomImage = headerImages[Math.floor(Math.random() * headerImages.length)];
                                        const img = new Image();
                                        img.src = randomImage;
                                        img.onload = () => {
                                            // Apply only when it's ready
                                            header.style.backgroundImage = `url(${randomImage})`;
                                        };

                        })
                    };

                    document.addEventListener('DOMContentLoaded', function() {randomImage()})

                    function isVisibleInViewport(elem)
                    {
                        var y = elem.offsetTop;
                        var height = elem.offsetHeight;

                        while ( elem = elem.offsetParent )
                            y += elem.offsetTop;

                        var maxHeight = y + height;
                        var isVisible = ( y < ( window.pageYOffset + window.innerHeight ) ) && ( maxHeight >= window.pageYOffset );
                        return isVisible; 

                    }

                    function check()
                    {
                        if(isVisibleInViewport(header)) {newImageSeen = true}
                        else
                        
                        if (newImageSeen == true && imageBlock == false) {
                        let random = getRandomArbitrary(0,randomChance);
                        if (random < 1) {randomImage()}
                        imageBlock = true
                        newImageSeen = false
                        setTimeout(function() {imageBlock = false}, 500)

                    };


                    }

                    window.addEventListener("scroll", check);
