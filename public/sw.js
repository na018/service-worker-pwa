importScripts('/src/js/idb.js')
importScripts('/src/js/utility.js')
/*importScripts('/src/js/utility.js')*/

let CACHE_STATIC_NAME = 'static-v2'
let CACHE_DYNAMIC_NAME = 'dynamic-v2'
var STATIC_FILES =
  ['/',
    '/index.html',
    '/offline.html',
    '/src/js/app.js',
    '/src/js/fastClick.js',
    '/src/js/feed.js',
    '/src/js/utility.js',
    '/src/js/idb.js',
    '/src/js/material.min.js',
    '/src/css/app2.css',
    '/src/css/feed.css',
    '/src/images/main-image.jpg',
    'https://fonts.googleapis.com/css?family=Roboto:400,700',
    'https://fonts.gstatic.com/s/materialicons/v37/flUhRq6tzZclQEJ-Vdg-IuiaDsNc.woff2',
    'https://fonts.googleapis.com/icon?family=Material+Icons',
    'src/css/material.blue-purple.min.css',

  ]

function trimCache(cacheName, maxItems) {
 /* caches.open(cacheName)
    .then(function (cache) {
      return cache.keys()
        .then(function (keys) {
          if(key.length>maxItems){
            cache.delete(keys[0])
              .then(trimCache(cacheName, maxItems))
          }
        })
    })*/
}
// no DOM access
self.addEventListener('install', function (event) {
  console.log('[Service Worker] Installing Service Worker ...', event)
  //installation event only finishes when caches.open is done
  event.waitUntil(
    caches.open(CACHE_STATIC_NAME)
      .then(function (cache) {
        console.log('[Service Worker] pre caching app shell') //here urls/ requests are cached
        console.log('add static cache')
        return cache.addAll(STATIC_FILES)
      }),
  )
})

self.addEventListener('activate', function (event) {
  console.log('[Service Worker] Activated Service Worker ...', event)
  // clean-up old versions
  event.waitUntil(
    //keys of all sub caches
    caches.keys()
      .then(function (keyList) {
        return Promise.all(keyList.map(function (key) {
          if (key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) {
            console.log('....deleted ....', key)
            return caches.delete(key)
          } else {
            console.log('....not deleted ....', key)
          }
        }))
      }),
  )
  return self.clients.claim()
})
function isInArr(string, arr) {
  for(var i = 0; i<arr.length; i++) {
    if (string === arr[i]) {
      // console.log('--. is equal --.`', arr[i], string)
      return true;
    }
  }
  // console.log('--. is not equal --.`', arr[i], string)
  return false
}

//full control about how to load the different resources
self.addEventListener('fetch', function (event) {
  var url = 'https://serviceworker-f7f4f.firebaseio.com/posts.json'
  // console.log(new RegExp('\\b' +STATIC_FILES.join('\\b|\\b')).test(event.request.url))
  // cache then network
  if (event.request.url.indexOf(url) > -1) {
    event.respondWith(
      caches.open(CACHE_DYNAMIC_NAME)
        .then(function (cache) {
          return fetch(event.request)
            .then(function (res) {
              trimCache(CACHE_DYNAMIC_NAME, 5)
              // cache.put(event.request, res.clone())
              var clonedRes = res.clone()
              clearAllData('posts')
                .then(function () {
                  return clonedRes.json()
                })
                .then(function (data) {
                  for (let key in data) {
                    data[key].dbId = key
                    writeData('posts', data[key])
                  }
                  // for(let post of Object.values(data)){

                   /* dbPromise
                      .then(function (db) {
                        var transAction = db.transaction('posts', 'readwrite')
                        var store = transAction.objectStore('posts')
                        store.put(post)
                        return transAction.complete
                      })*/
                  // }
                })
              return res
            })
        }),
    )
  } else if (isInArr(event.request.url, STATIC_FILES)) {
    // cache only strategy --. files that do not change

    console.log('cache only strategy')
    event.respondWith(
      caches.match(event.request),
    )
  } else {
    // cache with network fallback
    event.respondWith(
      caches.match(event.request)
        .then(function (response) {       //always use then, if not in cache -returns null
          if (response) {
            return response
          } else {
            // if not in cache fetch it
            return fetch(event.request)
              .then(function (res) { // res from server
                return caches.open(CACHE_DYNAMIC_NAME)
                  .then(function (cache) {
                    trimCache(CACHE_DYNAMIC_NAME, 5)
                    cache.put(event.request.url, res.clone()) // use res only once
                    return res
                  })
              })
              .catch(function (err) {
                console.log('oh no', err)
                return caches.open(CACHE_STATIC_NAME)
                  .then(function (cache) {
                    // respond to certain urls `don't show page if css cant be shown`
                    // any pre-cached file can be returned (e.g image)
                    if (event.request.headers.get('accept').includes('text/html')) {
                      console.log('yes')
                      return cache.match('/offline.html')
                    }
                  })
              })
          }

        }),
    )
  }
})
var url =  'https://serviceworker-f7f4f.firebaseio.com/posts.json'
self.addEventListener('sync', function (event) {
  console.log('[Service Worker] Background syncing', event)
  if(event.tag === 'sync-new-posts') {
    console.log('[Service Worker] Syncing new posts')
    event.waitUntil(
      readAllData('sync-posts')
        .then(function (data) {
          for(let card of Object.values(data)) {
            console.log(card)
            fetch('https://us-central1-serviceworker-f7f4f.cloudfunctions.net/storePostData', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
              },
              body: JSON.stringify(card)
            })
              .then(function (res) {
                console.log('sent data', res)
                if(res.ok){
                  res.json()
                    .then(function (resData) {
                      deleteItemFromData('sync-posts', resData.id)
                    })
                }
              })
              .catch(function (err) {
                console.log('Error while sending data',err)
              })
          }

        })
    )
  }
})

