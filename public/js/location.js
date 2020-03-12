const date = new Date()
const hours = date.getHours()
const myButton = document.getElementById('btnControl1')
const myButton2 = document.getElementById('btnControl2')


let button = function() {
    let startPos;
    let nudge = document.getElementById("nudge");
  
    let geoOptions = {
        timeout: 10 * 1000,
        enableHighAccuracy: true
      }

    let showNudgeBanner = function() {
      nudge.innerHTML = "Come to nhub and sign in.";
    };
  
    let hideNudgeBanner = function() {
      // nudge.style.display = "none";
      nudge.innerHTML = "Yeap, Location found !!";
    };
    let nudgeTimeoutId = setTimeout(showNudgeBanner, 5000);

    let geoSuccess = function(position) {
      hideNudgeBanner();
      clearTimeout(nudgeTimeoutId);
      startPos = position;
      let latitude = startPos.coords.latitude.toFixed(7)
      let longitude = startPos.coords.longitude.toFixed(7)

      // let nhubLatitude = 
      // let nhubLongitude = 

      document.getElementById('startLat').innerHTML = latitude
      document.getElementById('startLon').innerHTML = longitude
      
      let myLatitude = startPos.coords.latitude;
      let myLongitude = startPos.coords.longitude;
      let signInbtn = document.getElementById("nhubsignIn");

      if ((myLongitude >= 6.8788803 && myLongitude <= 10.8791706) && (myLatitude >= 6.8743101 && myLatitude <= 10.8744581) && (hours >= 8 && hours <= 10)){
        nudgeTimeoutId = true
        signInbtn.disabled = false
        myButton.disabled = false
        signInbtn.innerHTML = 'Sign In'
        signInbtn.style.cursor = 'pointer'
      }else{
        signInbtn.disabled = true
        signInbtn.innerHTML = 'Button Unavailable'
    }
    };

    let geoError = function(error) {
      switch(error.code) {
        case error.TIMEOUT:
          showNudgeBanner();
          break;
      }
    };
  
    navigator.geolocation.getCurrentPosition(geoSuccess, geoError, geoOptions);
  };
  
  // check for Geolocation support
if (navigator.geolocation) {
    console.log('Geolocation is supported!');
  }
  else {
    console.log('Geolocation is not supported for this Browser/OS.');
  }
