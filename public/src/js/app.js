
var deferredPrompt;
var enableNotificationsButtons = document.querySelectorAll('.enable-notifications');

if (!window.Promise) {
  window.Promise = Promise;
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/sw.js')
    .then(function () {
      console.log('Service worker registered!');
    })
    .catch(function(err) {
      console.log(err);
    });
}

window.addEventListener('beforeinstallprompt', function(event) {
  console.log('beforeinstallprompt fired');
  event.preventDefault();
  deferredPrompt = event;
  return false;
});

function displayConfirmNotification() {
  if ('serviceWorker' in navigator) {
    var options = {
      body: 'You successfully subscribed to our Notification service!',
      icon: '/src/images/icons/app-icon-96x96.png',
      image: '/src/images/sf-boat.jpg',
      dir: 'ltr',
      lang: 'en-US', // BCP 47,
      vibrate: [100, 50, 200],
      badge: '/src/images/icons/app-icon-96x96.png',
      tag: 'confirm-notification',
      renotify: true,
      actions: [
        { action: 'confirm', title: 'Okay', icon: '/src/images/icons/app-icon-96x96.png' },
        { action: 'cancel', title: 'Cancel', icon: '/src/images/icons/app-icon-96x96.png' }
      ]
    };

    navigator.serviceWorker.ready
      .then(function(swreg) {
        swreg.showNotification('Successfully subscribed!', options);
      });
  }
}

function configurePushSub() {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  var reg;
  navigator.serviceWorker.ready
    .then(function(swreg) {
      reg = swreg;
      return swreg.pushManager.getSubscription();
    })
    .then(function(sub) {
      if (sub === null) {
        // Create a new subscription
        var vapidPublicKey = 'BDui3XmS-VxBFTLMxLK3GPgW0BIdJSVlvXQR-6v--kHisyNz2Os2hOZUVPIyrljgQ7CbZBAsNov1oUX9AsYVOLw';
        var convertedVapidPublicKey = urlBase64ToUint8Array(vapidPublicKey);
        return reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidPublicKey
        });
      } else {
        // We have a subscription
      }
    })
    .then(function(newSub) {
      return fetch('https://serviceworker-f7f4f.firebaseio.com/subscription.json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(newSub)
      })
    })
    .then(function(res) {
      if (res.ok) {
        displayConfirmNotification();
      }
    })
    .catch(function(err) {
      console.log(err);
    });
}

function askForNotificationPermission() {
  Notification.requestPermission(function(result) {
    console.log('User Choice', result);
    if (result !== 'granted') {
      console.log('No notification permission granted!');
    } else {
      configurePushSub();
      // displayConfirmNotification();
    }
  });
}

if ('Notification' in window && 'serviceWorker' in navigator) {
  for (var i = 0; i < enableNotificationsButtons.length; i++) {
    enableNotificationsButtons[i].style.display = 'inline-block';
    enableNotificationsButtons[i].addEventListener('click', askForNotificationPermission);
  }
}


/*var deferredPrompt
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
      configurePushSub();
      //displayPermissionGranted();
    }

  });
}
//check if the browser support Notifications and make button visible
if ('Notification' in window && 'serviceWorker' in navigator) {
  for (var i = 0; i< enableNotiButton.length; i++){
    enableNotiButton[i].style.display = 'inline-block';
    enableNotiButton[i].addEventListener('click', askForPermNotis);
  }
}
//show the user that permissions for notifications are now granted
function displayPermissionGranted() {
  //check that sw is available
  if ('serviceWorker' in navigator) {
    var opts = {
      body: 'Successfully installed notifications!',
      icon: '/src/images/icons/app-icon-96x96.png',
      image: '/src/images/sf-boat.jpg',
      lang: 'en-US',
      vibrate: [100,50,200],
      badge: '/src/images/icons/app-icon-96x96.png',
      tag: 'confirm-notification',
      renotify: true,
      actions: [
        { action: 'confirm', title: 'Yep', icon: '/src/images/icons/app-icon-96x96.png' },
        { action: 'cancel', title: 'Nope', icon: '/src/images/icons/app-icon-96x96.png' }
      ]
    };

    navigator.serviceWorker.ready
    .then(function(sweg) {
        sweg.showNotification('Permissions for notifications granted!', opts);
      });
  }

}

function configurePushSub() {
  if (!('serviceWorker' in navigator)) {
    return;
  }
  navigator.serviceWorker.ready
    .then(function(swreg) {
      reg = swreg;
      swreg.pushManager.getSubscription();
    })
    .then(function(sub) {
      if (sub === null) {
        //we need to create a subscription
        var pubkey = 'BDui3XmS-VxBFTLMxLK3GPgW0BIdJSVlvXQR-6v--kHisyNz2Os2hOZUVPIyrljgQ7CbZBAsNov1oUX9AsYVOLw';
        var convertedkey = urlB64ToUint8Array(pubkey);
        return reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedkey
        });
      } else {
        // subscription already there!
        console.log("no sub needed");
      }
    })
     .then(function(newSub) {
       console.log("before POST");
       return fetch('https://serviceworker-f7f4f.firebaseio.com/subscription.json', {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
           'Accept': 'application/json'
         },
         body: JSON.stringify(newSub)
       })
     })
     .then(function(res) {
      if (res.ok) {
        console.log('success OK');
        displayPermissionGranted();
      }
     })
     .catch(function(err) {
       console.log(err);
     });
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
