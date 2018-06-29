// Get popUp/modal element
var popUp = document.getElementById('popUp');
// Get open popUp button
var openBtn = document.getElementById('openBtn');
// Get close button
var closeBtn = document.getElementsByClassName('closeBtn')[0];

// Listen for open click
openBtn.addEventListener('click', openModal);
// Listen for close click
closeBtn.addEventListener('click', closeModal);
// Listen for outside click
window.addEventListener('click', outsideClick);

// Function to open popUp
function openModal(){
  popUp.style.display = 'block';
}

// Function to close popUp
function closeModal(){
  popUp.style.display = 'none';
}

// Function to close popUp if outside click
function outsideClick(e){
  if(e.target == popUp){
    popUp.style.display = 'none';
  }
}
