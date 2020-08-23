export type DailynecessariesList = {
  label: string
  lastPurchased?: string
  purchaseHistory: string | Array<firebase.firestore.Timestamp>
  status: boolean
  value: string
}

export type FormatedList = {
  title: string
  name: string
  createdAt: string | firebase.firestore.FieldValue
  display: boolean
  id?: string
}
