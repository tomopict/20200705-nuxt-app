import * as functions from 'firebase-functions'
const admin = require('firebase-admin')
const line = require('@line/bot-sdk')

admin.initializeApp(functions.config().firebase)
export const firestore = admin.firestore()

interface tempMessage {
  type: string
  text: string
}
/**
 * LINE Bot
 */
const client = new line.Client({
  channelAccessToken: functions.config().linebot.channel_access_token,
  channelSecret: functions.config().linebot.channel_secret,
})

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

async function handleClientReply(
  replyToken: string,
  tmpMessage: tempMessage,
  response: functions.Response
) {
  try {
    await client.replyMessage(replyToken, tmpMessage)
    response.status(200).send('OK')
  } catch (e) {
    response.status(400).send('NG')
    console.log('Error getting document', e)
  } finally {
    console.log('done', tmpMessage)
  }
}
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
      .catch((e: any) => {
        console.log('errorがおきました: ', e)
      })
  })

// https://ruller.lsv.jp/?p=72
exports.line = functions
  .region('asia-northeast1')
  .https.onRequest(async (request, response) => {
    const body = request.body
    const events = body.events
    const shoppingRef = firestore.collection('shoppinglist')

    for (let event of events) {
      const { replyToken, type, message } = event
      let tmpText: string = ''
      if (type == 'message') {
        if (message.type == 'text') {
          let tmpMessage: tempMessage
          const regex = {
            want: /欲しいもの|ほしいもの/g,
            create: /欲しい|ほしい|追加/g,
            delete: /買った|かった|削除/g,
          }

          if (message.text.match(regex.want)) {
            try {
              const querySnapshot = await shoppingRef
                .where('display', '==', true)
                .get()

              if (!querySnapshot.size) {
                tmpText = '今は何もないみたい!'
              } else {
                querySnapshot.forEach((doc: any) => {
                  tmpText += `${doc.data().title}\n`
                })
                tmpText += 'が欲しいみたいだよ!'
              }
            } catch (err) {
              response.status(400).send('NG')
              console.error('Error getting document: ', err)
              tmpText = 'エラーがおきたみたい!'
            } finally {
              tmpMessage = {
                type: 'text',
                text: tmpText,
              }
            }
            await handleClientReply(replyToken, tmpMessage, response)
          } else if (message.text.match(regex.create)) {
            const title = message.text.replace(regex.create, '')
            const data = {
              title: title,
              name: '名無し',
              createdAt: admin.firestore.FieldValue.serverTimestamp(),
              display: true,
            }
            try {
              await shoppingRef.add(data)
              console.log('Document written with ID')
              response.status(200).send('Document written with ID')
            } catch (err) {
              console.error('Error written document: ', err)
              response.status(500).send('Error written document')
            } finally {
              console.log('Done created')
            }
          } else if (message.text.match(regex.delete)) {
            const title = message.text.replace(regex.delete, '')

            try {
              const querySnapshot = await shoppingRef
                .where('title', '==', title)
                .get()

              if (querySnapshot.size) {
                querySnapshot.forEach(async (doc: any) => {
                  try {
                    await shoppingRef.doc(doc.id).delete()
                    response.status(200).send('Document successfully deleted')
                    console.log('Document successfully deleted!')
                  } catch (err) {
                    response.status(500).send('Error removing document')
                    console.error('Error removing document: ', err)
                  } finally {
                    console.log('Done deleted')
                  }
                })
              } else {
                response.status(404).send('404 Not Found')
              }
            } catch (err) {
              console.error('Error delete document: ', err)
              response.status(400).send('NG')
            } finally {
              console.log('Done deleted')
            }
          } else {
            tmpMessage = {
              type: 'text',
              text: message.text,
            }

            await handleClientReply(replyToken, tmpMessage, response)
          }
        }
      }
    }
  })
