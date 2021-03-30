const firebase = require('firebase')
firebase.initializeApp({
    apiKey: process.env.FIRESTORE_API_KEY,
    appId: process.env.FIRESTORE_APP_ID,
    authDomain: process.env.FIRESTORE_AUTH_DOMAIN,
    databaseURL: process.env.FIRESTORE_DATABASE_URL,
    messagingSenderId: process.env.FIRESTORE_MESSAGING_SENDER_ID,
    projectId: process.env.FIRESTORE_PROJECT_ID,
    storageBucket: process.env.FIRESTORE_STORAGE_BUCKET,
})
const db = firebase.firestore().collection('systems')

exports.getAll = () => db.get()

exports.getWebsite = url => db.where('url', '==', url).get()

exports.insert = (url, isHttps) => db.add({
    createdAt: firebase.firestore.Timestamp.fromDate(new Date()),
    downCycles: 0,
    isHttps,
    totalCycles: 0,
    upCycles: 0,
    url,
})

exports.remove = id => db.doc(id).delete()

exports.update = (id, values) => {
    values.updatedAt = firebase.firestore.Timestamp.fromDate(new Date())

    db.doc(id).update(values)
}
