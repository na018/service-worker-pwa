# Service Worker Investigation
* readme must be updated
* push notifications would be nice to have implemented
* image is currently uploaded via base64 -> should be uploaded to firebase storage and only the link stored in db

````
// run code
node server.js

// if you want to use npm in docker you need dockerCE and docker-compose for mac
// simply execute in shell:
./start.sh and follow the menu! (if you need to remove a container see docker documentation!)
````
!Beware the Firebase API-Key and the notification-vapidkeys are not stored in the git repo!
!To store new subscriptions in Firebase you have to adjust the rules to write "true" of the realtimedatabase!

I added the vapid key into the github repo. As this is a test application we could ignore this case. Only demousers are susbcribed for test purposes. 
