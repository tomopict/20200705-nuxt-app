import * as functions from 'firebase-functions'
const admin = require('firebase-admin')
export const firestore = admin.firestore()
const linebot = require('@line/bot-sdk')
/**
 * LINE Bot
 */
const client = new linebot.Client({
  channelAccessToken: functions.config().linebot.channel_access_token,
  channelSecret: functions.config().linebot.channel_secret,
})

const sendPushNotification = function (
  token: string,
  title: string,
  body: string,
  badge: string
) {
  const payload = {
    notification: {
      title,
      body,
      badge,
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
      if (!message.name) {
        message.name = '名無し'
      }
      receiverRef = firestore.collection('users').doc(message.name)
      senderName = message.name
      content = `${message.title}を買ったみたい!`
    } else {
      console.log('作成された', change.after.data())
      message = change.after.data()
      if (!message.name) {
        message.name = '名無し'
      }
      receiverRef = firestore.collection('users').doc(message.name)
      senderName = message.name
      content = `${message.title}を欲しいみたい!`
      console.log(receiverRef, content)
    }

    // 受信者の情報にアクセスする
    receiverRef
      .get()
      .then((doc: any) => {
        if (doc.exists === true) {
          // 受信者の情報を取得(name,fcmToken)
          const receiver = doc.data()
          const fcmToken = receiver.fcmToken

          // 通知のタイトル
          const title = `${senderName}`
          // 通知の内容
          const body = content
          sendPushNotification(fcmToken, title, body, '1')
          console.log('newMessage')

          const messageToLine = {
            type: 'text',
            text: `${content}`,
          }

          // https://line.github.io/line-bot-sdk-nodejs/api-reference/client.html#methods
          client
            .broadcast(messageToLine)
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
      .catch((e: any) => {
        console.log('errorがおきました: ', e)
      })
  })
