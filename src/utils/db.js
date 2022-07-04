import Dexie from 'dexie'

export const db = new Dexie('myDatabase')
db.version(1).stores({
  // , // Primary key and indexed props
  water: '++id, time',
  wc: '++id, time'
})
