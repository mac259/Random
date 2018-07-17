let loginPassStatus = false;

function changeView() {
    let getLoginInput = document.getElementById("loginPassStatus");

    if (loginPassStatus === false) {
        getLoginInput.setAttribute("type", "text");
        loginPassStatus = true;
      }
      else if (loginPassStatus ===true) {
        getLoginInput.setAttribute("type", "password");
        loginPassStatus = false;
    }
}


/*
function openCam() {
// Grab elements, create settings, etc.
var video = document.getElementById('video');

// Get access to the camera!
if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    // Not adding `{ audio: true }` since we only want video now
    navigator.mediaDevices.getUserMedia({ video: true }).then(function(stream) {
        video.src = window.URL.createObjectURL(stream);
        video.play();
    });
}
}
*/
