require('./config/config')
const express = require('express')
const mongoose = require('mongoose');
const app = express()
const bodyParser = require('body-parser')
const path = require('path')

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// Routes global
app.use(require('./routes/index'))

// Available public path
app.use( express.static( path.resolve(__dirname, '../public')) )

mongoose.connect(process.env.URLDB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
}, (err, res) => {
    if (err) throw err

    console.log('Connection established');
});

app.listen(process.env.PORT, () => {
    console.log('executing server in port ' + process.env.PORT)
})