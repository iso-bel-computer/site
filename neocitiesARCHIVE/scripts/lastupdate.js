// this will write the last updated date wherever it's called in the doc. careful! 


months = ['January', 'Febraury', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];         
    var theDate = new Date(document.lastModified);  
    theDate.setTime((theDate.getTime()) ) 
    with (theDate) { 
    document.write("<b>Last updated</b> <br><div style='padding-left:5px'>"+getDate()+' '+months[getMonth()]+' '+getFullYear()+' - '+(getHours() < 10 ? '0' : '') + getHours() + ':' + (getMinutes() < 10 ? '0' : '') + getMinutes()+"</div>")
    
        } 