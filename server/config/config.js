// ==================
// PORT
// ==================
process.env.PORT = process.env.PORT || 3000

// ==================
// Enviroment
// ==================
process.env.NODE_ENV = process.env.NODE_ENV || 'dev'


// ==================
// Autenticate vars
// ==================
process.env.EXP_TOKEN = 60 * 60 * 24 * 30
process.env.SEED_TOKEN = process.env.SEED_TOKEN || 'seed-desa-token'

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
