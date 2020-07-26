import * as functions from 'firebase-functions'
const admin = require('firebase-admin')
const line = require('@line/bot-sdk')

admin.initializeApp(functions.config().firebase)
export const firestore = admin.firestore()

// interface MessageTypes {
//   before: any
//   after: any
// }

/**
 * LINE Bot
 *
 */
const client = new line.Client({
  channelAccessToken: functions.config().linebot.channel_access_token,
  channelSecret: functions.config().linebot.channel_secret,
})

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

const sendPushNotification = function (
  token: string,
  title: string,
  body: string,
  badge: string
) {
  const payload = {
    notification: {
      title: title,
      body: body,
      badge: badge,
      sound: 'default',
    },
  }
  admin
    .messaging()
    .sendToDevice(token, payload)
    .then(function (response: any) {
      // See the MessagingDevicesResponse reference documentation for
      // the contents of response.
      console.log('Successfully sent message:', response)
    })
    .catch(function (error: any) {
      console.log('Error sending message:', error)
    })
}

export const createMessage = functions
  .region('asia-northeast1')
  .firestore.document('/shoppinglist/{message}')
  .onWrite(async (change, context) => {
    let receiverRef, senderName: any, content: any
    let message: any
    if (change.before.exists && change.after.exists) {
      console.log('変更された')
      message = change.after.data()
    } else if (!change.after.exists) {
      console.log('削除された')
      // @ts-ignore
      message = change.before.data()
      receiverRef = firestore.collection('users').doc(message.name)
      senderName = message.name
      content = `${message.title}を買ったみたい!`
    } else {
      // @ts-ignore
      console.log('作成された', change.after.data())
      // @ts-ignore
      message = change.after.data()
      // @ts-ignore
      receiverRef = firestore.collection('users').doc(message.name)
      senderName = message.name
      content = `${message.title}を欲しいみたい!`
    }

    console.log('createFunctions', message)

    // 受信者の情報にアクセスする
    receiverRef
      .get()
      .then((doc: any) => {
        if (doc.exists === true) {
          // 受信者の情報を取得(name,fcmToken)
          const receiver = doc.data()
          const fcmToken = receiver['fcmToken']

          // 通知のタイトル
          const title = `${senderName}`
          // 通知の内容
          const body = content
          sendPushNotification(fcmToken, title, body, '1')
          console.log('newMessage')

          const message_to_line = {
            type: 'text',
            text: `${senderName}さんが${content}`,
          }

          // https://line.github.io/line-bot-sdk-nodejs/api-reference/client.html#methods
          client
            .pushMessage(
              functions.config().linebot.post_message_to,
              message_to_line
            )
            .then((res: any) => {
              console.log('line send OK', res)
            })
            .catch((err: any) => {
              console.log('line send NG', err)
            })
        } else {
          console.log('notExists')
        }
      })
      .catch((error: any) => {
        console.log('errorがおきました: ', error)
      })
  })

// https://ruller.lsv.jp/?p=72
// exports.line = functions.https.onRequest((request, response) => {
//   const body = request.body
//   const events = body.events

//   for (let event of events) {
//     const { replyToken, type, message } = event
//     let tmpMessage
//     if (type == 'message') {
//       if (message.type == 'text') {
//         console.log(message.text)

//         const regex = /['欲しいもの'|'ほしいもの']/g
//         if (message.text.exec(regex)) {

//           tmpMessage = {
//             type: 'text',
//             text: message.text,
//           }
//         } else {
//           tmpMessage = {
//             type: 'text',
//             text: message.text,
//           }
//         }

//         client.replyMessage(replyToken, tmpMessage).then(() => {
//           response.status(200).send('OK')
//         })
//       }
//     }
//   }
// })
