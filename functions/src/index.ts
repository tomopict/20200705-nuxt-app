import * as functions from 'firebase-functions'
const admin = require('firebase-admin')
admin.initializeApp(functions.config().firebase)
export const firestore = admin.firestore()

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
  .onCreate(async (snapshot, context) => {
    // ここにmessageのデータが入っている(senderId,senderName,receiverId,content)
    const message = snapshot.data()
    console.log('createFunctions', message)
    const receiverRef = firestore.collection('users').doc(message.name)

    console.log('receiverRef', receiverRef)

    // 受信者の情報にアクセスする
    receiverRef
      .get()
      .then((doc: any) => {
        if (doc.exists === true) {
          // 受信者の情報を取得(name,fcmToken)
          const receiver = doc.data()
          const fcmToken = receiver['fcmToken']
          const senderName = message.name
          const content = message['title']
          // 通知のタイトル
          const title = `${senderName}`
          // 通知の内容
          const body = `${content}が作成されました`
          sendPushNotification(fcmToken, title, body, '1')
          console.log('newMessage')
        } else {
          console.log('notExists')
        }
      })
      .catch((error: any) => {
        console.log('errorがおきました: ', error)
      })
  })
