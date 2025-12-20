const headerRouteDisplay = document.getElementById('headerRouteDisplay')

function init() {   // no real need to wrap this in its own init() rn.
                    // but maybe there will be... one of these days...
    function initSearchBar() {
        headerRouteDisplay.addEventListener('keydown', e => {
            if (e.key === 'Enter') {
                e.preventDefault();
                document.getElementById('headerRouteForm').submit();
            }
        })
    }

    initSearchBar()
}

init()
