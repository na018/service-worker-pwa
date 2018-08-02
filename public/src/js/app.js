
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
      body: 'You successfully subscribed to the Notification service!',
      icon: '/src/images/icons/app-icon-96x96.png',
      image: '/src/images/sf-boat.jpg',
      dir: 'ltr', // Ausrichtung des Texts left to right
      lang: 'en-DE', // BCP 47 Kodierung
      vibrate: [100, 50, 200], // Mobile Endgeräte in MS Vib-Dauer, pause, Vibrations
      badge: '/src/images/icons/app-icon-96x96.png', // Android TopToolbar Icon
      actions: [ // zusatz feature was passieren soll bei click auf notification mit buttons
        { action: 'confirm', title: 'Okay', icon: '/src/images/icons/app-icon-96x96.png' },
        { action: 'cancel', title: 'Cancel', icon: '/src/images/icons/app-icon-96x96.png' }
      ]
    };

    navigator.serviceWorker.ready // service worker ist bereit?
      .then(function(swreg) { // wenn ja zeige Notication durch SW
        swreg.showNotification('Successfully subscribed! from SW', options);
      });
  }
}

function configurePushSub() {
  if (!('serviceWorker' in navigator)) { // wenn kein sw vorhanden, nichts unternehmen!
    return;
  }

  var reg;
  navigator.serviceWorker.ready // ist sw bereit?
    .then(function(swreg) {
      reg = swreg;
      return swreg.pushManager.getSubscription(); //liefert subscription
    })
    .then(function(sub) {
      if (sub === null) { // wenn keine subcription vorhanden, weiter und eine anlegen
        // vapid Keys definieren für PK Verfahren (zuvor durch web-push package generiert und kopiert!)
        var vapidPublicKey = 'BDui3XmS-VxBFTLMxLK3GPgW0BIdJSVlvXQR-6v--kHisyNz2Os2hOZUVPIyrljgQ7CbZBAsNov1oUX9AsYVOLw';
        var convertedVapidPublicKey = urlBase64ToUint8Array(vapidPublicKey); // Hilfsfunktion zum konvertieren des URLb64Keys in int8Array
        return reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidPublicKey // subscription des endgeräts
        });
      } else {
        // subscription ist bereits vorhanden.
        console.log('Subscription is allready there:', sub);
      }
    })
    .then(function(newSub) { // subscription muss an Firebase Backend gesendet und gespeichert werden durch POST
      return fetch('https://serviceworker-f7f4f.firebaseio.com/subscription.json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(newSub)
      })
    })
    .then(function(res) { // hat es geklappt im backend zu speichern?
      if (res.ok) {
        displayConfirmNotification();
      }
    })
    .catch(function(err) { // wenn irgendein Fehler in dieser Funktion auftaucht, hier anzeigen
      console.log(err);
    });
}

function askForNotificationPermission() {
  Notification.requestPermission(function(result) {
    console.log('User Choice', result);
    if (result !== 'granted') {
      console.log('No notification permission granted!');
    } else {
      configurePushSub(); // Benutzer hat Genehmigung für Notifications erteilt und wird darauf vorbereitet auch Push-Nachrichten empfangen zu können (später dazu mehr)
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
