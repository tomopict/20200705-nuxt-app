export const dateToStringJa = (date: Date) => {
  return date.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })
}
