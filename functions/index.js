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
var webpush = require('web-push');



let upload = (imgName, imgBlob, cb) => {
  var storageRef = admin.storage().ref('/posts' + '/'+imgName);
  var uploadTask = storageRef.put(imgBlob)

  uploadTask.on('state_changed', function (snapshot) {
    // Observe state change events such as progress, pause, and resume
    // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
    var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
    console.log('Upload is ' + progress + '% done');
    switch (snapshot.state) {
      case admin.storage.TaskState.PAUSED: // or 'paused'
        console.log('Upload is paused');
        break;
      case admin.storage.TaskState.RUNNING: // or 'running'
        console.log('Upload is running');
        break;
    }
  }, function (error) {
    // Handle unsuccessful uploads
  }, function () {
    // Handle successful uploads on complete
    // For instance, get the download URL: https://firebasestorage.googleapis.com/...
    uploadTask.snapshot.ref.getDownloadURL().then(function (downloadURL) {
      console.log('File available at', downloadURL);
      cb(downloadURL)
    })
  })
}
exports.storePostData = functions.https.onRequest(function (request, response) {
  console.log(request.url)
  console.log(request.body)
  console.log('storePostData')
  cors(request, response, function () {
    let imgPath = ""
    if (request.body.postBlob) {
      var storageRef = admin.storage().ref('/posts' + '/' + request.body.imgPath);
      upload(storageRef, request.body.postBlob, function (imgName) {
        imgPath = imgName
        postData()
      })
    } else {
      imgPath = request.body.imgPath
      postData()
    }

    let postData = () => {
      console.log('Hello World')
      console.log(imgPath)
      admin
        .database()
        .ref('posts')
        .push({
          id: request.body.id,
          title: request.body.title,
          text: request.body.text,
          imgPath: imgPath,
        })
        .then(() => {
          response.status(201).json({
            message: 'Data stored',
            id: request.body.id,
          })
        })
        .catch(err => {
          response.status(500).json({
            error: err,
          })
        })
    }
  })
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