// self.addEventListener('notificationclick', function(event) {
//   var  notification = event.notification;
//   var action = event.action;
//   console.log('addEventListener called');
//   console.log(notification);
//   if (action === 'confirm') {
//     console.log('confirmed ');
//     notification.close();
//   } else {
//     console.log(action);
//     notification.close();
//
//   }
// });
self.addEventListener('notificationclick', function(event) {
  var notification = event.notification;
  var action = event.action;

  console.log(notification);

  if (action === 'confirm') {
    console.log('Confirm was chosen');
    notification.close();
  } else {
    console.log(action);
    event.waitUntil(
      clients.matchAll()
        .then(function(clis) {
          var client = clis.find(function(c) {
            return c.visibilityState === 'visible';
          });

          if (client !== undefined) {
            client.navigate(notification.data.url);
            client.focus();
          } else {
            clients.openWindow(notification.data.url);
          }
          notification.close();
        })
    );
  }
});
self.addEventListener('notificationclose', function(event) {
   console.log('notification was closed',event);

 });

 self.addEventListener('push', function(event) {
   console.log('Push Notification received', event);

   var data = {title: 'New!', content: 'Something new happened!', openUrl: '/'};

   if (event.data) {
     data = JSON.parse(event.data.text());
   }

   var options = {
     body: data.content,
     icon: '/src/images/icons/app-icon-96x96.png',
     badge: '/src/images/icons/app-icon-96x96.png',
     data: {
       url: data.openUrl
     }
   };

   event.waitUntil(
     self.registration.showNotification(data.title, options)
   );
 });
// network first then cache
/*self.addEventListener('fetch', function (event) {
 //console.log('[Service Worker] fetches something ...', event)
 //event.respondWith(fetch(event.request))
 event.respondWith(
 fetch(event.request)
 .then(function (res) {
 return caches.open(CACHE_DYNAMIC_NAME)
 .then(function (cache) {
 cache.put(event.request.url, res.clone())
 return res
 })
 })
 .catch(function (err) {
 return caches.match(event.request)
 }
 )
 )
 })*/
// cache then network
/*
 self.addEventListener('fetch', function (event) {
 //console.log('[Service Worker] fetches something ...', event)
 //event.respondWith(fetch(event.request))
 event.respondWith(
 caches.match(event.request)
 .then(function (response) {       //always use then, if not in cache -returns null
 if (response) {
 return response
 } else {
 // if not in cache fetch it
 return fetch(event.request)
 .then(function (res) { // res from server
 return caches.open(CACHE_DYNAMIC_NAME)
 .then(function (cache) {
 cache.put(event.request.url, res.clone()) // use res only once
 return res
 })
 })
 .catch(function (err) {
 return caches.open(CACHE_STATIC_NAME)
 .then(function (cache) {
 return cache.match('/offline.html')
 })
 })
 }
 }),
 )
 })
 */

// cache-only
/*self.addEventListener('fetch', function (event) {
 event.respondWith(
 caches.match(event.request)
 )
 })*/

//network only
/*self.addEventListener('fetch', function (event) {
 event.respondWith(
 fetch(event.request)
 )
 })*/
