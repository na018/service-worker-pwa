const shareImageButton = document.getElementById('share-image-button')
const closeCreatePostModalButton = document.getElementById('close-create-post-modal-btn')
const createPostArea = document.getElementById('create-post')
const sharedMomentsArea = document.querySelector('#shared-moments')
const postTitle = createPostArea.querySelector('#post-title')
const postText = createPostArea.querySelector('#post-text')
const form = createPostArea.querySelector('form')
const snackBar = document.getElementById('confirmation-toast')
const imgContainer = createPostArea.querySelector('#manual-image')
const uploadFile = imgContainer.querySelector('#imgPath-input')
const imgInput = imgContainer.querySelector('#imgPath')
let postImg = null //'gs://serviceworker-f7f4f.appspot.com/peach_small_1.jpg'

function openCreatePostModal() {
  createPostArea.style.transform = 'translateY(0)'
  if (deferredPrompt) {
    deferredPrompt.prompt()

    deferredPrompt.userChoice.then(function(choiceResult) {
      console.log(choiceResult.outcome)

      if (choiceResult.outcome === 'dismissed') {
        console.log('User cancelled installation')
      } else {
        console.log('User added to home screen')
      }
    })

    deferredPrompt = null
  }
}

function closeCreatePostModal() {
  createPostArea.style.transform = 'translateY(100vh)'
}
FastClick.attach(shareImageButton)
shareImageButton.addEventListener('click', openCreatePostModal)

FastClick.attach(closeCreatePostModalButton)
closeCreatePostModalButton.addEventListener('click', closeCreatePostModal)

function clearCards() {
  while (sharedMomentsArea.hasChildNodes()) {
    sharedMomentsArea.removeChild(sharedMomentsArea.lastChild)
  }
}
// unregister service worker
/*if('serviceWorker' in navigator){
  navigator.serviceWorker.getRegistration()
    .then(function (registrations) {
      registrations.forEach(reg => {reg.unregister()})
    })
}*/
// cache on demand (currently not in use)
function onSaveBtnClicked(e) {
  if('caches' in window){
    caches.open('user-requested')
      .then(function (cache) {
        cache.add('https://serviceworker-f7f4f.firebaseio.com/posts.json')
      })
  }

}

function createCard(data) {
  var cardWrapper = document.createElement('div')
  cardWrapper.setAttribute('id', 'card-'+data.dbId)
  cardWrapper.className = 'shared-moment-card mdl-card mdl-shadow--2dp mdl-cell--4-col'

  var cardTitleTextElement = document.createElement('span')
  cardTitleTextElement.className = 'card-title'
  cardTitleTextElement.textContent = data.title
  cardWrapper.appendChild(cardTitleTextElement)

  var cardTitle = document.createElement('div')
  cardTitle.className = 'mdl-card__title'
  cardTitle.style.backgroundImage = 'url(' + data.imgPath + ')'
  cardTitle.style.backgroundSize = 'cover'
  cardTitle.style.height = '180px'
  cardWrapper.appendChild(cardTitle)

  var cardSupportingText = document.createElement('div')
  cardSupportingText.className = 'mdl-card__supporting-text'
  cardSupportingText.textContent = data.text

  var deleteIconBtn = document.createElement('button')
  deleteIconBtn.className = 'mdl-button mdl-js-button mdl-button--icon deleteBtn'
  deleteIconBtn.setAttribute('title', `delete card [${data.title}]`)
  var deleteIcon = document.createElement('i')
  deleteIcon.className = 'material-icons'
  deleteIcon.textContent = 'delete'

  deleteIconBtn.appendChild(deleteIcon)
  FastClick.attach(deleteIconBtn)
  deleteIconBtn.addEventListener('click',deleteCard.bind(null,event,data))

  cardTitleTextElement.appendChild(deleteIconBtn)
/*  var cardSaveBtn = document.createElement('button')
  cardSaveBtn.textContent = 'save'
  cardSaveBtn.addEventListener('click', onSaveBtnClicked)
 cardSupportingText.appendChild(cardSaveBtn)
  */

  cardSupportingText.style.textAlign = 'center'
  cardWrapper.appendChild(cardSupportingText)


/*  componentHandler.upgradeElement(cardWrapper)*/
  sharedMomentsArea.appendChild(cardWrapper)
}
function removeCardFromDOM(dbId) {
  let delItem = sharedMomentsArea.querySelector(`#card-${dbId}`)
  sharedMomentsArea.removeChild(delItem)

}

var url =  'https://serviceworker-f7f4f.firebaseio.com/posts.json'
var networkDataReceived = false
fetch(url)
  .then(function (res) {
    return res.json()
  })
  .then(function (data) {
    networkDataReceived = true
    clearCards()
    console.log('from web', data)
    for (let key in data) {
      data[key].dbId = key
      createCard(data[key])
    }
  })
