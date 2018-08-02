const functions = require('firebase-functions')
const admin = require('firebase-admin')
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//

var serviceAccount = require("./pk.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://serviceworker-f7f4f.firebaseio.com"
});
var cors = require('cors')({ origin: true })
var webpush = require('web-push'); // benötigt um mit vapid-key Verfahren Nachrichten senden zu können

exports.storePostData = functions.https.onRequest(function (request, response) { // Funktion welche aufgerufen wird, sobald ein Upload durch ein Benutzer veranlasst wird
  console.log(request.url)
  cors(request, response, function () {
    admin
    .database()
    .ref('posts')
    .push({
      id: request.body.id,
      title: request.body.title,
      text: request.body.text,
      imgPath: request.body.imgPath,
    })
      .then(function () { // Vapid Private Key hinterlegen damit Server Nachrichten an Subscriptions senden zu dürfen
        webpush.setVapidDetails('mailto:testmail@testmailcom.de','BDui3XmS-VxBFTLMxLK3GPgW0BIdJSVlvXQR-6v--kHisyNz2Os2hOZUVPIyrljgQ7CbZBAsNov1oUX9AsYVOLw','jkoneTbTLssrpyoTpbx1BYJCjkBHvhWMSY3wuAfdvjQ');
        return admin.database().ref('subscription').once('value'); // db abfrage um subscriptions abzugreifen
      })
      .then(function (subscriptions) { // alle vorhandenen subscriptions des backends
        subscriptions.forEach(function (sub) { // aufbereiten der notwendingen geschachtelten elemente
          var pushConfig = { // Web-Push Config Objekt anlegen mit dem Push-Nachricht später versendet  wird
            endpoint: sub.val().endpoint, //Push-Server URL der Browser-Hersteller speichern
            keys: {
              auth: sub.val().keys.auth,
              p256dh: sub.val().keys.p256dh
            }
          };

          webpush.sendNotification(pushConfig, JSON.stringify({
            title: 'New Image Upload',
            content: 'Hi, it seems there is a new image in the example app',
            openUrl: '/' // welche url soll göffnet werden?
          })) // web-push config mit geben + Push-Notification Payload der Nachricht
            .catch(function(err) { // Fehler anzeigen wenn vorhanden
              console.log(err);
            })
        });
        response.status(201).json({message: 'Data stored', id: request.body.id});
      })
      .catch(function (err) {
        response.status(500).json({error: err});
      });
  });
});

exports.deletePostData = functions.https.onRequest((request, response) => {
  console.log(request.query)
  console.log(request)
  console.log('request')
  var key = request.query.id;
  var sn
  cors(request, response, function() {
    var ref = admin.database().ref("posts");
    ref.orderByChild("id").equalTo(request.query.id).on("child_added", function(snapshot) {
      console.log(snapshot.key);
      key = snapshot.key
      sn = snapshot
    });
    admin
      .database()
      .ref('posts/'+key)
      .remove()
      .then(() => {
        response.status(201).json({
          message: 'Data deleted',
          id: key,
          snapshot: sn,
          test: 'test'
        })
      })
      .catch(err => {
        response.status(500).json({
          error: err,
        })
      })
  })
})
exports.helloWorld = functions.https.onRequest((req, res) => {
  res.send("Hello from Firebase!");
});

exports.insertIntoDB = functions.https.onRequest((req, res) => {
  const text = req.query.text;
  admin.database().ref('/test').push({text: text}).then(snapshot => {
    res.redirect(303, snapshot.ref);
  })
});
exports.convertToUppercase = functions.database.ref('/test/{pushId}/text').onWrite(event => {
  const text = event.data.val();
  const uppercaseText = text.toUpperCase();
  return event.data.ref.parent.child('uppercaseText').set(uppercaseText);
});
