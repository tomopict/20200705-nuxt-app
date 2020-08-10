import * as functions from 'firebase-functions'
const admin = require('firebase-admin')
export const firestore = admin.firestore()

const linebot = require('@line/bot-sdk')

interface tmpMessageFace {
  type: string
  text: string
}

/**
 * LINE Bot
 */
const client = new linebot.Client({
  channelAccessToken: functions.config().linebot.channel_access_token,
  channelSecret: functions.config().linebot.channel_secret,
})

async function handleClientReply(
  replyToken: string,
  tmpMessage: tmpMessageFace,
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

// https://ruller.lsv.jp/?p=72
exports.line = functions
  .region('asia-northeast1')
  .https.onRequest(async (request, response) => {
    const body = request.body
    const events = body.events
    const shoppingRef = firestore.collection('shoppinglist')
    const dailyRef = firestore.collection('dailynecessaries')

    for (let event of events) {
      const { replyToken, type, message } = event
      let tmpText: string = ''
      if (type == 'message') {
        if (message.type == 'text') {
          let tmpMessage: tmpMessageFace
          const regex = {
            want: /欲しいもの|ほしいもの/g,
            daily: /いつもの/g,
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
          } else if (message.text.match(regex.daily)) {
            console.log('日用品')

            try {
              const querySnapshot = await dailyRef
                .where('status', '==', true)
                .get()

              if (!querySnapshot.size) {
                tmpText = '今は何もないみたい!'
              } else {
                querySnapshot.forEach((doc: any) => {
                  tmpText += `${doc.data().label}\n`
                })
                tmpText += 'が欲しいみたいだよ!'
              }
            } catch (err) {
              console.error('Error daily document: ', err)
              response.status(400).send('NG')
            } finally {
              console.log('Done deleted')
              tmpMessage = {
                type: 'text',
                text: tmpText,
              }
            }
            await handleClientReply(replyToken, tmpMessage, response)
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
