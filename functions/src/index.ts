import * as functions from 'firebase-functions'
const admin = require('firebase-admin')
admin.initializeApp(functions.config().firebase)

const line = require('./line')
const createMessage = require('./create-message')

exports.line = line.line
exports.createMessage = createMessage.createMessage
