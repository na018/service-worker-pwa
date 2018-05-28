var deferredPrompt
var enableNotiButton = document.querySelectorAll('.enable-notifications');

// if browser has not implemented Promise polyfill
if (!window.Promise) {
  window.Promise = Promise
}
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/sw.js', {scope: '/'})
    .then(function () {
      console.log('registered service worker')
    })
    .catch(function (err) {
      console.log(err)
    })
}
window.addEventListener('beforeinstallprompt', function (event) {
  console.log('beforeinstallprompt fired')
  event.preventDefault()
  deferredPrompt = event
  return false
})

var promise = new Promise(function (resolve, reject) {
  setTimeout(function () {
    resolve('This is executed once the timer is done!')
  }, 3000)

})

//ask for user permissions for notifications
function askForPermNotis() {
  Notification.requestPermission(function(result) {
    console.log ('User Choice', result);
    if (result !== 'granted') {
      console.log('No permissions for notifications granted');
    } else {
      console.log('Permissions for notifications granted!');
      displayPermissionGranted();
    }

  });
}

//show the user that permissions for notifications are now granted
function displayPermissionGranted() {
  var opts = {
    body: 'Successfully installed notifications!'
  };
  //check that sw is available
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(function(sweg) {
        sweg.showNotification('Permissions for notifications through SW granted!', opts);
      });
  }

  new Notification('Permissions for notifications granted!', opts);
}

//check if the browser support Notifications and make button visible
if ('Notification' in window) {
  for (var i = 0; i< enableNotiButton.length; i++){
    enableNotiButton[i].style.display = 'inline-block';
    enableNotiButton[i].addEventListener('click', askForPermNotis);
  }
}
/*
 traditional requests cant be used with ServiceWorkers -> only fetch API
 var xhr = new XMLHttpRequest()
 xhr.open('GET', 'http://httpbin.org/ip')
 xhr.responseType = 'json'
 xhr.onload = function () {
 console.log(xhr.response)
 }
 xhr.onerror = function () {
 console.log('Error!')
 }
 xhr.send()*/

/*
fetch('http://httpbin.org/ip')
  .then(function (response) {
    console.log(response)
    return response.json()
  })
  .then(function (data) {
    console.log(data)
  })
  .catch(function (err) {
    console.log(err)
  })*/

/*
fetch('http://httpbin.org/post', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  body: JSON.stringify({message: 'Does this work?'}),
})
  .then(function (response) {
    console.log(response)
    return response.json()
  })
  .then(function (data) {
    console.log(data)
  })
  .catch(function (err) {
    console.log(err)
  })
*/
