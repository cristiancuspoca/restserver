// ==================
// PORT
// ==================
process.env.PORT = process.env.PORT || 3000

// ==================
// Enviroment
// ==================
process.env.NODE_ENV = process.env.NODE_ENV || 'dev'

// ==================
// String connect db
// ==================
let stringConnectDB
if (process.env.NODE_ENV == 'dev') {
    stringConnectDB = 'mongodb://localhost:27017/cafe'
} else {
    stringConnectDB = process.env.MONGO_URL
}
process.env.URLDB = stringConnectDB
