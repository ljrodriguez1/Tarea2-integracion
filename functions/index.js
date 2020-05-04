const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);
let db = admin.firestore();

const ingrediente = require('./ingrediente.js');
const hamburguesa = require('./hamburguesa.js');


exports.ingrediente = functions.https.onRequest(async (req, res) => {
  ingrediente.handler(req, res, db);
});

exports.hamburguesa = functions.https.onRequest(async (req, res) => {
  hamburguesa.handler(req, res, db);
});
// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//



