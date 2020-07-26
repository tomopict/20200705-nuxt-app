import * as functions from 'firebase-functions'
const admin = require('firebase-admin')
const line = require('@line/bot-sdk')

admin.initializeApp(functions.config().firebase)
export const firestore = admin.firestore()

/**
 * LINE Bot
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
    console.log('createMessage init', context)

    let receiverRef, senderName: string, content: string
    let message: any
    if (change.before.exists && change.after.exists) {
      console.log('変更された')
      message = change.after.data()
    } else if (!change.after.exists) {
      console.log('削除された')
      message = change.before.data()
      receiverRef = firestore.collection('users').doc(message.name)
      senderName = message.name
      content = `${message.title}を買ったみたい!`
    } else {
      console.log('作成された', change.after.data())
      message = change.after.data()
      receiverRef = firestore.collection('users').doc(message.name)
      senderName = message.name
      content = `${message.title}を欲しいみたい!`
    }

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
            text: `${content}`,
          }

          // https://line.github.io/line-bot-sdk-nodejs/api-reference/client.html#methods
          client
            .broadcast(message_to_line)
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
exports.line = functions
  .region('asia-northeast1')
  .https.onRequest((request, response) => {
    const body = request.body
    const events = body.events

    for (let event of events) {
      const { replyToken, type, message } = event
      let tmpMessage, tmpText: any
      if (type == 'message') {
        if (message.type == 'text') {
          console.log(message.text)

          // const regex = /'欲しいもの'|'ほしいもの'/g
          // if (message.text.match(regex)) {
          console.log('ありますね')

          // const shoppingRef = firestore
          //   .collection('shoppinglist')
          //   .doc('')

          // console.log('shoppingRefです')

          // shoppingRef
          // .where('display', '==', true)
          // .get()
          // .then(function (doc: any) {
          //   console.log(doc)

          //   // if (!querySnapshot.exists) {
          //   //   console.log('No such document!')
          //   //   tmpText = '今は何もないよ!'
          //   // } else {
          //   //   tmpText = 'あるよ!'
          //   //   // querySnapshot.forEach((doc: any) => {
          //   //   //   tmpText += `${doc.data().title}\n`
          //   //   // })
          //   // }
          //   tmpText = 'ですよ!'
          // })
          // .catch((err: any) => {
          //   console.log('Error getting document', err)
          // })
          tmpText = 'ですよ!'
          tmpMessage = {
            type: 'text',
            text: tmpText,
          }
          // } else {
          //   tmpMessage = {
          //     type: 'text',
          //     text: message.text,
          //   }
          // }

          client.replyMessage(replyToken, tmpMessage).then(() => {
            response.status(200).send('OK')
          })
        }
      }
    }
  })