if('indexedDB' in window) { //if('caches' in window)
  /*caches.match(url)
    .then(function (response) {
      if(response)
        return response.json()
    })
    .then(function (data) {
      console.log('from cache', data)
      clearCards()
      if(!networkDataReceived && data) {
        for (let post of Object.values(data)) {
          createCard(post)
        }
      }
    })*/
  console.log('create cards')
  readAllData('posts')
    .then(function (data) {
      if (!networkDataReceived) {
        console.log('from cache', data)
        for (let post of Object.values(data)) {
          createCard(post)
        }
        console.log(data)
      }
    })
}
function deleteCard(e,card) {
  removeCardFromDOM(card.dbId)
  let url = `https://us-central1-serviceworker-f7f4f.cloudfunctions.net/deletePostData?id=${card.dbId}`
  fetch(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }
  })
    .then((message)=>{
      console.log(message)
      deleteItemFromData('posts', card.id)

    })
    .catch((err)=> {console.log(err)})
}

/*(async () => {
  try {
    const data = await (await fetch(
      'https://serviceworker-f7f4f.firebaseio.com/posts.json'
    )).json()
    console.log('from web', data)
    clearCards()
    for (let post of Object.values(data)) {
      createCard(post)
    }
  } catch (e) {
    console.log('NO WORRIES 👌', e)
    const data = await readAllData('posts')
    console.log('From cache', data)
    clearCards()
    data.forEach(post => createCard(post))
  }
})()*/

/*async function sendData(e) {
  const res = await fetch(
    'https://us-central1-pwa-gram-358d7.cloudfunctions.net/storePostData',
    {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({
        id: new Date().toISOString(),
        title: form.title.value,
        location: form.location.value,
        image:
          'https://firebasestorage.googleapis.com/v0/b/pwa-gram-358d7.appspot.com/o/IMG_2970.JPG?alt=media&token=b0f77615-c129-46c0-9b13-5cecc0214b33',
      }),
    }
  )
  console.log('Send data', await res.json())
}*/

function sendData() {

  let id = Date.now()
  let img = () => {
    if(!postImg) {
      if(!imgInput.value){
        return 'https://firebasestorage.googleapis.com/v0/b/serviceworker-f7f4f.appspot.com/o/posts%2Fprincess.png?alt=media&token=22faf762-1fea-4551-b6c4-70061b041d81'
      }else{
        return imgInput.value
      }
    }else {
      return postImg
    }

  }
  console.log(img())
  const newCard = {
    id : id,
    title: postTitle.value,
    text: postText.value,
    imgPath: img()
  }
  fetch('https://us-central1-serviceworker-f7f4f.cloudfunctions.net/storePostData', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(newCard)
  })
    .then(function (res) {
      console.log('sent data', res)
      createCard(newCard)
      closeCreatePostModal()
      let data = {message: 'Your Post was saved for syncing!'}
      snackBar.MaterialSnackbar.showSnackbar(data)
    })
}
FastClick.attach(form)
form.addEventListener('submit', function (e) {
  e.preventDefault()
  if(postTitle.value.trim() === '' || postText.value.trim() === '') {
    alert('Please enter valid data!')
  } else {
    if('serviceWorker' in navigator && 'SyncManager' in window) {
      navigator.serviceWorker.ready
        .then(function (sw) {
          let img = () => {
            if(!postImg) {
              if(!imgInput.value){
                return 'https://firebasestorage.googleapis.com/v0/b/serviceworker-f7f4f.appspot.com/o/posts%2Fprincess.png?alt=media&token=22faf762-1fea-4551-b6c4-70061b041d81'
              }else{
                return imgInput.value
              }
            }else {
              return postImg
            }
          }
          var post = {
            id: Date.now(),
            title: postTitle.value,
            text: postText.value,
            imgPath:img()
          }
          createCard(post)
          writeData('sync-posts', post)
            .then(function () {
              return sw.sync.register('sync-new-posts')
            })
            .then(function () {
              closeCreatePostModal()
              let data = {message: 'Your Post was saved for syncing!'}
              snackBar.MaterialSnackbar.showSnackbar(data)
            })
            .catch(function (err) {
              console.log(err)
            })
        })
    } else {
      sendData()
    }
  }
})
/*form.addEventListener('submit', async e => {
  e.preventDefault()
  if (!form.title.value.trim() || !form.location.value.trim()) return

  closeCreatePostModal()

  if ('SyncManager' in window) {
    const sw = await navigator.serviceWorker.ready
    const newPost = {
      id: new Date().toISOString(),
      title: form.title.value,
      location: form.location.value,
    }
    try {
      await writeData('sync-posts', newPost)
      sw.sync.register('sync-new-posts')
      const snackbar = document.querySelector('#confirmation-toast')
      const data = { message: 'Your post was saved for syncing' }
      snackbar.MaterialSnackbar.showSnackbar(data)
    } catch (e) {
      console.log('Error writing data ❌', e)
    }
  } else {
    sendData()
  }
})*/
