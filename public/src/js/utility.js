const dbPromise = idb.open('posts-store', 1, function(db) {
  if (!db.objectStoreNames.contains('posts')) {
    db.createObjectStore('posts', { keyPath: 'id' })
  }
  if (!db.objectStoreNames.contains('sync-posts')) {
    db.createObjectStore('sync-posts', { keyPath: 'id' })
  }
})

function writeData(st, data) {
  return dbPromise
    .then(function (db) {
      var tx = db.transaction(st, 'readwrite')
      var store = tx.objectStore(st)
      console.log('writealldata')

      console.log('write data in db ', data)
      store.put(data)
      return tx.complete
    })
}

function readAllData(st) {
  console.log('readalldata ----')
  return dbPromise
    .then(function (db) {
      var tx = db.transaction(st, 'readonly')
      var store = tx.objectStore(st)
      return store.getAll()
    })
}
function clearAllData (st) {
  return dbPromise
    .then(function (db) {
      var tx = db.transaction(st, 'readwrite')
      var store = tx.objectStore(st)
      console.log('clearalldata')
      store.clear()
      return tx.complete
    })
}

function deleteItemFromData(st, id) {
  return dbPromise
    .then(function (db) {
      var tx = db.transaction(st, 'readwrite')
      var store = tx.objectStore(st)
      store.delete(id)
      return tx.complete
    })
    .then(function () {
      console.log('Item deleted')
    })
}

async function clearAllData2(st) {
  const db = await dbPromise
  const tx = db.transaction(st, 'readwrite')
  const store = tx.objectStore(st)
  store.clear()
  return tx.complete
}

async function deleteItemFromData2(st, id) {
  const db = await dbPromise
  const tx = db.transaction(st, 'readwrite')
  const store = tx.objectStore(st)
  store.delete(id)
  await tx.complete
  console.log('Item deleted!')
}

function urlB64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
