import * as functions from 'firebase-functions'
const admin = require('firebase-admin')
admin.initializeApp(functions.config().firebase)

const ssr = require('./ssr')
const line = require('./line')
const createMessage = require('./create-message')

exports.ssr = ssr.ssr
exports.line = line.line
exports.createMessage = createMessage.createMessage
