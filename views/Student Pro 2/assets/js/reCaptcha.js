// Resize reCaptcha to fit width of container
// Since it has a fixed width, scaling done
// using CSS3 transforms
// ------------------------------------------
// captchaScale = containerWidth / elementWidth

function scaleCaptcha(elementWidth) {
  // Width of the reCaptcha element, in pixels
  var reCaptchaWidth = 304;
  // Get the containing element's width
	var containerWidth = $('.cont').width();

  // Only scale the reCaptcha if it won't fit
  // inside the container
  if(reCaptchaWidth > containerWidth) {
    // Calculate the scale
    var captchaScale = containerWidth / reCaptchaWidth;
    // Apply the transformation
    $('.g-recaptcha').css({
      'transform':'scale('+captchaScale+')'
    });
  }
  // Scale for all widths of .card-login
/*  else if(reCaptchaWidth < containerWidth) {
      // Calculate the scale
      var captchaScale = containerWidth / reCaptchaWidth;
      // Apply the transformation
      $('.g-recaptcha').css({
        'transform':'scale('+captchaScale+')'
      });
    } */
}

$(function() {

  // Initialize scaling
  scaleCaptcha();

  // Update scaling on window resize
  // Used jQuery throttle plugin to limit strain on the browser
  $(window).resize( $.throttle( 100, scaleCaptcha ) );

});
